import os
import logging
import google.generativeai as genai
from google.api_core import exceptions as google_exceptions
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

# Basic logging configuration
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Determine the correct static folder path.
ANGULAR_DIST_DIR = os.path.join(os.path.dirname(__file__), 'angular-app', 'gemini-app', 'dist', 'gemini-app', 'browser')

if not os.path.exists(ANGULAR_DIST_DIR):
    logging.warning(f"Angular distribution directory not found at {ANGULAR_DIST_DIR}. Frontend may not be served.")

app = Flask(__name__, static_folder=ANGULAR_DIST_DIR, static_url_path='/')

# CORS configuration
frontend_url = os.environ.get('FRONTEND_URL')
# Fallback to allow localhost for development if FRONTEND_URL is not set
# and a wildcard for other cases if no specific frontend_url is provided (though less secure)
# For Render, FRONTEND_URL should be set in the environment.
cors_origins = []
if frontend_url:
    cors_origins.append(frontend_url)
else:
    logging.warning("FRONTEND_URL environment variable not set. CORS might not be optimally configured for production.")
    cors_origins.append("http://localhost:4200") # Default for local Angular dev
    # Consider if a broader fallback like "*" is needed and its security implications
    # For now, we'll stick to localhost if FRONTEND_URL is not set.

CORS(app, resources={r"/api/*": {"origins": cors_origins}})
logging.info(f"CORS configured for origins: {cors_origins}")


# --- Gemini API Configuration ---
API_KEY = os.getenv('GEMINI_API_KEY')
gemini_model = None
if not API_KEY:
    logging.warning("GEMINI_API_KEY environment variable not set. Using placeholder (will likely fail).")
    API_KEY = 'AIzaSyA5B-rRVPvaMcrkL3CUiVqwiSuS6LRKNOU' # Placeholder

if API_KEY and API_KEY != 'AIzaSyA5B-rRVPvaMcrkL3CUiVqwiSuS6LRKNOU':
    try:
        genai.configure(api_key=API_KEY)
        gemini_model = genai.GenerativeModel('gemini-pro')
        logging.info("Gemini API configured and model 'gemini-pro' loaded successfully.")
    except Exception as e:
        logging.exception(f"Critical error during Gemini API configuration or model initialization: {e}")
else:
    logging.error("Gemini API key is not set or is the placeholder. AI service will be unavailable.")


# --- Health Check Endpoint ---
@app.route('/health')
def health_check():
    # Basic health check, can be expanded (e.g., check DB connection, Gemini model status)
    if gemini_model:
        return jsonify({"status": "healthy", "gemini_model_initialized": True}), 200
    else:
        # Still healthy from Flask's perspective, but AI service might be down
        return jsonify({"status": "healthy", "gemini_model_initialized": False, "message": "AI service not available"}), 200


# --- API Routes ---
@app.route('/api/ask', methods=['POST'])
def ask_question():
    # (The rest of the /api/ask route remains the same as the previous version)
    if not gemini_model:
        logging.error("Attempted to call /api/ask but Gemini model is not available.")
        return jsonify({"error": "AI service is not configured or temporarily unavailable. Please contact support."}), 503

    if not request.is_json:
        logging.warning("Request to /api/ask was not JSON.")
        return jsonify({"error": "Request must be JSON"}), 415

    data = request.get_json()
    question = data.get('question')

    if not question:
        logging.warning("Missing 'question' field in /api/ask request.")
        return jsonify({"error": "Missing 'question' field in JSON payload"}), 400

    try:
        logging.info(f"Received question for Gemini: {question[:80]}...")
        response = gemini_model.generate_content(question)

        if response.prompt_feedback and response.prompt_feedback.block_reason:
            block_reason_message = response.prompt_feedback.block_reason_message or "Content blocked by safety settings."
            logging.warning(f"Gemini content generation blocked. Reason: {block_reason_message}")
            return jsonify({'error': f"Your request was blocked: {block_reason_message}"}), 400

        gemini_response_text = response.text
        logging.info(f"Gemini response snippet: {gemini_response_text[:80]}...")
        return jsonify({'answer': gemini_response_text})

    except google_exceptions.InvalidArgument as e:
        logging.error(f"InvalidArgument calling Gemini API: {e}. Possible invalid API key or request.")
        return jsonify({'error': 'There was an issue with the AI service configuration (e.g., API key).'}), 500
    except google_exceptions.PermissionDenied as e:
        logging.error(f"PermissionDenied calling Gemini API: {e}. Check API key permissions.")
        return jsonify({'error': 'API key lacks permission for the requested operation.'}), 403
    except google_exceptions.ResourceExhausted as e:
        logging.error(f"ResourceExhausted calling Gemini API: {e}. Quota likely exceeded.")
        return jsonify({'error': 'AI service quota exceeded. Please try again later.'}), 429
    except google_exceptions.GoogleAPIError as e:
        logging.exception(f"A Google API error occurred: {e}")
        return jsonify({'error': 'An unexpected error occurred with the AI service.'}), 503
    except AttributeError as e: # Handles cases like response.text being unavailable if response is unexpected
        logging.exception(f"Error processing Gemini response (AttributeError): {e}.")
        return jsonify({'error': 'Failed to process the response from the AI service.'}), 500
    except Exception as e:
        logging.exception(f"An unexpected error occurred in /api/ask: {e}")
        return jsonify({'error': 'An unexpected server error occurred.'}), 500


# --- Static file serving and Catch-all for Angular ---
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_angular_app(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    elif app.static_folder and os.path.exists(os.path.join(app.static_folder, 'index.html')):
        return send_from_directory(app.static_folder, 'index.html')
    else:
        logging.error(f"index.html not found in static folder: {app.static_folder}")
        return jsonify({"error": "Frontend not found. Application may be misconfigured."}), 404


# --- Generic Error Handler for Unhandled Exceptions ---
@app.errorhandler(Exception)
def handle_unexpected_error(e):
    logging.exception(f"Unhandled Flask exception: {e}")
    return jsonify({"error": "An unexpected server error occurred. Please try again later."}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get("PORT", 5000)), debug=False)
