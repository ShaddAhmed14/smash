"""Shared fixtures for backend tests.

Creates a temporary materials directory with mock data so tests
don't depend on real video files or external state.
"""

import json
import os
import tempfile
from pathlib import Path

import pytest
from fastapi.testclient import TestClient


@pytest.fixture(scope="session")
def materials_dir():
    """Create a temporary materials folder with mock data."""
    with tempfile.TemporaryDirectory() as tmpdir:
        root = Path(tmpdir)

        # --- Corpus-level files ---

        metadata = [
            {
                "video_name": "TestVideo001",
                "speaker_name": "Alice",
                "speaker_gender": "Female",
                "language": "English",
                "year": 2024,
                "duration": 120.5,
                "topics": ["AI", "Ethics"],
            },
            {
                "video_name": "TestVideo002",
                "speaker_name": "Bob",
                "speaker_gender": "Male",
                "language": "English",
                "year": 2023,
                "duration": 300.0,
                "topics": ["Climate"],
            },
        ]
        (root / "metadata.json").write_text(json.dumps(metadata))
        (root / "video_distribution.json").write_text(json.dumps({"data": []}))
        (root / "topic_interdistance.json").write_text(json.dumps({"data": []}))
        (root / "temporal_sentiment_data.json").write_text(json.dumps({"data": []}))
        (root / "datamap_data.json").write_text(json.dumps({"data": []}))
        (root / "average_audio_features.json").write_text(json.dumps({"data": []}))
        (root / "max_audio_features.json").write_text(json.dumps({"data": []}))
        (root / "spectrogram_voronoi_data.json").write_text(json.dumps({"data": []}))
        (root / "average_prosody_features.json").write_text(json.dumps({
            "titles": ["TestVideo001", "TestVideo002"],
            "avg_F0semitoneFrom27.5Hz_sma3nz": [25.0, 28.0],
        }))
        (root / "average_facial_expressions.json").write_text(json.dumps({
            "titles": ["TestVideo001"],
            "dominant_emotions": ["happiness"],
            "avg_happiness": [0.65],
        }))
        (root / "visual_similarity_map.json").write_text(json.dumps({
            "titles": ["TestVideo001", "TestVideo002"],
            "coords_2d": [[0.1, 0.2], [-0.3, 0.5]],
            "labels": [0, 1],
        }))
        (root / "tfidf.json").write_text(json.dumps({"nodes": [], "edges": []}))
        (root / "sbert.json").write_text(json.dumps({"nodes": [], "edges": []}))

        # Kinematic features CSV
        (root / "kinematic_features.csv").write_text(
            "gesture_id,video_id,feature_a,feature_b\n"
            "g1,TestVideo001,0.5,0.3\n"
            "g2,TestVideo002,0.8,0.1\n"
        )

        # Word cloud (tiny 1x1 PNG)
        png_header = (
            b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01"
            b"\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00"
            b"\x00\x00\x0cIDATx\x9cc\xf8\x0f\x00\x00\x01\x01\x00"
            b"\x05\x18\xd8N\x00\x00\x00\x00IEND\xaeB`\x82"
        )
        (root / "word_cloud.png").write_bytes(png_header)

        # Gesture visualization CSV (for DTW)
        (root / "gesture_visualization.csv").write_text(
            "gesture_id,x,y\ng1,1.0,2.0\ng2,3.0,4.0\n"
        )

        # --- Per-video folders ---
        for video in metadata:
            name = video["video_name"]
            vdir = root / name
            vdir.mkdir()
            (vdir / "thumbnails").mkdir()
            (vdir / "processed").mkdir()
            (vdir / "gesture_segments").mkdir()

            # Audio / transcript / waveform / peaks
            (vdir / f"{name}_audio.wav").write_bytes(b"RIFF" + b"\x00" * 40)
            (vdir / f"{name}_transcript.srt").write_text(
                "1\n00:00:00,000 --> 00:00:05,000\nHello world\n"
            )
            (vdir / f"{name}_waveform.json").write_text(json.dumps({"data": [0.1, 0.2]}))
            (vdir / f"{name}_peaks.json").write_text(json.dumps({"peaks": [0.5]}))
            (vdir / f"{name}_audio_features.json").write_text(json.dumps({
                "tempo": 120,
                "time": [0.0, 0.5, 1.0],
                "pitch": [220.0, 0.0, 245.5],
                "volume": [-20.5, -18.3, -22.1],
                "sample_rate": 44100,
                "duration": 1.5,
            }))
            (vdir / f"{name}_prosody.json").write_text(json.dumps({
                "time": [0.0, 0.02],
                "contours": {"F0semitoneFrom27.5Hz_sma3nz": [25.0, 26.5]},
                "functionals": {"F0semitoneFrom27.5Hz_sma3nz_amean": 25.75},
            }))
            (vdir / f"{name}_pauses_fillers.json").write_text(json.dumps({
                "pauses": [{"start": 5.2, "end": 6.0, "duration": 0.8}],
                "fillers": [{"word": "um", "start": 3.0, "end": 3.3}],
                "speech_rates": [{"start": 0.0, "end": 5.0, "wpm": 145.2}],
                "audio_silences": [],
                "summary": {
                    "total_pauses": 1,
                    "total_fillers": 1,
                    "avg_pause_duration": 0.8,
                    "max_pause_duration": 0.8,
                    "filler_rate_per_minute": 4.0,
                    "avg_speech_rate_wpm": 145.2,
                    "total_words": 12,
                    "total_duration_s": 10.0,
                    "filler_word_counts": {"um": 1},
                },
            }))
            (vdir / f"{name}_facial_expressions.json").write_text(json.dumps({
                "frames": [0, 12],
                "emotions": {"happiness": [0.65, 0.70], "anger": [0.01, 0.02]},
                "action_units": {"AU06": [0.45, 0.50], "AU12": [0.55, 0.60]},
                "summary": {
                    "faces_detected": 2,
                    "total_frames_analysed": 24,
                    "dominant_emotion": "happiness",
                    "emotion_means": {"happiness": 0.675, "anger": 0.015},
                    "au_means": {"AU06": 0.475, "AU12": 0.575},
                },
            }))
            (vdir / f"{name}_visual_embeddings.json").write_text(json.dumps({
                "n_frames": 20,
                "embedding_dim": 384,
                "mean_embedding": [0.01] * 384,
                "visual_variability": 0.034,
            }))
            (vdir / f"{name}_spectrogram.png").write_bytes(png_header)
            (vdir / f"{name}_kinematic_features.csv").write_text(
                "gesture_id,video_id,feature_a\ng1,v1,0.5\n"
            )

            # Thumbnail (1x1 JPEG-like)
            (vdir / "thumbnails" / f"{name}_Original_thumbnail.jpg").write_bytes(
                b"\xff\xd8\xff\xe0" + b"\x00" * 20
            )

            # Video files (minimal mp4 stub)
            (vdir / f"{name}_Original.mp4").write_bytes(b"\x00" * 100)
            (vdir / "processed" / f"{name}_YoloPose.mp4").write_bytes(b"\x00" * 100)

        # --- SpaCy analysis ---
        spacey_dir = root / "spacey_analysis"
        spacey_dir.mkdir()
        (spacey_dir / "TestVideo001.json").write_text(
            json.dumps([{"id": 0, "tokens": [{"text": "Hello", "label": None, "trailing_space": " "}]}])
        )

        yield str(root)


@pytest.fixture()
def client(materials_dir, monkeypatch):
    """Create a FastAPI test client with MATERIALS_FOLDER pointed at mock data."""
    monkeypatch.setenv("MATERIALS_FOLDER", materials_dir)
    monkeypatch.setenv("ENVISIONHGDETECTOR_OUTPUT", materials_dir)

    # Reload config so it picks up the monkeypatched env var
    import config
    monkeypatch.setattr(config, "MATERIALS_FOLDER", materials_dir)
    monkeypatch.setattr(config, "ENVISIONHGDETECTOR_OUTPUT", materials_dir)

    from main import app
    with TestClient(app) as c:
        yield c
