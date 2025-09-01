import os 
import subprocess
import json
import librosa
# import whisper
import numpy as np

def create_transcript(video_name:str, video_folder_path:str):
    audio_path = os.path.join(video_folder_path, f"{video_name}_audio.wav")
    transcript_path = os.path.join(video_folder_path, f"{video_name}_transcript.json")

    model = whisper.load_model("turbo")
    result = model.transcribe(audio_path)

    with open(transcript_path, 'w') as f:
        json.dump(result, f)

def create_waveform(video_name:str, video_folder_path:str):
    video_path = os.path.join(video_folder_path, f"{video_name}.mp4")
    audio_path = os.path.join(video_folder_path, f"{video_name}_audio.wav")
    waveform_path = os.path.join(video_folder_path, f"{video_name}_waveform.json")
    
    # extract audio file from video
    command = [
        'ffmpeg',
        '-y', '-i', video_path,
        "-vn",  # no video
        "-acodec", "pcm_s16le",
        "-ar", "44100",
        "-ac", "2",
        audio_path
    ]
    subprocess.run(command, check=True)

    # extract audio features
    y, sr = librosa.load(audio_path, sr=None) 
    waveform = y.tolist()
    duration = librosa.get_duration(y=y, sr=sr)
    tempo, beats = librosa.beat.beat_track(y=y, sr=sr)
    times = np.linspace(0, len(y) / sr, num=len(y)).tolist()
    # times = librosa.times_like(y, sr=sr).tolist() / int(sr)

    print(duration, tempo, len(waveform), waveform[0], sr, len(beats), beats[0] , len(times), times[0])

    print("audio features extracted")
    with open(waveform_path, 'w') as f:
        json.dump({
            "waveform": waveform,
            "sample_rate": int(sr),
            "duration": int(duration),
            "tempo": int(tempo[0]),
            "beats": beats.tolist(),
            "times": times
        }, f)   
    

def setup_materials(folder_path:str):
    video_names = [name for name in os.listdir(folder_path) if os.path.isdir(os.path.join(folder_path, name))]
    for video_name in video_names:
        video_folder_path = os.path.join(folder_path, video_name)
        print(video_folder_path, video_name, "ee\n\n")
        create_waveform(video_name, video_folder_path)
        # create_transcript(video_name, video_folder_path)