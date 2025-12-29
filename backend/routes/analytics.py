from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse, FileResponse, StreamingResponse
import os
import pandas as pd
import numpy as np
from utils.security import sanitize_video_name, safe_join_path

router = APIRouter(prefix="/analytics", tags=["analytics"])

MATERIALS_PATH = os.getenv("MATERIALS_FOLDER", "/materials")


@router.get("/fetch_gesture_segment")
def fetch_gesture_segment(video_name: str):
    video_name = sanitize_video_name(video_name)

    # Try first location - analytics folder
    file_path = safe_join_path(MATERIALS_PATH, "analytics", "gesture_segments", f"{video_name}_tracked.mp4")

    if not os.path.exists(file_path):
        # Try alternate location - in video folder
        video_folder = video_name.split(".mp4")[0]
        file_path = safe_join_path(MATERIALS_PATH, video_folder, "gesture_segments", f"{video_name}_tracked.mp4")

        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="Gesture Segment Video not Found")

    def full_stream():
        try:
            with open(file_path, "rb") as f:
                yield from f
        except IOError:
            raise HTTPException(status_code=500, detail="Error reading video file")

    return StreamingResponse(
        full_stream(),
        media_type="video/mp4",
        headers={"Content-Type": "video/mp4"}
    )


@router.get("/fetch_temporal_sentiment")
def fetch_temporal_sentiment():
    file_path = safe_join_path(MATERIALS_PATH, "temporal_sentiment_data.json")

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Temporal Sentiment File not Found")

    return FileResponse(file_path, media_type='application/json', filename="temporal_sentiment_data.json")


@router.get("/fetch_kinematic_features")
def fetch_kinematic_features():
    file_path = safe_join_path(MATERIALS_PATH, "kinematic_features.csv")

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Kinematic Features File not Found")

    try:
        df = pd.read_csv(file_path)
        jitter_values = [0.2 * (np.random.random() - 0.5) for _ in range(len(df))]
        gesture_ids = df['gesture_id'].tolist()
        features = df.drop(['gesture_id', 'video_id'], axis=1, errors='ignore').to_dict(orient='list')

        return JSONResponse(content={
            "gesture_ids": gesture_ids,
            "features": features,
            "jitter_values": jitter_values
        }, status_code=200)
    except Exception:
        raise HTTPException(status_code=500, detail="Error processing kinematic features")
