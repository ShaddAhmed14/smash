from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse, FileResponse, StreamingResponse
import os
import json
import base64

router = APIRouter(prefix="/preview", tags=["preview"])

VIDEO_TYPES = ["Original", "YoloPose", "MediaPipePose", "OpenPose", "MaskAnyoneAPI-MediaPipe", "MaskAnyoneAPI-OpenPose"]

@router.get("/")
def preview_home():
    return {"message": "Preview Router is working"}

@router.get("/fetch_models/")
def fetch_models():
    return JSONResponse(content={"models": VIDEO_TYPES})

@router.get("/fetch_metadata_graph")
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

@router.get("/fetch_audio")
async def stream_audio(video_name: str):
    file_path = os.path.join("/materials", video_name,  f"{video_name}_audio.wav")
    
    def iterfile(file_path: str):
        with open(file_path, mode="rb") as file_like:
            yield from file_like
    
    return StreamingResponse(
        iterfile(file_path),
        media_type="audio/mpeg",
        headers={"Accept-Ranges": "bytes"}
    )

@router.get("/fetch_thumbnails/")
async def fetch_thumbnails(video_name: str, selectedModel: str):
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

@router.get("/fetch_video/")
async def fetch_video(video_name: str, model_name: str, request: Request):
    if model_name == "Original":
        file_path = os.path.join("/materials", video_name, f"{video_name}_{model_name}.mp4")
    else:
        file_path = os.path.join("/materials", video_name, "processed", f"{video_name}_{model_name}.mp4")

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

@router.get("/audio_peaks")
async def fetch_audio_peaks(video_name: str):
    file_path = os.path.join("/materials", video_name,  f"{video_name}_peaks.json")
    if not os.path.exists(file_path):
        return JSONResponse(content={"message": "Audio Peaks file not found"}, status_code=404)
    
    return FileResponse(file_path, media_type='application/json', filename=f"{video_name}_peaks.json")

@router.get("/fetch_metadata")
async def fetch_metadata():
    # return JSONResponse(content={"message": "Metadata endpoint working"})
    file_path = os.path.join("/materials", "metadata.json")
    if not os.path.exists(file_path):
        return JSONResponse(content={"message": "Metadata File not Found" }, status_code=404)
    with open(file_path, 'r') as f:
        data = json.load(f)
    return JSONResponse(content=data)

@router.get("/fetch_transcript/")
async def fetch_transcript(video_name: str):
    file_path = os.path.join("/materials", video_name, f"{video_name}_transcript.srt")
    if not os.path.exists(file_path):
        return JSONResponse(content={"message": "Transcript file not found"}, status_code=404)
    
    return FileResponse(file_path, media_type='text/plain', filename=f"{video_name}_transcript.srt")

@router.get("/fetch_waveform/")
async def fetch_waveform(video_name: str):
    file_path = os.path.join("/materials", video_name,  f"{video_name}_waveform.json")
    if not os.path.exists(file_path):
        return JSONResponse(content={"message": "Waveform file not found"}, status_code=404)

    return FileResponse(file_path, media_type='application/json', filename=f"{video_name}_waveform.json")
    
