from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse, FileResponse
from glob import glob as glob
import json
import os
import numpy as np
import base64
import pandas as pd
from utils import setup_materials
from dotenv import load_dotenv

load_dotenv()
app = FastAPI()

VIDEO_TYPES = ["Original", "YoloPose", "MediaPipePose", "OpenPose", "MaskAnyoneAPI-MediaPipePose", "MaskAnyoneAPI-OpenPose", "MaskAnyoneUI-MediaPipePose", "MaskAnyoneUI-OpenPose"]
DEFAULT_VIDEO = "TED-kid"

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)
@app.get("/")
def home():
    return JSONResponse(content={"message": "Hello World" }) 

@app.get("/setup")
def setup():
    setup_materials("/materials")
    return JSONResponse(content={"message": "Creating Materials using Videos found" }) 


@app.get("/fetch_metadata")
def fetch_metadata():
    file_path = os.path.join("/materials", "metadata.json")
    if not os.path.exists(file_path):
        return JSONResponse(content={"message": "Metadata File not Found" }, status_code=404)
    with open(file_path) as f:
        data = json.load(f)
    # print(data)
    return JSONResponse(content=data)


@app.get("/fetch_transcript/")
def fetch_transcript(video_name: str):
    video_name = DEFAULT_VIDEO if not video_name else video_name
    file_path = os.path.join("/materials", video_name, f"{video_name}_transcript.srt")
    if not os.path.exists(file_path):
        return JSONResponse(content={"message": "Transcript file not found"}, status_code=404)
    
    return FileResponse(file_path, media_type='text/plain', filename=f"{video_name}_transcript.srt")

@app.get("/fetch_waveform/")
def fetch_waveform(video_name: str):
    video_name = DEFAULT_VIDEO if not video_name else video_name
    file_path = os.path.join("/materials", video_name,  f"{video_name}_waveform.json")
    if not os.path.exists(file_path):
        return JSONResponse(content={"message": "Waveform file not found"}, status_code=404)
    
    with open(file_path) as f:
        data = json.load(f)
    return JSONResponse(content=data)

@app.get("/fetch_audio_features/")
def fetch_audio_features(video_name: str):
    file_path = os.path.join("/materials", video_name,  f"{video_name}_audio_features.json")
    if not os.path.exists(file_path):
        return JSONResponse(content={"message": "Audio features file not found"}, status_code=404)

    with open(file_path) as f:
        data = json.load(f)
    return JSONResponse(content=data)

@app.get("/fetch_kinematic_features/")
def fetch_kinematic_features(video_name: str):
    file_path = os.path.join("/materials", video_name,  f"{video_name}_kinematic_features.csv")
    if not os.path.exists(file_path):
        return JSONResponse(content={"message": "Kinematic features file not found"}, status_code=404)
    
    df = pd.read_csv(file_path)
    jitter_values = [0.2 * (np.random.random() - 0.5) for _ in range(len(df['gesture_id']))]
    df = df.drop(columns=['gesture_id', 'video_id'])
    df = df.to_dict(orient='list')
    data = {'x': jitter_values, 'y': df}
    return JSONResponse(content=data)

@app.get("/fetch_metadata_graph")
async def fetch_metadata_graph():
    file_path = os.path.join("/materials", "metadata.json")
    if not os.path.exists(file_path):
        return JSONResponse(content={"message": "Metadata Graph File not Found" }, status_code=404)
    with open(file_path) as f:
        data = json.load(f)
    speaker_gender = [item['speaker_gender'] for item in data]
    language = [item['language'] for item in data]
    duration = [item['duration'] for item in data]
    video_name = [item['video_name'] for item in data]
    topics = [item['topics'] for item in data]

    return JSONResponse({
        "speaker_gender": speaker_gender,
        "language": language,
        "duration": duration,
        "video_name": video_name,
        "topics": topics
    })

@app.get("/fetch_audio")
async def stream_audio(video_name: str, request: Request):
    video_name = DEFAULT_VIDEO if not video_name else video_name
    file_path = os.path.join("/materials", video_name,  f"{video_name}_audio.wav")
    
    def iterfile(file_path: str):
        with open(file_path, mode="rb") as file_like:
            yield from file_like
    
    return StreamingResponse(
        iterfile(file_path),
        media_type="audio/mpeg",
        headers={"Accept-Ranges": "bytes"}
    )

@app.get("/fetch_models/")
def fetch_models():
    return JSONResponse(content={"models": VIDEO_TYPES})

@app.get("/fetch_thumbnails/")
def fetch_thumbnails(video_name: str, selectedModel: str):
    video_name = DEFAULT_VIDEO if not video_name else video_name
    file_path = os.path.join("/materials", video_name, "thumbnails")
    thumbnails = {}
    for model_name in VIDEO_TYPES:
        thumbnails[model_name] = os.path.join(file_path, f"{video_name}_{model_name}_thumbnail.jpg")

    for name, path in thumbnails.items():
        if os.path.exists(path):
            with open(path, "rb") as img_file:
                image_extension = path.split('.')[-1].lower()
                mime_type = f"image/{image_extension}" if image_extension in ["jpeg", "jpg", "png", "gif"] else "image/jpeg"
                b64_string = base64.b64encode(img_file.read()).decode('utf-8')
                thumbnails[name] = f"data:{mime_type};base64,{b64_string}"
        else:
            print("thumbnail not found", name, path)
            thumbnails[name] = None
    
    del thumbnails[selectedModel] # send all thumbnails except selected one
    return JSONResponse(content=thumbnails)

@app.get("/fetch_video/")
def fetch_video(video_name: str, model_name: str, request: Request):
    video_name = DEFAULT_VIDEO if not video_name else video_name
    if model_name == "Original":
        file_path = os.path.join("/materials", video_name, f"{video_name}_{model_name}.mp4")
    else:
        file_path = os.path.join("/materials", video_name, "coded_processed_videos", f"{video_name}_{model_name}.mp4")

    if not os.path.exists(file_path):
        print("video not found", file_path)
        return JSONResponse(content={"message": "Video file not found"}, status_code=404)

    video_file_size = os.path.getsize(file_path)
    range_header = request.headers.get("range")
    if range_header:
        start, end = range_header.replace("bytes=", "").split("-")
        start = int(start)
        end = int(end) if end else video_file_size - 1
        chunk_size = end - start + 1

        def chunk_stream():
            with open(file_path, "rb") as f:
                f.seek(start)
                yield f.read(chunk_size)
        return StreamingResponse(
            chunk_stream(),
            headers={
                "Content-Range": f"bytes {start}-{end}/{video_file_size}",
                "Accept-Ranges": "bytes",
                "Content-Length": str(chunk_size),
                "Content-Type": "video/mp4",
            },
            status_code=206,
        )
    else:
        def full_stream():
            with open(file_path, "rb") as f:
                yield from f
        return StreamingResponse(
            full_stream(),
            media_type="video/mp4",
            headers={
                "Content-Length": str(video_file_size),
                "Content-Type": "video/mp4",
            },
        ) 