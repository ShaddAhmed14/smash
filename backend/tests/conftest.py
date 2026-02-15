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
            (vdir / f"{name}_audio_features.json").write_text(json.dumps({"tempo": 120}))
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
