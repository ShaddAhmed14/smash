import logging

from fastapi import APIRouter
from fastapi.responses import JSONResponse, FileResponse, StreamingResponse
import os
import pandas as pd
import glob
import numpy as np
from config import MATERIALS_FOLDER

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/fetch_spacy")
def fetch_spacy(video_name: str):
    file_path = os.path.join(MATERIALS_FOLDER, "spacey_analysis", f"{video_name}.json")
    if not os.path.exists(file_path):
        file_path = os.path.join(MATERIALS_FOLDER, video_name, f"{video_name}_spacey.json")
        if not os.path.exists(file_path):
            return JSONResponse(content={"message": "SpaCy analysis file not found"}, status_code=404)
    return FileResponse(file_path, media_type='application/json', filename=os.path.basename(file_path))


@router.get("/fetch_dependency_tree")
def fetch_dependency_tree(video_name: str, sentence_id: str):
    file_path = os.path.join(MATERIALS_FOLDER, "dependancy_tree", video_name, f"{sentence_id}.svg")
    if not os.path.exists(file_path):
        file_path = os.path.join(MATERIALS_FOLDER, video_name, "dependency_trees", f"{sentence_id}.svg")
        if not os.path.exists(file_path):
            return JSONResponse(content={"message": "Dependency tree file not found"}, status_code=404)
    return FileResponse(file_path, media_type='image/svg+xml', filename=os.path.basename(file_path))


@router.get("/fetch_spacy_list")
def fetch_spacy_list():
    video_list = glob.glob(os.path.join(MATERIALS_FOLDER, "spacey_analysis", "*.json"))
    if len(video_list) == 0:
        video_list = glob.glob(os.path.join(MATERIALS_FOLDER, "*", "*_spacey.json"))
        video_names = [os.path.basename(v).split("_spacey.json")[0] for v in video_list]
    else:
        video_names = [os.path.splitext(os.path.basename(v))[0] for v in video_list]
    return JSONResponse(content={"video_names": video_names}, status_code=200)


@router.get("/fetch_pertalk_list")
def fetch_pertalk_list():
    video_list = glob.glob(os.path.join(MATERIALS_FOLDER, "per_talk", "*.json"))
    if len(video_list) == 0:
        video_list = glob.glob(os.path.join(MATERIALS_FOLDER, "*", "*_per_talk.json"))
    video_names = [os.path.basename(video).split("_per_talk.json")[0] for video in video_list]
    return JSONResponse(content={"video_names": video_names}, status_code=200)


@router.get("/fetch_semantic_network")
def fetch_semantic_network(type: str):
    if type == "TFIDF":
        file_path = os.path.join(MATERIALS_FOLDER, "tfidf.json")
    elif type == "SBERT":
        file_path = os.path.join(MATERIALS_FOLDER, "sbert.json")
    else:
        file_path = os.path.join(MATERIALS_FOLDER, "per_talk", f"{type}.json")
        if not os.path.exists(file_path):
            file_path = os.path.join(MATERIALS_FOLDER, type, f"{type}_per_talk.json")

    if not os.path.exists(file_path):
        logger.warning("Semantic network file not found: %s", file_path)
        return JSONResponse(content={"message": "Semantic network file not found"}, status_code=404)

    return FileResponse(file_path, media_type='application/json', filename=os.path.basename(file_path))


@router.get("/fetch_gesture_segment")
def fetch_gesture_segment(video_name: str):
    file_path = os.path.join(MATERIALS_FOLDER, "analytics", "gesture_segments", video_name + "_tracked.mp4")
    if not os.path.exists(file_path):
        video_folder = video_name.split(".mp4")[0]
        file_path = os.path.join(MATERIALS_FOLDER, video_folder, "gesture_segments", f"{video_name}_tracked.mp4")
        if not os.path.exists(file_path):
            return JSONResponse(content={"message": "Gesture segment video not found"}, status_code=404)

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
    file_path = os.path.join(MATERIALS_FOLDER, "temporal_sentiment_data.json")
    if not os.path.exists(file_path):
        return JSONResponse(content={"message": "Temporal sentiment file not found"}, status_code=404)
    return FileResponse(file_path, media_type='application/json', filename="temporal_sentiment_data.json")


@router.get("/fetch_kinematic_features")
def fetch_kinematic_features():
    file_path = os.path.join(MATERIALS_FOLDER, "kinematic_features.csv")
    if not os.path.exists(file_path):
        return JSONResponse(content={"message": "Kinematic features file not found"}, status_code=404)

    df = pd.read_csv(file_path)

    jitter_values = [0.2 * (np.random.random() - 0.5) for _ in range(len(df))]
    gesture_ids = df['gesture_id'].tolist()
    features = df.drop(['gesture_id', 'video_id'], axis=1).to_dict(orient='list')
    return JSONResponse(content={
        "gesture_ids": gesture_ids,
        "features": features,
        "jitter_values": jitter_values
    }, status_code=200)
