import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from utils import setup_materials
from routes import analysis, preview, analytics

app = FastAPI(
    title="SMASH API",
    description="Synthesis and Multimodal Analytics System for Humanities",
    version="1.0.0"
)

# CORS Configuration - Security Hardened
# In production, replace localhost with your actual frontend domain
allowed_origins = [
    os.getenv("FRONTEND_URL", "http://localhost:3070"),
    "http://localhost:3000",  # Development mode
    "http://localhost:3070",  # Production mode
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,  # Restricted to specific origins
    allow_credentials=True,
    allow_methods=["GET", "POST"],  # Only allow needed methods
    allow_headers=["*"],  # Can be restricted further if needed
    max_age=3600,  # Cache preflight requests for 1 hour
)

app.include_router(preview.router)
app.include_router(analysis.router)
app.include_router(analytics.router)

@app.get("/")
def home():
    return "Hello World"

@app.get("/setup")
def setup():
    setup_materials("/materials")
    return {"message": "Creating Materials using Videos found" }