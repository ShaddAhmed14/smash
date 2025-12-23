# Features
- Maskbench
- EnvisionHgDetector
- Using Videos -> Wavs | Thumbnails
- Using Wavs -> Spectograms | Transcripts
- Using Transcripts -> Video Cluster | Topic Interdistance | Data Map | Temporal Sentiment Analysis
- Using Spectograms -> Voronoi Graph

# Folder Structure -- we need > 5 videos
### materials/

| average_audio_features.json <br>
| video_distribution.json <br>
| topic_interdistance.json <br>
| temporal_sentiment_data.json <br>
| datamap_data.json <br>
| spectogram_voronoi_data.json <br>
| kinematic_features.csv <br>
| gesture_visualizations.csv <br>
<!-- | spectograms/
- videoName_spectogram.png -->

| videoName/ <br>
- | videoName_audio.wav
- | videoName_Original.mp4
- | videoName_peaks.json
- | videoName_transcript.srt
- | videoName_spectogram.png
- | videoName_audio_features.json
- | thumbnails/
    -  videoName_modelName_thumbnail.jpg
- | gesture_segments/
    - videoName_gestureId.mp4
- | processed/
    - videoName_modelName.mp4

# Maskbench
- run maskbench on dataset
- enter `maskbench_output_folder` in variable. 
- function will fetch renderings for each video and save it in output folder automatically. 

# EnvisionHgDetector
- run EnvisionHgDetector on dataset
- enter `envision_hg_detector_output_folder` in variable
- function will fetch gesture_segments per video and save automatically
- function will copy `dtw_distances.csv` and `kinematic_features.csv` from analysis folder.

# Steps
- run `Maskbench` on `dataset_path`. Provide `maskbench_output_folder`.
- run `docker_compose_setup.yml` which will
    - run `EnvisionHgDetector` on `dataset_path`.
    - create materials folder and move Original and Rendered videos per videoName.
    - create materials required in correct folders.
