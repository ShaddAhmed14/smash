import os 
import subprocess
import json
import librosa
# import whisper
import numpy as np

def setup_materials(folder_path:str):
    video_names = [name for name in os.listdir(folder_path) if os.path.isdir(os.path.join(folder_path, name))]
    for video_name in video_names:
        print("Setting up for video:", video_name)
        video_folder_path = os.path.join(folder_path, video_name)
        audio_analysis(video_name, video_folder_path)

def create_transcript(video_name:str, video_folder_path:str):
    audio_path = os.path.join(video_folder_path, f"{video_name}_audio.wav")
    transcript_path = os.path.join(video_folder_path, f"{video_name}_transcript.json")

    model = whisper.load_model("turbo")
    result = model.transcribe(audio_path)

    with open(transcript_path, 'w') as f:
        json.dump(result, f)

def audio_analysis(video_name:str, video_folder_path:str):
    video_path = os.path.join(video_folder_path, f"{video_name}_original.mp4")
    audio_path = os.path.join(video_folder_path, f"{video_name}_audio.wav")
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
    print("Extracted Audio")

    y, sr = librosa.load(audio_path, sr=None) 
    print("Processing Audio")

    get_audio_features(y, sr, audio_path.replace("_audio.wav", "_audio_features.json"))

    # get_waveform(y, sr, audio_path.replace("_audio.wav", "_waveform.json"))
    # get_volume_features(y, sr, audio_path.replace("_audio.wav", "_volume_features.json"))
    # get_pitch_features(y, sr, audio_path.replace("_audio.wav", "_pitch_features.json"))
    # get_spectral_features(y, sr, audio_path.replace("_audio.wav", "_spectral_features.json"))
    # get_rhythm_features(y, sr, audio_path.replace("_audio.wav", "_rhythm_features.json"))
    # get_advanced_features(y, sr, audio_path.replace("_audio.wav", "_advanced_features.json"))

    print("Completed Audio Feature Extraction")


def get_audio_features(y, sr, file_save_path: str):
    hop_length = 512
    rms = librosa.feature.rms(y=y, hop_length=hop_length)[0]
    f0, voiced_flag, voiced_probs = librosa.pyin(
        y, fmin=librosa.note_to_hz('C2'), 
        fmax=librosa.note_to_hz('C7'),
        hop_length=hop_length
    )
    tempo, beats = librosa.beat.beat_track(y=y, sr=sr)
    times = librosa.frames_to_time(range(len(rms)), sr=sr, hop_length=hop_length)
    
    features = []
    for i in range(len(times)):
        features.append({
            'time': float(times[i]),
            'volume': float(rms[i]) if rms[i] else 0,
            'pitch': float(f0[i]) if not np.isnan(f0[i]) else None,
            'tempo': float(tempo)
        })

    with open(file_save_path, 'w') as f:
        json.dump(features, f)   
    print("Saved Audio Features Data")
    
    return features

def get_waveform(y, sr, file_save_path: str):
    waveform = y.tolist()
    duration = librosa.get_duration(y=y, sr=sr)
    tempo, beats = librosa.beat.beat_track(y=y, sr=sr)
    times = np.linspace(0, len(y) / sr, num=len(y)).tolist()

    with open(file_save_path, 'w') as f:
        json.dump({
            "waveform": waveform,
            "sample_rate": int(sr),
            "duration": int(duration),
            "tempo": int(tempo[0]),
            "beats": beats.tolist(),
            "times": times
        }, f)   
    print("Saved Waveform Data")

def get_volume_features(y, sr, file_save_path: str):
    frame_length = 2048
    hop_length = 512
    rms = librosa.feature.rms(y=y, frame_length=frame_length, hop_length=hop_length)[0]
    rms_db = librosa.amplitude_to_db(rms, ref=np.max)
    spectral_centroid = librosa.feature.spectral_centroid(y=y, sr=sr)[0]
    zcr = librosa.feature.zero_crossing_rate(y, frame_length=frame_length, hop_length=hop_length)[0]
    time_frames = librosa.frames_to_time(range(len(rms)), sr=sr, hop_length=hop_length)

    with open(file_save_path, 'w') as f:
        json.dump({
        'rms': rms.tolist(),
        'rms_db': rms_db.tolist(),
        'spectral_centroid': spectral_centroid.tolist(),
        'zero_crossing_rate': zcr.tolist(),
        'time_frames': time_frames.tolist()
    }, f)
    print("Saved Volume Features")

def get_pitch_features(y, sr, file_save_path: str):
    f0, voiced_flag, voiced_prob = librosa.pyin(
        y, fmin=librosa.note_to_hz('C2'), fmax=librosa.note_to_hz('C7')
    )
    notes = []
    for freq in f0:
        if not np.isnan(freq):
            note = librosa.hz_to_note(freq)
            notes.append(note)
        else:
            notes.append(None)
    chroma = librosa.feature.chroma_stft(y=y, sr=sr)
    pitch_std = np.nanstd(f0)
    time_frames = librosa.frames_to_time(range(len(f0)), sr=sr)
    
    with open(file_save_path, 'w') as f:
        json.dump({
            'f0': f0.tolist(),
            'notes': notes,
            'voiced_flag': voiced_flag.tolist(),
            'voiced_prob': voiced_prob.tolist(),
            'chroma': chroma.tolist(),
            'pitch_std': pitch_std,
            'time_frames': time_frames.tolist()
    }, f)
    print("Saved Pitch Features")

def get_spectral_features(y, sr, file_save_path: str):
    mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
    spectral_rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr)[0]
    spectral_bandwidth = librosa.feature.spectral_bandwidth(y=y, sr=sr)[0]
    spectral_contrast = librosa.feature.spectral_contrast(y=y, sr=sr)
    tonnetz = librosa.feature.tonnetz(y=librosa.effects.harmonic(y), sr=sr)

    time_frames = librosa.frames_to_time(range(mfccs.shape[1]), sr=sr)
    with open(file_save_path, 'w') as f:
        json.dump({
            'mfccs': mfccs.tolist(),
            'spectral_rolloff': spectral_rolloff.tolist(),
            'spectral_bandwidth': spectral_bandwidth.tolist(),
            'spectral_contrast': spectral_contrast.tolist(),
            'tonnetz': tonnetz.tolist(),
            'time_frames': time_frames.tolist()
        }, f)
    print("Saved Spectral Features")

def get_rhythm_features(y, sr, file_save_path: str):
    tempo, beats = librosa.beat.beat_track(y=y, sr=sr)
    beat_times = librosa.frames_to_time(beats, sr=sr)
    hop_length = 512
    oenv = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop_length)
    tempogram = librosa.feature.tempogram(onset_envelope=oenv, sr=sr, hop_length=hop_length)
    rhythm_pattern = librosa.util.sync(oenv, beats)
    
    with open(file_save_path, 'w') as f:
        json.dump({
            'tempo': float(tempo),
            'beats': beats.tolist(),
            'beat_times': beat_times.tolist(),
            'tempogram': tempogram.tolist(),
            'onset_strength': oenv.tolist(),
            'rhythm_pattern': rhythm_pattern.tolist()
        }, f)
    print("Saved Rhythm Features")

def get_advanced_features(y, sr, file_save_path: str):
    y_harmonic, y_percussive = librosa.effects.hpss(y)
    onset_frames = librosa.onset.onset_detect(y=y, sr=sr)
    onset_times = librosa.frames_to_time(onset_frames, sr=sr)
    rms = librosa.feature.rms(y=y)[0]
    dynamic_range = np.max(rms) - np.min(rms[rms > 0])  # Exclude silence
    spectral_flatness = librosa.feature.spectral_flatness(y=y)[0]
    poly_features = librosa.feature.poly_features(y=y, sr=sr)

    with open(file_save_path, 'w') as f:
        json.dump({
            'harmonic_component': y_harmonic.tolist(),
            'percussive_component': y_percussive.tolist(),
            'onset_times': onset_times.tolist(),
            'dynamic_range': float(dynamic_range),
            'spectral_flatness': spectral_flatness.tolist(),
            'poly_features': poly_features.tolist()
        }, f)
    print("Saved Advanced Features")

