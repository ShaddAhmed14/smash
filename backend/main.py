from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse, FileResponse
from glob import glob as glob
import json
import os
import numpy as np
import pandas as pd
from utils import setup_materials

from urllib3 import request
from dotenv import load_dotenv

load_dotenv()
app = FastAPI()

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
    file_path = os.path.join("/materials", video_name, f"{video_name}_transcript.srt")
    if not os.path.exists(file_path):
        return JSONResponse(content={"message": "Transcript file not found"}, status_code=404)
    
    return FileResponse(file_path, media_type='text/plain', filename=f"{video_name}_transcript.srt")

@app.get("/fetch_waveform/")
def fetch_waveform(video_name: str):
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
    file_path = os.path.join("/materials", video_name,  f"{video_name}_audio.wav")
    
    def iterfile(file_path: str):
        with open(file_path, mode="rb") as file_like:
            yield from file_like
    
    return StreamingResponse(
        iterfile(file_path),
        media_type="audio/mpeg",
        headers={"Accept-Ranges": "bytes"}
    )

@app.get("/fetch_video/")
def fetch_video(video_name: str, model_name: str,request: Request):
    video_file_name = f"{video_name}_{model_name}.mp4" if model_name else f"{video_name}.mp4"
    file_path = os.path.join("/materials", video_name, video_file_name)
    if not os.path.exists(file_path):
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



'''
@app.get("/{video_id}")
def get_video_snippet(video_id: str):
    video_path = os.path.join(os.environ["VIDEO_DIR"], f"{video_id}.mp4")
    if not os.path.exists(video_path):
        return {"error": "Video file not found"}, 404
    
    command = [
        'ffmpeg',
        '-i', video_path,
        '-t', '5',                  # Duration: 5 seconds
        '-c:v', 'libx264',
        '-preset', 'ultrafast',     # Faster encoding
        '-f', 'mp4',
        '-movflags', 'frag_keyframe+empty_moov+default_base_moof',  # For streaming MP4
        'pipe:1'
    ]

    process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)

    return StreamingResponse(
        process.stdout,
        media_type='video/mp4'
    )
'''
