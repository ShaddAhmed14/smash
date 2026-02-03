from fastapi import APIRouter
from fastapi.responses import JSONResponse, FileResponse, StreamingResponse
import os
import pandas as pd
import glob
import numpy as np
router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/fetch_spacey")
def fetch_spacey(video_name: str):
    video_name = "1555._How_a_new_species_of_ancestors_is_changing_our_theory_of_human_evolution___Juliet_Brophy"
    file_path = os.path.join("/materials", f"{video_name}.json")
    if not os.path.exists(file_path):
        return JSONResponse(content={"message": "Transcript File not Found" }, status_code=404)
    return FileResponse(file_path, media_type='application/json', filename=os.path.basename(file_path))

@router.get("/fetch_dependency_tree")
def fetch_dependency_tree(video_name: str, sentence_id: str):
    video_name = "1555._How_a_new_species_of_ancestors_is_changing_our_theory_of_human_evolution___Juliet_Brophy"
    file_path = os.path.join("/materials", "dependancy_tree", video_name, f"{sentence_id}.svg")
    if not os.path.exists(file_path):
        print("File not found:", file_path)
        return JSONResponse(content={"message": "Dependency Tree File not Found" }, status_code=404)
    return FileResponse(file_path, media_type='image/svg+xml', filename=os.path.basename(file_path))

@router.get("/fetch_pertalk_list")
def fetch_pertalk_list():
    video_list = glob.glob("/materials/per_talk/*.json")
    video_names = [os.path.basename(video).split(".json")[0] for video in video_list]
    return JSONResponse(content={"video_names": video_names}, status_code=200)

@router.get("/fetch_semantic_network")
def fetch_semantic_network(type: str):
    if type == "TFIDF":
        file_path = os.path.join("/materials", "tfidf.json")
    elif type == "SBERT":
        file_path = os.path.join("/materials", "sbert.json")
    else:
        file_path = os.path.join("/materials/per_talk", f"{type}.json")
    
    if not os.path.exists(file_path):
        print("File not found:", file_path)
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
