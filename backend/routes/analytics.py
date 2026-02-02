from fastapi import APIRouter
from fastapi.responses import JSONResponse, FileResponse, StreamingResponse
import os
import pandas as pd
import numpy as np
router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/fetch_transcript")
def fetch_transcript():
    file_path = os.path.join("/materials", "1594._Why_Black_girls_are_targeted_for_punishment_at_school_--_and_how_to_change_that___Monique_W._Morris.html")
    if not os.path.exists(file_path):
        return JSONResponse(content={"message": "Transcript File not Found" }, status_code=404)
    with open(file_path, 'r', encoding='utf-8') as f:
        html_content = f.read()
    return JSONResponse(content={"html": html_content}, status_code=200)

@router.get("/fetch_semantic_network")
def fetch_semantic_network(type: str):
    if type == "tfidf":
        file_path = os.path.join("/materials", "tfidf.json")
    elif type == "sbert":
        file_path = os.path.join("/materials", "sbert.json")
    elif type == "pertalk":
        file_path = os.path.join("/materials/per_talk", "1537._Art_that_transforms_cities_into_playgrounds_of_the_imagination___Helen_Marriage.json")
    else: 
        return JSONResponse(content={"message": "Invalid type parameter" }, status_code=400)
    
    if not os.path.exists(file_path):
        return JSONResponse(content={"message": "Talk Network File not Found" }, status_code=404)

    return FileResponse(file_path, media_type='application/json', filename=os.path.basename(file_path))

@router.get("/fetch_gesture_segment")
def fetch_gesture_segment(video_name: str):
    file_path = os.path.join("/materials/analytics/gesture_segments", video_name + "_tracked.mp4")
    if not os.path.exists(file_path):
        video_folder = video_name.split(".mp4")[0]
        file_path = os.path.join("/materials", video_folder, "gesture_segments", f"{video_name}_tracked.mp4")
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
