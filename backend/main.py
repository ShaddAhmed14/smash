from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from glob import glob as glob
import json
import os
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

@app.get("/get_metadata")
def get_metadata():
    # print("fetching metadata")
    file_path = os.path.join("/materials", "metadata.json")
    # print(os.getcwd())
    # print(file_path)
    # print(os.listdir("/materials"))
    if not os.path.exists(file_path):
        return JSONResponse(content={"message": "Metadata File not Found" }, status_code=404)
    with open(file_path) as f:
        data = json.load(f)
    # print(data)
    return JSONResponse(content=data)

# send selected full video
@app.get("/video/{video_name}")
def get_full_video(video_name: str, request: Request):
    print(video_name)
    video_path = os.path.join(os.environ["VIDEO_DIR"], video_name + ".mp4")
    if not os.path.exists(video_path):
        return {"message": "Video Not Found"}, 404
    
    video_file_size = os.path.getsize(video_path)
    range_header = request.headers.get("range")
    if range_header:
        start, end = range_header.replace("bytes=", "").split("-")
        start = int(start)
        end = int(end) if end else video_file_size - 1
        chunk_size = end - start + 1

        def chunk_stream():
            with open(video_path, "rb") as f:
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
            with open(video_path, "rb") as f:
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

@app.delete("/")
def delete_videos():
    result = db.videos.delete_many({})
    return {"message": "Video deleted successfully"}
'''
