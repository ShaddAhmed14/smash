
# Steps
1. Set environment variables in `.env`.
2. Ensure you have more than 5 videos in `DATASET_FOLDER`.
3. Run [Maskbench](https://github.com/maskbench/maskbench) on dataset and move results to `MASKBENCH_OUTPUT_FOLDER`.
4. **Build and run the SMASH Setup Docker container**.
```bash
    docker compose -f docker_compose_setup.yml build
```
```bash
    docker compose -f docker_compose_setup.yml up
```

# Expected Materials Folder Structure 
``` bash
materials/
├── average_audio_features.json
├── video_distribution.json
├── topic_interdistance.json
├── temporal_sentiment_data.json
├── datamap_data.json
├── spectogram_voronoi_data.json
├── kinematic_features.csv
├── gesture_visualizations.csv
├── matadata.json
├── sbert.json
├── tfidf.json
├── videoName/
    ├── videoName_audio.wav
    ├──  videoName_Original.mp4
    ├── videoName_peaks.json
    ├── videoName_per_talk.json
    ├── videoName_spacey.json
    ├── videoName_transcript.srt
    ├── videoName_spectogram.png
    ├── videoName_audio_features.json
    ├── thumbnails/
    |   └──  videoName_modelName_thumbnail.jpg
    ├── gesture_segments/
    |   └── videoName_gestureId_tracked.mp4
    ├── processed/
    |   └── videoName_modelName.mp4
    └── dependency_trees/
        └── treeNumber.svg
```
