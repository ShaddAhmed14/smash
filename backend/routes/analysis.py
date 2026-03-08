from fastapi import APIRouter
from fastapi.responses import JSONResponse, FileResponse, StreamingResponse
import pandas as pd
import os
import numpy as np
from config import MATERIALS_FOLDER, ENVISIONHGDETECTOR_OUTPUT

router = APIRouter(prefix="/analysis", tags=["analysis"])


@router.get("/fetch_audio_features")
def fetch_audio_features(video_name: str):
    file_path = os.path.join(MATERIALS_FOLDER, video_name,  f"{video_name}_audio_features.json")
    if not os.path.exists(file_path):
        return JSONResponse(content={"message": "Audio features file not found"}, status_code=404)
    return FileResponse(file_path, media_type='application/json', filename=f"{video_name}_audio_features.json")

@router.get("/fetch_dtw")
def fetch_dtw():
    file_path = os.path.join(MATERIALS_FOLDER, "gesture_visualization.csv")
    if not os.path.exists(file_path):
        return JSONResponse(content={"message": "DTW File not Found" }, status_code=404)
    df = pd.read_csv(file_path)
    return JSONResponse(content=df.to_dict(orient='list'))

@router.get("/fetch_gesture_segment")
def fetch_gesture_segment(video_name: str):
    file_path = os.path.join(MATERIALS_FOLDER, video_name.split(".mp4")[0], "gesture_segments", video_name + "_tracked.mp4")
    if not os.path.exists(file_path):
        file_path = os.path.join(ENVISIONHGDETECTOR_OUTPUT, "retracked", "tracked_videos", video_name + "_tracked.mp4")
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

@router.get("/fetch_data_map")
def fetch_data_map():
    file_path = os.path.join(MATERIALS_FOLDER, "datamap_data.json")
    if not os.path.exists(file_path):
        return JSONResponse(content={"message": "Data Map File not Found" }, status_code=404)
    return FileResponse(file_path, media_type='application/json', filename="datamap_data.json")

@router.get("/fetch_spectrogram")
def fetch_spectrogram(video_name: str):
    file_path = os.path.join(MATERIALS_FOLDER, video_name, f"{video_name}_spectrogram.png")
    if not os.path.exists(file_path):
        file_path = os.path.join(MATERIALS_FOLDER, "spectrograms", video_name)
        if not os.path.exists(file_path):
            return JSONResponse(content={"message": "Spectrogram File not Found" }, status_code=404)
    return FileResponse(file_path, media_type='image/png', filename=video_name)

@router.get("/fetch_video_distribution")
def fetch_video_distribution():
    file_path = os.path.join(MATERIALS_FOLDER, "video_distribution.json")
    if not os.path.exists(file_path):
        return JSONResponse(content={"message": "Video Distribution File not Found" }, status_code=404)
    return FileResponse(file_path, media_type='application/json', filename="video_distribution.json")

@router.get("/fetch_topic_interdistance")
def fetch_topic_interdistance():
    file_path = os.path.join(MATERIALS_FOLDER, "topic_interdistance.json")
    if not os.path.exists(file_path):
        return JSONResponse(content={"message": "Topic Interdistance File not Found" }, status_code=404)
    return FileResponse(file_path, media_type='application/json', filename="topic_interdistance.json")

@router.get("/fetch_average_audio_features")
def fetch_average_audio_features():
    file_path = os.path.join(MATERIALS_FOLDER, "average_audio_features.json")
    if not os.path.exists(file_path):
        return JSONResponse(content={"message": "Average Audio Features file not found"}, status_code=404)

    return FileResponse(file_path, media_type='application/json', filename="average_audio_features.json")

@router.get("/fetch_world_cloud")
def fetch_world_cloud():
    file_path = os.path.join(MATERIALS_FOLDER, "word_cloud.png")
    if not os.path.exists(file_path):
        return JSONResponse(content={"message": "Word Cloud File not Found" }, status_code=404)
    return FileResponse(file_path, media_type='image/png', filename="word_cloud.png")

@router.get("/fetch_audio_spectrogram_embeddings")
def fetch_audio_spectrogram_embeddings():
    file_path = os.path.join(MATERIALS_FOLDER, "spectrogram_voronoi_data.json")
    if not os.path.exists(file_path):
        return JSONResponse(content={"message": "Audio Spectrogram Embeddings file not found"}, status_code=404)

    return FileResponse(file_path, media_type='application/json', filename="spectrogram_voronoi_data.json")

@router.get("/fetch_max_audio_features")
def fetch_max_audio_features():
    file_path = os.path.join(MATERIALS_FOLDER, "max_audio_features.json")
    if not os.path.exists(file_path):
        return JSONResponse(content={"message": "max Audio Features file not found"}, status_code=404)

    return FileResponse(file_path, media_type='application/json', filename="max_audio_features.json")

@router.get("/fetch_kinematic_features")
def fetch_kinematic_features(video_name: str):
    file_path = os.path.join(MATERIALS_FOLDER, video_name,  f"{video_name}_kinematic_features.csv")
    if not os.path.exists(file_path):
        return JSONResponse(content={"message": "Kinematic features file not found"}, status_code=404)

    df = pd.read_csv(file_path)
    jitter_values = [0.2 * (np.random.random() - 0.5) for _ in range(len(df['gesture_id']))]
    df = df.drop(columns=['gesture_id', 'video_id'])
    df = df.to_dict(orient='list')
    data = {'x': jitter_values, 'y': df}
    return JSONResponse(content=data)


# --- Prosody features (openSMILE eGeMAPS) ---

@router.get("/fetch_prosody")
def fetch_prosody(video_name: str):
    """Return frame-level prosody contours and summary statistics for a video."""
    file_path = os.path.join(MATERIALS_FOLDER, video_name, f"{video_name}_prosody.json")
    if not os.path.exists(file_path):
        return JSONResponse(content={"message": "Prosody features not found"}, status_code=404)
    return FileResponse(file_path, media_type="application/json", filename=f"{video_name}_prosody.json")


@router.get("/fetch_average_prosody")
def fetch_average_prosody():
    """Return cross-corpus average prosody features."""
    file_path = os.path.join(MATERIALS_FOLDER, "average_prosody_features.json")
    if not os.path.exists(file_path):
        return JSONResponse(content={"message": "Average prosody features not found"}, status_code=404)
    return FileResponse(file_path, media_type="application/json", filename="average_prosody_features.json")


# --- Pauses and fillers ---

@router.get("/fetch_pauses_fillers")
def fetch_pauses_fillers(video_name: str):
    """Return pause, filler, and speech rate data for a video."""
    file_path = os.path.join(MATERIALS_FOLDER, video_name, f"{video_name}_pauses_fillers.json")
    if not os.path.exists(file_path):
        return JSONResponse(content={"message": "Pauses/fillers data not found"}, status_code=404)
    return FileResponse(file_path, media_type="application/json", filename=f"{video_name}_pauses_fillers.json")


# --- Facial expressions (py-feat) ---

@router.get("/fetch_facial_expressions")
def fetch_facial_expressions(video_name: str):
    """Return emotion predictions, Action Units, and summary for a video."""
    file_path = os.path.join(MATERIALS_FOLDER, video_name, f"{video_name}_facial_expressions.json")
    if not os.path.exists(file_path):
        return JSONResponse(content={"message": "Facial expression data not found"}, status_code=404)
    return FileResponse(file_path, media_type="application/json", filename=f"{video_name}_facial_expressions.json")


@router.get("/fetch_average_facial_expressions")
def fetch_average_facial_expressions():
    """Return cross-corpus average facial expression features."""
    file_path = os.path.join(MATERIALS_FOLDER, "average_facial_expressions.json")
    if not os.path.exists(file_path):
        return JSONResponse(content={"message": "Average facial expression data not found"}, status_code=404)
    return FileResponse(file_path, media_type="application/json", filename="average_facial_expressions.json")

