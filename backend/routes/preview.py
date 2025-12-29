import glob
from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import JSONResponse, FileResponse, StreamingResponse
import os
import json
import base64
from utils.security import sanitize_video_name, sanitize_model_name, safe_join_path

router = APIRouter(prefix="/preview", tags=["preview"])

VIDEO_TYPES = ["Original", "YoloPose", "MediaPipePose", "OpenPose", "MaskAnyoneAPI-MediaPipe", "MaskAnyoneAPI-OpenPose"]
MATERIALS_PATH = os.getenv("MATERIALS_FOLDER", "/materials")


def find_video_name(video_id: str) -> str:
    """
    Find the full video folder name from a video ID prefix.
    Returns sanitized video name or raises HTTPException if not found.
    """
    # Sanitize the input first
    video_id = sanitize_video_name(video_id)

    video_folders = glob.glob(os.path.join(MATERIALS_PATH, "*"))
    for folder in video_folders:
        folder_name = os.path.basename(folder)
        if folder_name.startswith(video_id):
            return folder_name

    raise HTTPException(status_code=404, detail="Video not found")


@router.get("/")
def preview_home():
    return {"message": "Preview Router is working"}


@router.get("/fetch_models/")
def fetch_models():
    return JSONResponse(content={"models": VIDEO_TYPES})


@router.get("/fetch_metadata_graph")
async def fetch_metadata_graph():
    file_path = safe_join_path(MATERIALS_PATH, "metadata.json")
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Metadata Graph File not Found")

    try:
        with open(file_path) as f:
            data = json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        raise HTTPException(status_code=500, detail="Error reading metadata file")

    speaker_gender = [item.get('speaker_gender') for item in data]
    language = [item.get('language') for item in data]
    duration = [item.get('duration') for item in data]
    video_name = [item.get('video_name') for item in data]
    topics = [item.get('topics', []) for item in data]

    return JSONResponse({
        "speaker_gender": speaker_gender,
        "language": language,
        "duration": duration,
        "video_name": video_name,
        "topics": topics
    })


@router.get("/fetch_audio")
async def stream_audio(video_name: str):
    video_name = find_video_name(video_name)
    file_path = safe_join_path(MATERIALS_PATH, video_name, f"{video_name}_audio.wav")

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Audio file not found")

    def iterfile(file_path: str):
        try:
            with open(file_path, mode="rb") as file_like:
                yield from file_like
        except IOError:
            raise HTTPException(status_code=500, detail="Error reading audio file")

    return StreamingResponse(
        iterfile(file_path),
        media_type="audio/mpeg",
        headers={"Accept-Ranges": "bytes"}
    )


@router.get("/fetch_thumbnails/")
async def fetch_thumbnails(video_name: str, selectedModel: str):
    video_name = find_video_name(video_name)
    selectedModel = sanitize_model_name(selectedModel, VIDEO_TYPES)

    thumbnails_dir = safe_join_path(MATERIALS_PATH, video_name, "thumbnails")
    thumbnails = {}

    for model_name in VIDEO_TYPES:
        thumbnail_path = safe_join_path(thumbnails_dir, f"{video_name}_{model_name}_thumbnail.jpg")

        if os.path.exists(thumbnail_path):
            try:
                with open(thumbnail_path, "rb") as img_file:
                    image_extension = thumbnail_path.split('.')[-1].lower()
                    mime_type = f"image/{image_extension}" if image_extension in ["jpeg", "jpg", "png", "gif"] else "image/jpeg"
                    b64_string = base64.b64encode(img_file.read()).decode('utf-8')
                    thumbnails[model_name] = f"data:{mime_type};base64,{b64_string}"
            except IOError:
                thumbnails[model_name] = None
        else:
            thumbnails[model_name] = None

    # Remove selected model from response
    thumbnails.pop(selectedModel, None)
    return JSONResponse(content=thumbnails)


@router.get("/fetch_thumbnail/")
async def fetch_thumbnail(video_name: str):
    video_name = find_video_name(video_name)
    thumbnails_dir = safe_join_path(MATERIALS_PATH, video_name, "thumbnails")
    img_file = safe_join_path(thumbnails_dir, f"{video_name}_Original_thumbnail.jpg")

    if not os.path.exists(img_file):
        raise HTTPException(status_code=404, detail="Thumbnail not found")

    return FileResponse(img_file, media_type='image/jpeg', filename=f"{video_name}_Original_thumbnail.jpg")


@router.get("/fetch_video/")
async def fetch_video(video_name: str, model_name: str, request: Request):
    video_name = find_video_name(video_name)
    model_name = sanitize_model_name(model_name, VIDEO_TYPES)

    if model_name == "Original":
        file_path = safe_join_path(MATERIALS_PATH, video_name, f"{video_name}_{model_name}.mp4")
    else:
        file_path = safe_join_path(MATERIALS_PATH, video_name, "processed", f"{video_name}_{model_name}.mp4")

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Video file not found")

    try:
        video_file_size = os.path.getsize(file_path)
    except OSError:
        raise HTTPException(status_code=500, detail="Error accessing video file")

    range_header = request.headers.get("range")
    if range_header:
        try:
            start, end = range_header.replace("bytes=", "").split("-")
            start = int(start)
            end = int(end) if end else video_file_size - 1
            # Validate range
            if start < 0 or end >= video_file_size or start > end:
                raise HTTPException(status_code=416, detail="Invalid range")
            chunk_size = end - start + 1
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid range header")

        def chunk_stream():
            try:
                with open(file_path, "rb") as f:
                    f.seek(start)
                    yield f.read(chunk_size)
            except IOError:
                raise HTTPException(status_code=500, detail="Error reading video file")

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
            try:
                with open(file_path, "rb") as f:
                    yield from f
            except IOError:
                raise HTTPException(status_code=500, detail="Error reading video file")

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
    video_name = find_video_name(video_name)
    file_path = safe_join_path(MATERIALS_PATH, video_name, f"{video_name}_peaks.json")

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Audio Peaks file not found")

    return FileResponse(file_path, media_type='application/json', filename=f"{video_name}_peaks.json")


@router.get("/fetch_metadata")
async def fetch_metadata():
    file_path = safe_join_path(MATERIALS_PATH, "metadata.json")
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Metadata File not Found")

    try:
        with open(file_path, 'r') as f:
            data = json.load(f)
    except (json.JSONDecodeError, IOError):
        raise HTTPException(status_code=500, detail="Error reading metadata file")

    num_videos = len(data)
    unique_speakers = set(item.get('speaker_name', '') for item in data)
    num_speakers = len(unique_speakers)
    years = set(item.get('year') for item in data if item.get('year'))
    languages = set(item.get('language') for item in data if item.get('language'))
    genders = set(item.get('speaker_gender') for item in data if item.get('speaker_gender'))
    total_duration = sum(item.get('duration', 0) for item in data)

    topics = set()
    for item in data:
        topics.update(item.get('topics', []))

    result = {
        "num_videos": num_videos,
        "num_speakers": num_speakers,
        "years": list(years),
        "languages": list(languages),
        "total_duration": total_duration,
        "genders": list(genders),
        "topics": list(topics),
        "data": data
    }
    return JSONResponse(content=result)


@router.get("/fetch_transcript/")
async def fetch_transcript(video_name: str):
    video_name = find_video_name(video_name)
    file_path = safe_join_path(MATERIALS_PATH, video_name, f"{video_name}_transcript.srt")

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Transcript file not found")

    return FileResponse(file_path, media_type='text/plain', filename=f"{video_name}_transcript.srt")


@router.get("/fetch_waveform/")
async def fetch_waveform(video_name: str):
    video_name = find_video_name(video_name)
    file_path = safe_join_path(MATERIALS_PATH, video_name, f"{video_name}_waveform.json")

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Waveform file not found")

    return FileResponse(file_path, media_type='application/json', filename=f"{video_name}_waveform.json")
