from fastapi import APIRouter
from fastapi.responses import JSONResponse, FileResponse
import os

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/fetch_temporal_sentiment/")
def fetch_temporal_sentiment():
    file_path = os.path.join("/materials/", "temporal_sentiment_data.json")
    if not os.path.exists(file_path):
        return JSONResponse(content={"message": "Temporal Sentiment File not Found" }, status_code=404)
    return FileResponse(file_path, media_type='application/json', filename="temporal_sentiment_data.json")

