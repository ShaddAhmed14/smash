from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from utils import setup_materials
from routes import analysis, preview, analytics

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
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