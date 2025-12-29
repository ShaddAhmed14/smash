import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import analysis, preview, analytics

app = FastAPI()

# CORS Configuration
# In production, set ALLOWED_ORIGINS environment variable to comma-separated list of allowed origins
# Example: ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "")
if allowed_origins_env:
    allowed_origins = [origin.strip() for origin in allowed_origins_env.split(",") if origin.strip()]
else:
    # Default to localhost ports for development
    frontend_port = os.getenv("FRONTEND_PORT", "3000")
    allowed_origins = [
        f"http://localhost:{frontend_port}",
        f"http://127.0.0.1:{frontend_port}",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],  # Only allow needed methods
    allow_headers=["Content-Type", "Authorization", "Range"],  # Only allow needed headers
)

app.include_router(preview.router)
app.include_router(analysis.router)
app.include_router(analytics.router)

@app.get("/")
def home():
    return "Hello World"