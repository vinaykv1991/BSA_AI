# Deployment Guide

This guide provides instructions for deploying the Angular frontend to Netlify and the Flask backend to Render.

## Prerequisites

- A Netlify account.
- A Render account.
- Git repository (e.g., GitHub, GitLab) connected to both Netlify and Render.
- Your Gemini API Key.

## Backend Deployment (Render)

1.  **Push your code to your Git repository.** Ensure `render.yaml` and `requirements.txt` are in the project root.
2.  **Create a new Web Service on Render:**
    - Go to the Render Dashboard and click "New" > "Web Service".
    - Connect your Git repository (e.g., GitHub).
    - Render will automatically detect `render.yaml` if it's in the root. If so, many settings will be pre-filled. Otherwise, configure as follows:
        - **Name:** `gemini-flask-backend` (or your choice)
        - **Region:** Choose your preferred region (e.g., Oregon, Frankfurt - `render.yaml` suggests `oregon`)
        - **Branch:** Your deployment branch (e.g., `main` or `master`)
        - **Root Directory:** (Leave blank if `render.yaml` is in the root and contains all necessary paths)
        - **Build Command:** `pip install -r requirements.txt` (This is taken from `render.yaml`)
        - **Start Command:** `gunicorn app:app` (This is taken from `render.yaml`)
        - **Plan:** Choose your plan (e.g., Free - `render.yaml` specifies `free`)
        - **Python Version:** Ensure it matches what's in `render.yaml` (e.g., `3.11`)
3.  **Add Environment Variables in Render's dashboard (under the "Environment" section for your service):**
    - `PYTHON_VERSION`: `3.11` (or as per `render.yaml`)
    - `GEMINI_API_KEY`: Your actual Gemini API key. (Marked as `sync: false` in `render.yaml`, so it *must* be set here).
    - `FLASK_ENV`: `production` (as per `render.yaml`)
    - `FRONTEND_URL`: Initially, you might not have this. Deploy the frontend first, get its URL, then come back here to set this. Example: `https://your-netlify-app-name.netlify.app`.
4.  **Deploy.** Click "Create Web Service". Render will build and deploy your application.
5.  **Note your backend URL.** After deployment, Render will provide a URL for your service (e.g., `https://gemini-flask-backend.onrender.com`). You will need this for the frontend configuration on Netlify.

## Frontend Deployment (Netlify)

1.  **Push your code to your Git repository.** Ensure `angular-app/gemini-app/netlify.toml` is committed and `angular-app/gemini-app/src/environments/environment.prod.ts` contains the placeholder `YOUR_RENDER_BACKEND_URL_HERE`.
2.  **Create a new site on Netlify from Git:**
    - Log in to Netlify and click "Add new site" > "Import an existing project".
    - Connect your Git repository.
    - Settings:
        - **Branch to deploy:** Your deployment branch (e.g., `main`).
        - **Base directory:** `angular-app/gemini-app/` (This tells Netlify to run commands from within this subdirectory).
        - **Build command:** Netlify should pick this from `netlify.toml` (`npm install && sed -i "s|YOUR_RENDER_BACKEND_URL_HERE|$NG_APP_API_URL|g" src/environments/environment.prod.ts && ng build --configuration production`).
        - **Publish directory:** `dist/gemini-app/browser` (Netlify should pick this from `netlify.toml`).
3.  **Add Environment Variables in Netlify's build settings (Site settings > Build & deploy > Environment > Environment variables):**
    - Click "Edit variables".
    - Add a variable:
        - **Key:** `NG_APP_API_URL`
        - **Value:** The URL of your deployed Render backend (e.g., `https://gemini-flask-backend.onrender.com`).
    - Add another variable (if not already picked from `netlify.toml`'s environment block, though Netlify UI is better for secrets/URLs):
        - **Key:** `NODE_VERSION`
        - **Value:** `20` (or as per `netlify.toml`)
4.  **Deploy.** Trigger a deploy from the Netlify UI (e.g., in the "Deploys" section, "Trigger deploy"). Netlify will use the settings from `netlify.toml` and the environment variables you've set. The `sed` command in `netlify.toml` will replace the placeholder in `environment.prod.ts` with the `NG_APP_API_URL` you set in Netlify's UI.

## Post-Deployment

1.  **Update `FRONTEND_URL` on Render:**
    - Once your Netlify frontend is live and you have its URL (e.g., `https://your-angular-app-name.netlify.app`), go back to your Render dashboard.
    - Navigate to your backend service's "Environment" section.
    - Update the `FRONTEND_URL` environment variable with your actual Netlify app URL. This ensures CORS on the backend allows requests from your frontend. Render will typically redeploy your service when environment variables change.

2.  **Test your application:**
    - Open your Netlify frontend URL in a browser.
    - Test the functionality by asking questions and verifying responses.
    - Check browser developer console for any errors.
    - Check Netlify function logs (if any) and Render service logs for any backend errors.

This completes the deployment process.
