import pytest
from unittest.mock import patch, MagicMock
from app import app as flask_app # Import your Flask app instance
from google.api_core import exceptions as google_exceptions

# Make sure to adjust the import if your app instance is named differently
# or if app.py is not in the root.

@pytest.fixture
def app():
    """Create and configure a new app instance for each test."""
    # You might want to set specific configurations for testing
    flask_app.config.update({
        "TESTING": True,
        # "GEMINI_API_KEY": "test_api_key" # If needed, but we'll mock genai
    })
    # Other setup can go here

    yield flask_app

    # Clean up / reset resources after each test
    # For example, if you modify app.gemini_model directly in tests, reset it here.


@pytest.fixture
def client(app):
    """A test client for the app."""
    return app.test_client()


# --- Tests for /api/ask endpoint ---

@patch('app.genai.GenerativeModel') # Patch where it's looked up (in your app module)
def test_ask_successful_request(mock_genai_model_class, client):
    """Test a successful call to /api/ask."""
    # Configure the mock model instance and its generate_content method
    mock_model_instance = MagicMock()
    mock_response = MagicMock()
    mock_response.text = "Mocked Gemini response"
    mock_response.prompt_feedback = None # Simulate no blocking
    mock_model_instance.generate_content.return_value = mock_response

    # This is tricky: we need to ensure app.gemini_model is this mock_model_instance
    # One way is to re-assign it if app.py allows, or mock the loader
    # For simplicity, let's assume app.gemini_model is already configured
    # and genai.configure and GenerativeModel were called at startup.
    # The patch here will affect future calls to GenerativeModel() if it were called per-request.
    # If it's initialized at startup, we need to ensure that instance is the one being mocked.
    # A robust way is to mock 'app.gemini_model' directly for the test's duration.
    with patch('app.gemini_model', mock_model_instance):
        response = client.post('/api/ask', json={'question': 'What is Flask?'})

    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data['answer'] == "Mocked Gemini response"


def test_ask_missing_question(client):
    """Test /api/ask with no question provided."""
    response = client.post('/api/ask', json={})
    assert response.status_code == 400
    json_data = response.get_json()
    assert 'error' in json_data
    assert 'Missing \'question\' field' in json_data['error']


def test_ask_not_json(client):
    """Test /api/ask with non-JSON request."""
    response = client.post('/api/ask', data="not json")
    assert response.status_code == 415
    json_data = response.get_json()
    assert 'error' in json_data
    assert 'Request must be JSON' in json_data['error']

@patch('app.gemini_model') # Patch the model instance directly in app.py
def test_ask_gemini_api_error(mock_gemini_model_instance, client):
    """Test /api/ask when Gemini API call fails with a generic GoogleAPIError."""
    mock_gemini_model_instance.generate_content.side_effect = google_exceptions.GoogleAPIError("Test API error")

    response = client.post('/api/ask', json={'question': 'Test question for API error'})

    assert response.status_code == 503 # As per current error handling for GoogleAPIError
    json_data = response.get_json()
    assert 'error' in json_data
    assert 'An unexpected error occurred with the AI service.' in json_data['error']


@patch('app.gemini_model')
def test_ask_gemini_invalid_argument_error(mock_gemini_model_instance, client):
    """Test /api/ask for InvalidArgument error (e.g., bad API key)."""
    mock_gemini_model_instance.generate_content.side_effect = google_exceptions.InvalidArgument("Bad API Key")

    response = client.post('/api/ask', json={'question': 'Test question for bad key'})

    assert response.status_code == 500 # As per current error handling
    json_data = response.get_json()
    assert 'error' in json_data
    assert 'issue with the AI service configuration' in json_data['error']


@patch('app.gemini_model')
def test_ask_gemini_permission_denied_error(mock_gemini_model_instance, client):
    """Test /api/ask for PermissionDenied error."""
    mock_gemini_model_instance.generate_content.side_effect = google_exceptions.PermissionDenied("Key has no permission")

    response = client.post('/api/ask', json={'question': 'Test question for permission denied'})

    assert response.status_code == 403
    json_data = response.get_json()
    assert 'error' in json_data
    assert 'API key lacks permission' in json_data['error']


@patch('app.gemini_model')
def test_ask_gemini_resource_exhausted_error(mock_gemini_model_instance, client):
    """Test /api/ask for ResourceExhausted error (quota)."""
    mock_gemini_model_instance.generate_content.side_effect = google_exceptions.ResourceExhausted("Quota exceeded")

    response = client.post('/api/ask', json={'question': 'Test question for quota'})

    assert response.status_code == 429
    json_data = response.get_json()
    assert 'error' in json_data
    assert 'AI service quota exceeded' in json_data['error']


@patch('app.gemini_model')
def test_ask_gemini_content_blocked(mock_gemini_model_instance, client):
    """Test /api/ask when content is blocked by Gemini safety settings."""
    mock_response = MagicMock()
    mock_response.text = None # No text if blocked
    mock_feedback = MagicMock()
    mock_feedback.block_reason = 1 # Some block reason
    mock_feedback.block_reason_message = "Blocked due to safety concerns."
    mock_response.prompt_feedback = mock_feedback
    mock_gemini_model_instance.generate_content.return_value = mock_response

    response = client.post('/api/ask', json={'question': 'A problematic question'})

    assert response.status_code == 400 # As per current error handling
    json_data = response.get_json()
    assert 'error' in json_data
    assert 'Your request was blocked: Blocked due to safety concerns.' in json_data['error']


@patch('app.gemini_model', None) # Simulate model not being initialized
def test_ask_model_not_initialized(client):
    """Test /api/ask when the gemini_model is None (not initialized)."""
    # This test requires that app.gemini_model can be None and is checked.
    # The patch('app.gemini_model', None) simulates this state for this test.
    # Note: This might require running this test in a way that doesn't try to re-initialize
    # the model or ensuring the initial app fixture setup reflects this.
    # A more direct way might be to set flask_app.gemini_model = None within the test if possible,
    # or ensure the fixture `app` yields an app where `gemini_model` is None.
    # For now, relying on the patch at the test level.

    response = client.post('/api/ask', json={'question': 'Any question'})

    assert response.status_code == 503 # Service Unavailable
    json_data = response.get_json()
    assert 'error' in json_data
    assert 'AI service is not configured.' in json_data['error']

# --- Test Generic Error Handler ---
# To test the generic error handler, we need a route that raises an unhandled exception.
@pytest.fixture
def app_with_error_route(app):
    @app.route('/unhandled_error_test')
    def error_route():
        raise ValueError("This is an unhandled test exception")
    return app

def test_generic_error_handler(app_with_error_route):
    client = app_with_error_route.test_client()
    response = client.get('/unhandled_error_test')
    assert response.status_code == 500
    json_data = response.get_json()
    assert 'error' in json_data
    assert 'An unexpected server error occurred.' in json_data['error']

# --- Test for API Key not set (placeholder used) ---
# This requires manipulating the environment or app config before app initialization.
# For simplicity, this specific scenario (API key being the placeholder) is harder to test
# in isolation without affecting other tests or having a complex fixture setup.
# The current app.py logs an error and proceeds with gemini_model as None if placeholder is used.
# The test_ask_model_not_initialized effectively covers the behavior if the model isn't loaded.
# A dedicated test could involve a fixture that reloads the app with a specific os.environ.

# To run tests:
# Ensure you are in the project root directory (where app.py and tests/ are)
# Run `pytest` in the terminal.
# Add -v for more verbosity: `pytest -v`
# Add -s to see print statements (and logs if not captured): `pytest -s`
