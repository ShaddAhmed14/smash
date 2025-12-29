from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse, FileResponse, StreamingResponse
import pandas as pd
import os
import numpy as np
from utils.security import sanitize_video_name, safe_join_path

router = APIRouter(prefix="/analysis", tags=["analysis"])

MATERIALS_PATH = os.getenv("MATERIALS_FOLDER", "/materials")
ENVISION_OUTPUT_PATH = os.getenv("ENVISIONHGDETECTOR_OUTPUT", "/envisionhgdetector_output")


@router.get("/fetch_audio_features")
def fetch_audio_features(video_name: str):
    video_name = sanitize_video_name(video_name)
    file_path = safe_join_path(MATERIALS_PATH, video_name, f"{video_name}_audio_features.json")

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Audio features file not found")

    return FileResponse(file_path, media_type='application/json', filename=f"{video_name}_audio_features.json")


@router.get("/fetch_dtw")
def fetch_dtw():
    file_path = safe_join_path(MATERIALS_PATH, "gesture_visualization.csv")

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="DTW File not Found")

    try:
        df = pd.read_csv(file_path)
        return JSONResponse(content=df.to_dict(orient='list'))
    except Exception:
        raise HTTPException(status_code=500, detail="Error reading DTW file")


@router.get("/fetch_gesture_segment")
def fetch_gesture_segment(video_name: str):
    # Sanitize and extract video folder name
    video_name = sanitize_video_name(video_name)
    base_name = video_name.split(".mp4")[0]

    # Try first location
    file_path = safe_join_path(MATERIALS_PATH, base_name, "gesture_segments", f"{video_name}.mp4")

    if not os.path.exists(file_path):
        # Try alternate location
        segment_base = video_name.split("_segment")[0] if "_segment" in video_name else base_name
        file_path = safe_join_path(ENVISION_OUTPUT_PATH, "gesture_segments", segment_base, f"{video_name}.mp4")

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


@router.get("/fetch_data_map")
def fetch_data_map():
    file_path = safe_join_path(MATERIALS_PATH, "datamap_data.json")

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Data Map File not Found")

    return FileResponse(file_path, media_type='application/json', filename="datamap_data.json")


@router.get("/fetch_spectrogram")
def fetch_spectrogram(video_name: str):
    # Sanitize video name (which is actually a filename like "video_spectrogram.png")
    video_name = sanitize_video_name(video_name)

    # Try first location - in video folder
    video_folder = video_name.replace("_spectrogram.png", "")
    file_path = safe_join_path(MATERIALS_PATH, video_folder, video_name)

    if not os.path.exists(file_path):
        # Try alternate location
        file_path = safe_join_path(MATERIALS_PATH, "spectrograms", video_name)

        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="Spectrogram File not Found")

    return FileResponse(file_path, media_type='image/png', filename=video_name)


@router.get("/fetch_video_distribution")
def fetch_video_distribution():
    file_path = safe_join_path(MATERIALS_PATH, "video_distribution.json")

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Video Distribution File not Found")

    return FileResponse(file_path, media_type='application/json', filename="video_distribution.json")


@router.get("/fetch_topic_interdistance")
def fetch_topic_interdistance():
    file_path = safe_join_path(MATERIALS_PATH, "topic_interdistance.json")

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Topic Interdistance File not Found")

    return FileResponse(file_path, media_type='application/json', filename="topic_interdistance.json")


@router.get("/fetch_average_audio_features")
def fetch_average_audio_features():
    file_path = safe_join_path(MATERIALS_PATH, "average_audio_features.json")

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Average Audio Features file not found")

    return FileResponse(file_path, media_type='application/json', filename="average_audio_features.json")


@router.get("/fetch_world_cloud")
def fetch_world_cloud():
    file_path = safe_join_path(MATERIALS_PATH, "word_cloud.png")

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Word Cloud File not Found")

    return FileResponse(file_path, media_type='image/png', filename="word_cloud.png")


@router.get("/fetch_audio_spectrogram_embeddings")
def fetch_audio_spectrogram_embeddings():
    file_path = safe_join_path(MATERIALS_PATH, "spectrogram_voronoi_data.json")

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Audio Spectrogram Embeddings file not found")

    return FileResponse(file_path, media_type='application/json', filename="spectrogram_voronoi_data.json")


@router.get("/fetch_max_audio_features")
def fetch_max_audio_features():
    file_path = safe_join_path(MATERIALS_PATH, "max_audio_features.json")

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Max Audio Features file not found")

    return FileResponse(file_path, media_type='application/json', filename="max_audio_features.json")


@router.get("/fetch_kinematic_features")
def fetch_kinematic_features(video_name: str):
    video_name = sanitize_video_name(video_name)
    file_path = safe_join_path(MATERIALS_PATH, video_name, f"{video_name}_kinematic_features.csv")

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Kinematic features file not found")

    try:
        df = pd.read_csv(file_path)
        jitter_values = [0.2 * (np.random.random() - 0.5) for _ in range(len(df['gesture_id']))]
        df = df.drop(columns=['gesture_id', 'video_id'], errors='ignore')
        df = df.to_dict(orient='list')
        data = {'x': jitter_values, 'y': df}
        return JSONResponse(content=data)
    except Exception:
        raise HTTPException(status_code=500, detail="Error processing kinematic features")
