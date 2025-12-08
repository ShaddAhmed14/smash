from fastapi import APIRouter
from fastapi.responses import JSONResponse, FileResponse, StreamingResponse
import os
import pandas as pd
import numpy as np
router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/fetch_gesture_segment")
def fetch_gesture_segment(video_name: str):
    file_path = os.path.join("/materials/analytics/gesture_segments", video_name + "_tracked.mp4")
    if not os.path.exists(file_path):
        return JSONResponse(content={"message": "Gesture Segment Video not Found" }, status_code=404)
    
    def full_stream():
            with open(file_path, "rb") as f:
                yield from f
    return StreamingResponse(
            full_stream(),
            media_type="video/mp4",
            headers={
                "Content-Type": "video/mp4",
            })

@router.get("/fetch_temporal_sentiment")
def fetch_temporal_sentiment():
    file_path = os.path.join("/materials/", "temporal_sentiment_data.json")
    if not os.path.exists(file_path):
        return JSONResponse(content={"message": "Temporal Sentiment File not Found" }, status_code=404)
    return FileResponse(file_path, media_type='application/json', filename="temporal_sentiment_data.json")

@router.get("/fetch_kinematic_features")
def fetch_kinematic_features():
    file_path = os.path.join("/materials", "kinematic_features.csv")
    if not os.path.exists(file_path):
        return JSONResponse(content={"message": "Kinematic Features File not Found" }, status_code=404)

    # df = pd.read_csv(file_path).head(10)
    df = pd.read_csv(file_path)

    jitter_values = [0.2 * (np.random.random() - 0.5) for _ in range(len(df))]
    gesture_ids = df['gesture_id'].tolist()
    features = df.drop(['gesture_id', 'video_id'], axis=1).to_dict(orient='list')
    return JSONResponse(content={
        "gesture_ids": gesture_ids,
        "features": features,
        "jitter_values": jitter_values
    }, status_code=200)
