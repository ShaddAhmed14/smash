import os
import glob
import subprocess
import librosa
import json
import shutil
import numpy as np
import matplotlib.pyplot as plt

from envisionhgdetector import GestureDetector
from envisionhgdetector import utils

from transcript_analysis import setup_transcript_analysis
from spectogram_analysis import setup_spectogram_analysis

'''
def batch_create_wav(video_folder_path, output_path):
    video_list = glob.glob(os.path.join(video_folder_path, "*.mp4")) # get all video files
    os.makedirs(output_path, exist_ok=True)
    for video in video_list:
        print("Creating Wav File For", video)
        base_video_name, ext= os.path.splitext(os.path.basename(video))
        audio_save_path = os.path.join(output_path, f"{base_video_name}_audio.wav")
        create_wav(video, audio_save_path)
'''
def create_wav(video_path, audio_path):
    print("Extracting Audio from", video_path)
    if os.path.exists(audio_path):
        print(f"Audio file {audio_path} already exists. Skipping extraction.")
        return
    command = [
        'ffmpeg',
        '-y', '-i', video_path,
        "-vn",  # no video. only audio
        "-acodec", "pcm_s16le",
        "-ar", "44100",
        "-ac", "2",
        audio_path
    ]
    subprocess.run(command, check=True)

'''
def batch_create_transcript(video_folder_path, output_path):
    os.makedirs(output_path, exist_ok=True)
    audio_list = glob.glob(os.path.join(video_folder_path, "*.wav")) # get all audio files
    for audio_path in audio_list:
        print("Creating Transcript For", audio_path)
        create_transcript(audio_path, output_path)
'''
def create_transcript(audio_path, video_folder):
    print("Generating Transcript from", audio_path)
    default_path = audio_path.replace(".wav", ".srt")
    transcript_path = default_path.replace("audio", "transcript")
    if os.path.exists(transcript_path):
        print(f"Transcript for {audio_path} already exists. Skipping transcription.")
        return
    
    command = [ 'python', 
               '-m', 'whisper', 
               audio_path, 
               '--model', 'tiny', # tiny, base, small, medium, large, turbo
               '--output_dir', video_folder,
                '--language', 'en',
                '--output_format', 'srt',
                '--max_words_per_line', '10',
                '--word_timestamps', 'True'
    ]
    subprocess.run(command, check=True)
    os.rename(default_path, transcript_path) # rename default output file

'''
def batch_create_spectograms(audio_folder_path, output_path):
    os.makedirs(output_path, exist_ok=True)
    audio_list = glob.glob(os.path.join(audio_folder_path, "*.wav")) # get all audio files
    for audio in audio_list:
        base_audio_name, ext= os.path.splitext(os.path.basename(audio))
        print("Generating Spectrogram For", base_audio_name)
        
        y, sr = librosa.load(audio, sr=None)
        S = librosa.feature.melspectrogram(y=y, sr=sr, n_mels=128)
        S_dB = librosa.power_to_db(S, ref=np.max)

        plt.figure(figsize=(10, 4), frameon=False)
        librosa.display.specshow(S_dB, sr=sr, x_axis=None, y_axis=None)
        plt.savefig(output_path, bbox_inches='tight', pad_inches=0)
        plt.close()
'''

def create_spectogram(audio_path):
    print("Generating Spectrogram from", audio_path)
    output_path = audio_path.replace("audio.wav", "spectrogram.png")
    if os.path.exists(output_path):
        print(f"Spectrogram for {audio_path} already exists. Skipping generation.")
        return

    y, sr = librosa.load(audio_path, sr=None)
    S = librosa.feature.melspectrogram(y=y, sr=sr, n_mels=128)
    S_dB = librosa.power_to_db(S, ref=np.max)

    plt.figure(figsize=(10, 4), frameon=False)
    librosa.display.specshow(S_dB, sr=sr, x_axis=None, y_axis=None)
    plt.savefig(output_path, bbox_inches='tight', pad_inches=0)
    plt.close()

def create_audio_features(audio_path):
    print("Creating Audio Features from", audio_path)
    output_path = audio_path.replace("audio.wav", "audio_features.json")
    if os.path.exists(output_path):
        print(f"Audio features for {audio_path} already exists. Skipping feature extraction.")
        return
    
    y, sr = librosa.load(audio_path, sr=None)
    hop_length = 512
    frame_times = librosa.frames_to_time(np.arange(len(y)//hop_length), sr=sr, hop_length=hop_length)
    
    pitches, magnitudes = librosa.piptrack(y=y, sr=sr, hop_length=hop_length)
    pitch_values = []
    for i in range(pitches.shape[1]):
        index = magnitudes[:, i].argmax()
        pitch = pitches[index, i]
        pitch_values.append(float(pitch) if pitch > 0 else 0.0)
    
    rms = librosa.feature.rms(y=y, hop_length=hop_length)[0]
    volume_db = librosa.amplitude_to_db(rms, ref=np.max).tolist()

    onset_env = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop_length)
    temp_frames = []
    window_size = 384
    for i in range(0, len(onset_env), window_size // 4):
        window = onset_env[i:i + window_size]
        if len(window) > 0:
            tempo = librosa.beat.tempo(onset_envelope=window, sr=sr, hop_length=hop_length)
            temp_frames.extend([float(tempo[0])] * min(window_size // 4, len(onset_env) - i))
    
    min_len = min(len(frame_times), len(pitch_values), len(volume_db), len(temp_frames))
    features = {
        "time": frame_times[:min_len].tolist(),
        "pitch": pitch_values[:min_len],
        "volume": volume_db[:min_len],
        "tempo": temp_frames[:min_len],
        "sample_rate": sr,
        "duration": librosa.get_duration(y=y, sr=sr)
    }

    with open(output_path, 'w') as f:
        json.dump(features, f)

'''
def batch_create_audio_features(audio_folder_path, output_path):
    os.makedirs(output_path, exist_ok=True)
    audio_list = glob.glob(os.path.join(audio_folder_path, "*.wav")) # get all audio files

    for audio in audio_list:
        print("Creating Audio Features For", audio)
        create_audio_features(audio)
'''

def average_audio_features():
    print("Creating Average Audio Features for all materials")
    audio_features_list = glob.glob(os.path.join("/materials", "*", "*_audio_features.json")) 
    file_save_path = "/materials/average_audio_features.json"
    if os.path.exists(file_save_path):
        print(f"Average audio features file {file_save_path} already exists. Skipping creation.")
        return

    titles = []
    avg_pitch = []
    avg_volume = []
    avg_tempo = []
    for file in audio_features_list:
        with open(file, 'r') as f:
            features = json.load(f)
        titles.append(os.path.basename(file).replace("_audio_features.json", ""))
        avg_pitch.append(np.mean([p for p in features["pitch"] if p > 0]))
        avg_volume.append(np.mean(features["volume"]))
        avg_tempo.append(np.mean(features["tempo"]))
    
    with open(file_save_path, 'w') as f:
        json.dump({
            "titles": titles,
            "avg_pitch": avg_pitch,
            "avg_volume": avg_volume,
            "avg_tempo": avg_tempo
        }, f)

'''
# rename videos to replace " " with "_"
def rename_videos(folder_path):
    video_list = glob.glob(os.path.join(folder_path, "*.mp4")) # get all video files
    for video in video_list:
        video_name = os.path.basename(video)
        new_video_name = video_name.replace(" ", "_")
        os.rename(video, os.path.join(folder_path, new_video_name))
'''
def create_audio_peaks(audio_path):
    print("Creating Audio Peaks from", audio_path)
    output_path = audio_path.replace("audio.wav", "peaks.json")
    if os.path.exists(output_path):
        print(f"Audio peaks for {audio_path} already exists. Skipping peak extraction.")
        return
    y, sr = librosa.load(audio_path, sr=None)
    block_size = len(y) // 1000
    peaks = [float(np.max(np.abs(y[i*block_size:(i+1)*block_size]))) for i in range(1000)]
    with open(output_path, 'w') as f:
        json.dump({
            "duration": len(y) / sr,
            "peaks": peaks
        }, f)

def fix_codex(video_folder, codex_fixed_folder):
    os.makedirs(codex_fixed_folder, exist_ok=True)
    video_list = glob.glob(os.path.join(video_folder, "*.mp4"))
    for video in video_list:
        output_path = os.path.join(codex_fixed_folder, os.path.basename(video))
        if os.path.exists(output_path):
            print(f"Codex fixed video for {video} already exists. Skipping.")
            continue
        
        print("Fixing Codex of", video)
        command = [
            "ffmpeg",
            "-y",  # Overwrite output file if it exists
            "-i", video,
            "-c:v", "libx264",
            "-preset", "fast",
            "-c:a", "aac",
            "-b:a", "128k",
            output_path
        ]
        subprocess.run(command, check=True)

def create_thumbnail(video_folder, thumbnail_folder):
    print("Creating Thumbnails for videos in", video_folder)
    os.makedirs(thumbnail_folder, exist_ok=True)
    video_paths = glob.glob(os.path.join(video_folder, "*.mp4")) + glob.glob(os.path.join(video_folder,"*", "*.mp4"))

    for video in video_paths:
        base_video_name, ext = os.path.splitext(os.path.basename(video))
        thumbnail_path = os.path.join(thumbnail_folder, f"{base_video_name}_thumbnail.jpg")
        if os.path.exists(thumbnail_path):
            print(f"Thumbnail for {video} already exists. Skipping.")
            continue
        command = [
            'ffmpeg',
            '-y', '-i', video,
            '-ss', '00:00:20.000',
            '-vframes', '1',
            thumbnail_path
        ]
        subprocess.run(command, check=True)

def run_envisionhgdetector():
    envisionhgdetector_output_folder = "/envisionhgdetector_output"
    gesture_segments_folder = os.path.join(envisionhgdetector_output_folder, "gesture_segments")
    retracked_folder = os.path.join(envisionhgdetector_output_folder, "retracked")
    analysis_folder = os.path.join(envisionhgdetector_output_folder, "analysis")

    print("Running EnvisionHGDetector on dataset...")
    detector = GestureDetector(motion_threshold=0.75, gesture_threshold=0.75, min_gap_s=0.0, min_length_s=0.25, model_type="lightgbm")
    detector.process_folder(input_folder="/dataset", output_folder=envisionhgdetector_output_folder)

    print("Analyzing gesture segments...")
    utils.cut_video_by_segments(envisionhgdetector_output_folder)
    if os.path.exists(gesture_segments_folder):
         segment_files = [f for f in os.listdir(gesture_segments_folder) if f.endswith('.mp4')]
         print(f"Found {len(segment_files)} segment files")
    else:
         print("Gesture segments folder not found!")

    print("Retracking gestures...")
    detector.retrack_gestures(input_folder=gesture_segments_folder, output_folder=retracked_folder)
    print("Analyzing DTW kinematics...")
    # tracking_results["landmarks_folder"],
    detector.analyze_dtw_kinematics(output_folder=analysis_folder, landmarks_folder=retracked_folder)

    shutil.copy2(os.path.join(analysis_folder, "gesture_visualization.csv"), "/materials/gesture_visualization.csv")
    shutil.copy2(os.path.join(analysis_folder, "kinematic_features.csv"), "/materials/kinematic_features.csv")

    print("Copying gesture segments to materials folder...")
    video_list = glob.glob(os.path.join("/dataset", "*.mp4")) # get all video paths
    for video_path in video_list:
        base_video_name, ext = os.path.splitext(os.path.basename(video_path))
        
        gesture_segments_temp = os.path.join("/materials", base_video_name, "gesture_segments_temp")
        os.makedirs(gesture_segments_temp, exist_ok=True)
        gesture_segments = os.path.join("/materials", base_video_name, "gesture_segments")
        os.makedirs(gesture_segments, exist_ok=True)

        matching_gesture_segment = glob.glob(os.path.join(retracked_folder, "tracked_videos", f"{base_video_name}*"))
        for segment in matching_gesture_segment:
            shutil.copy2(segment, gesture_segments_temp)
        fix_codex(gesture_segments_temp, gesture_segments)
        shutil.rmtree(gesture_segments_temp)  # remove temp folder to save space
            

def setup_materials():
    video_list = glob.glob(os.path.join("/dataset", "*.mp4")) # get all video paths
    if len(video_list) == 0:
        raise ValueError("No videos found in /dataset folder for material preparation.")
    print(f"Found {len(video_list)} videos for material preparation.")
    
    for video_path in video_list:
        base_video_name, ext = os.path.splitext(os.path.basename(video_path))
        print(f"Processing video: {base_video_name}")
        
        # copy original video to materials folder
        materials_video_folder = os.path.join("/materials", base_video_name)
        os.makedirs(materials_video_folder, exist_ok=True)
        materials_video_path = os.path.join(materials_video_folder, f"{base_video_name}_Original.mp4")
        if not os.path.exists(materials_video_path):
            shutil.copy2(video_path, materials_video_path)
        else:
            print(f"Copied original video to {materials_video_path}")
        
        # copy maskbench videos to materials folder
        maskbench_video_output = os.path.join("/maskbench_output/renderings", base_video_name)
        if not os.path.exists(maskbench_video_output): # if video has no maskbench output
            raise ValueError(f"No Maskbench output found for video {base_video_name} in /maskbench_output/renderings/. Please ensure Maskbench has processed the video.")
        maskbench_videos = glob.glob(os.path.join(maskbench_video_output, "*.mp4"))
        
        maskbench_folder = os.path.join(materials_video_folder, "maskbench")
        os.makedirs(maskbench_folder, exist_ok=True)
        for mb_video in maskbench_videos:
            mb_video_name = os.path.basename(mb_video)
            mb_destination_path = os.path.join(maskbench_folder, mb_video_name)
            if not os.path.exists(mb_destination_path):
                shutil.copy2(mb_video, mb_destination_path)
            else:
                print(f"Maskbench video {mb_video_name} already exists in {maskbench_folder}. Skipping copy.")
        print(f"Copied Maskbench videos to {maskbench_folder}")

        # fix codex of videos -- delete or replace videos to avoid extra storage
        fix_codex(maskbench_folder, os.path.join(materials_video_folder, "processed"))
        shutil.rmtree(maskbench_folder)  # remove original maskbench folder to save space
        print(f"Fixed codex for Maskbench videos in {os.path.join(materials_video_folder, 'processed')}")

        # create materials
        audio_path = materials_video_path.replace("Original.mp4", "audio.wav")
        create_wav(materials_video_path, audio_path)
        create_transcript(audio_path, materials_video_folder)
        create_audio_peaks(audio_path)
        create_thumbnail(materials_video_folder, os.path.join(materials_video_folder, "thumbnails"))
        create_spectogram(audio_path)
        create_audio_features(audio_path)
    
    # create average audio features
    average_audio_features()

# main execution
os.makedirs("/materials", exist_ok=True)
# setup_materials()
# setup_transcript_analysis()
# setup_spectogram_analysis()
run_envisionhgdetector()
