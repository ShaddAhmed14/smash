import os
import glob
import shutil
import subprocess
import librosa
import json
import numpy as np
import matplotlib.pyplot as plt

# from envisionhgdetector import GestureDetector
# from envisionhgdetector import utils

# remember to activate envisionhgdetector conda environment

def batch_create_wav(video_folder_path, output_path):
    video_list = glob.glob(os.path.join(video_folder_path, "*.mp4")) # get all video files
    os.makedirs(output_path, exist_ok=True)
    for video in video_list:
        print("Creating Wav File For", video)
        base_video_name, ext= os.path.splitext(os.path.basename(video))
        audio_save_path = os.path.join(output_path, f"{base_video_name}_audio.wav")
        create_wav(video, audio_save_path)

def create_wav(video_path, audio_path):
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

def batch_create_transcript(video_folder_path, output_path):
    os.makedirs(output_path, exist_ok=True)
    audio_list = glob.glob(os.path.join(video_folder_path, "*.wav")) # get all audio files
    for audio_path in audio_list:
        print("Creating Transcript For", audio_path)
        create_transcript(audio_path, output_path)

# confirm output naming scheme
def create_transcript(audio_path, video_folder):
    command = [ 'python', 
               '-m', 'whisper', 
               audio_path, 
               '--model', 'large',
               '--output_dir', video_folder,
                '--language', 'en',
                '--output_format', 'srt',
                '--max_words_per_line', '10',
                '--word_timestamps', 'True'
    ]
    subprocess.run(command, check=True)

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
        spectogram_path = os.path.join(output_path, f"{base_audio_name}_spectrogram.png")
        plt.savefig(spectogram_path, bbox_inches='tight', pad_inches=0)
        plt.close()

def batch_create_audio_features(audio_folder_path, output_path):
    os.makedirs(output_path, exist_ok=True)
    audio_list = glob.glob(os.path.join(audio_folder_path, "*.wav")) # get all audio files

    for audio in audio_list:
        base_audio_name, ext= os.path.splitext(os.path.basename(audio))
        print("Extracting Audio Features For", base_audio_name)
        
        feature_save_path = os.path.join(output_path, f"{base_audio_name}_features.json")
        y, sr = librosa.load(audio, sr=None)
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

        with open(feature_save_path, 'w') as f:
            json.dump(features, f)

def average_audio_features(features_folder_path):
    audio_features_list = glob.glob(os.path.join(features_folder_path, "*.json")) # get all audio feature files
    file_save_path = "average_audio_features.json"
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

# rename videos to replace space with _
def rename_videos(folder_path):
    video_list = glob.glob(os.path.join(folder_path, "*.mp4")) # get all video files
    for video in video_list:
        video_name = os.path.basename(video)
        new_video_name = video_name.replace(" ", "_")
        os.rename(video, os.path.join(folder_path, new_video_name))

def create_audio_peaks(audio_path, output_path):
    print("Creating Audio Peaks For", audio_path)
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
        print("Fixing Codex of", video, output_path)
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

def create_thumbnail(video_folder:str, thumbnail_folder:str):
    os.makedirs(thumbnail_folder, exist_ok=True)
    video_paths = glob.glob(os.path.join(video_folder, "*.mp4")) + glob.glob(os.path.join(video_folder,"*", "*.mp4"))

    for video in video_paths:
        base_video_name, ext = os.path.splitext(os.path.basename(video))
        thumbnail_path = os.path.join(thumbnail_folder, f"{base_video_name}_thumbnail.jpg")
        command = [
            'ffmpeg',
            '-y', '-i', video,
            '-ss', '00:00:15.000',
            '-vframes', '1',
            thumbnail_path
        ]
        subprocess.run(command, check=True)
        print(f"Created Thumbnail for {base_video_name}")     

def setup_materials(video_folder_path):
    processed_videos_folder = "TedTalks-20251005-134349/renderings/" # /video_name/video_name_model_name.mp4
    video_list = glob.glob(os.path.join(video_folder_path, "*.mp4")) # get all video files
    
    for video in video_list:
        base_video_name, ext= os.path.splitext(os.path.basename(video))
        video_folder = f"materials/{base_video_name}/"
        os.makedirs(video_folder, exist_ok=True)

        video_name = f"{base_video_name}_Original.mp4"
        video_path = f"{video_folder}/{video_name}"
        # shutil.copy(video, video_path)

        codex_fixed_folder = os.path.join(video_folder, "processed")
        non_codex_fixed_folder = os.path.join(video_folder, "maskbench")

        audio_save_path = video_path.replace("_Original.mp4", "_audio.wav")
        transcript_save_path = audio_save_path.replace("_audio.wav", "_transcript.srt")
        peaks_save_path = audio_save_path.replace("_audio.wav", "_peaks2.json")
        thumbnail_folder = os.path.join(video_folder, "thumbnails")

        create_wav(video_path, audio_save_path)
        create_transcript(audio_save_path, video_folder, transcript_save_path)
        fix_codex(non_codex_fixed_folder, codex_fixed_folder)
        create_thumbnail(video_folder, thumbnail_folder)
        create_audio_peaks(audio_save_path, peaks_save_path)


if __name__ == "__main__":
    video_folder_path = "TED_video_subset"
    materials_folder_path = "materials"
    envision_output =  "envisionhgdetector_output"

    os.makedirs(materials_folder_path, exist_ok=True)
    rename_videos(video_folder_path)
    setup_materials(video_folder_path)
    # run_envision(folder_path, envision_output)
    batch_create_transcript("wavs", "transcripts")
    batch_create_spectograms("wavs", "spectograms")
    batch_create_audio_features("wavs", "audio_features")
    average_audio_features("audio_features")
    fix_codex("/scratch1/sshaikh/TED/ted_eng_osf_output/retracked/tracked_videos", "/scratch1/sshaikh/TED/ted_eng_osf_output/retracked/encoded_tracked_videos")


'''
# def run_envision(folder_path, envision_output):
#     
#     # step 1
#     detector = GestureDetector(motion_threshold=0.75, gesture_threshold=0.75, min_gap_s=0.0, min_length_s=0.25, model_type="lightgbm")
#     # detector.process_folder(
#     #     input_folder=folder_path,
#     #     output_folder=envision_output,
#     # )
#     # step 2: segment the gesture videos
#     # segments = utils.cut_video_by_segments(envision_output)
#     # step 3: retrack the gesture videos
#     gesture_segments_folder = os.path.join(envision_output, "gesture_segments")
#     retracked_folder = os.path.join(envision_output, "retracked")
#     analysis_folder = os.path.join(envision_output, "analysis")

#     print(f"\nLooking for segments in: {gesture_segments_folder}")
#     if os.path.exists(gesture_segments_folder):
#         segment_files = [f for f in os.listdir(gesture_segments_folder) if f.endswith('.mp4')]
#         print(f"Found {len(segment_files)} segment files")
#     else:
#         print("Gesture segments folder not found!")

#     # print("\nStep 4: Retracking gestures...")
#     # tracking_results = detector.retrack_gestures(
#     #     input_folder=gesture_segments_folder,
#     #     output_folder=retracked_folder
#     # )
#     # print(f"Tracking results: {tracking_results}")
#     # step 5: compute dtw
#     analysis_results = detector.analyze_dtw_kinematics(
#         landmarks_folder= retracked_folder, # tracking_results["landmarks_folder"],
#         output_folder=analysis_folder
#     )
#     print(f"Analysis results: {analysis_results}")
    '''