from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import analysis, preview, analytics, export

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
app.include_router(export.router)

@app.get("/")
def home():
    return "Hello World"