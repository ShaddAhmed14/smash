"""Local integration test — spins up the backend against a realistic
materials folder and tests all endpoints end-to-end.

No Docker, no GPU, no real videos. Creates synthetic analysis outputs
that mirror what prepare_materials.py actually produces, then ingests
them into a real SQLite DB and hits every API endpoint.

Usage:
    python -m pytest backend/tests/test_local_integration.py -v
"""

import json
import tempfile
from pathlib import Path

import numpy as np
import pytest
from fastapi.testclient import TestClient


@pytest.fixture(scope="module")
def integration_env():
    """Create a full materials folder, ingest into DB, and yield test client."""
    with tempfile.TemporaryDirectory(ignore_cleanup_errors=True) as tmpdir:
        root = Path(tmpdir)

        # --- Two synthetic videos ---
        videos = {
            "AliceSmith_en": {
                "speaker": "Alice Smith", "language": "en",
                "duration": 180.5, "year": 2024,
            },
            "BobJones_de": {
                "speaker": "Bob Jones", "language": "de",
                "duration": 240.0, "year": 2023,
            },
        }

        for name, meta in videos.items():
            vdir = root / name
            vdir.mkdir()

            # Audio features (librosa output)
            t = np.linspace(0, meta["duration"], 500).tolist()
            (vdir / f"{name}_audio_features.json").write_text(json.dumps({
                "time": t,
                "pitch": (np.random.uniform(100, 300, 500) * np.random.choice([0, 1], 500, p=[0.1, 0.9])).tolist(),
                "volume": np.random.uniform(-30, -10, 500).tolist(),
                "tempo": np.random.uniform(100, 140, 500).tolist(),
                "sample_rate": 44100,
                "duration": meta["duration"],
            }))

            # Prosody (openSMILE eGeMAPS)
            n_frames = 800
            (vdir / f"{name}_prosody.json").write_text(json.dumps({
                "time": np.linspace(0, meta["duration"], n_frames).tolist(),
                "contours": {
                    "F0semitoneFrom27.5Hz_sma3nz": np.random.uniform(20, 35, n_frames).tolist(),
                    "jitterLocal_sma3nz": np.random.uniform(0.005, 0.03, n_frames).tolist(),
                    "shimmerLocaldB_sma3nz": np.random.uniform(0.3, 0.8, n_frames).tolist(),
                    "HNRdBACF_sma3nz": np.random.uniform(8, 18, n_frames).tolist(),
                    "loudness_sma3nz": np.random.uniform(0.5, 1.2, n_frames).tolist(),
                    "alphaRatioV_sma3nz": np.random.uniform(-8, -2, n_frames).tolist(),
                    "hammarbergIndexV_sma3nz": np.random.uniform(15, 28, n_frames).tolist(),
                    "spectralFlux_sma3nz": np.random.uniform(0.02, 0.1, n_frames).tolist(),
                },
                "functionals": {
                    "F0semitoneFrom27.5Hz_sma3nz_amean": 27.5,
                    "loudness_sma3nz_amean": 0.85,
                    "jitterLocal_sma3nz_amean": 0.015,
                    "shimmerLocaldB_sma3nz_amean": 0.55,
                    "HNRdBACF_sma3nz_amean": 13.0,
                },
            }))

            # Pauses and fillers
            n_pauses = np.random.randint(3, 8)
            n_fillers = np.random.randint(2, 10)
            (vdir / f"{name}_pauses_fillers.json").write_text(json.dumps({
                "pauses": [
                    {"start": float(i * 20 + 5), "end": float(i * 20 + 5.8), "duration": 0.8, "after_text": "and"}
                    for i in range(n_pauses)
                ],
                "fillers": [
                    {"word": np.random.choice(["um", "uh", "like"]), "start": float(i * 15 + 3), "end": float(i * 15 + 3.3), "context": "I um think"}
                    for i in range(n_fillers)
                ],
                "speech_rates": [
                    {"start": float(i * 30), "end": float(i * 30 + 30), "wpm": float(np.random.uniform(120, 170)), "word_count": np.random.randint(40, 80)}
                    for i in range(int(meta["duration"] / 30))
                ],
                "audio_silences": [
                    {"start": 10.0, "end": 11.2, "duration": 1.2}
                ],
                "summary": {
                    "total_pauses": n_pauses,
                    "total_fillers": n_fillers,
                    "avg_pause_duration": 0.75,
                    "max_pause_duration": 1.2,
                    "filler_rate_per_minute": round(n_fillers / (meta["duration"] / 60), 1),
                    "avg_speech_rate_wpm": round(float(np.random.uniform(130, 160)), 1),
                    "total_words": int(np.random.randint(200, 500)),
                    "total_duration_s": meta["duration"],
                    "filler_word_counts": {"um": n_fillers // 2, "uh": n_fillers - n_fillers // 2},
                },
            }))

            # Facial expressions (py-feat)
            n_face_frames = 50
            emotions = {e: np.random.uniform(0, 0.3, n_face_frames).tolist() for e in ["anger", "disgust", "fear", "sadness", "surprise", "neutral"]}
            emotions["happiness"] = np.random.uniform(0.4, 0.8, n_face_frames).tolist()
            (vdir / f"{name}_facial_expressions.json").write_text(json.dumps({
                "frames": list(range(0, n_face_frames * 12, 12)),
                "emotions": emotions,
                "action_units": {
                    f"AU{au:02d}": np.random.uniform(0, 0.6, n_face_frames).tolist()
                    for au in [1, 2, 4, 5, 6, 7, 9, 10, 12, 14, 15, 17, 20, 23, 25, 26]
                },
                "summary": {
                    "faces_detected": n_face_frames,
                    "total_frames_analysed": n_face_frames * 12,
                    "dominant_emotion": "happiness",
                    "emotion_means": {
                        "anger": 0.05, "disgust": 0.02, "fear": 0.03,
                        "happiness": 0.62, "sadness": 0.04, "surprise": 0.08, "neutral": 0.16,
                    },
                    "au_means": {"AU04": 0.12, "AU06": 0.48, "AU12": 0.55},
                },
            }))

            # Visual embeddings (DINOv2)
            emb = np.random.randn(384).astype(np.float32)
            (vdir / f"{name}_visual_embeddings.json").write_text(json.dumps({
                "n_frames": 20,
                "embedding_dim": 384,
                "mean_embedding": emb.tolist(),
                "visual_variability": round(float(np.random.uniform(0.02, 0.06)), 4),
                "frame_distances_from_mean": np.abs(np.random.randn(20) * 0.05).tolist(),
            }))

            # SRT transcript
            segments = []
            for i in range(10):
                start = i * (meta["duration"] / 10)
                end = start + (meta["duration"] / 10) - 0.5
                segments.append(
                    f"{i+1}\n"
                    f"{_format_srt_time(start)} --> {_format_srt_time(end)}\n"
                    f"This is segment {i+1} of the talk about {'AI' if name.startswith('Alice') else 'climate'}.\n"
                )
            (vdir / f"{name}_Original.srt").write_text("\n".join(segments))

        # --- Corpus-level files ---
        titles = list(videos.keys())
        (root / "topic_interdistance.json").write_text(json.dumps([
            {"Topic": 0, "Name": "technology_ai_data", "Count": 5, "Top Words": "ai, data, model, learning"},
            {"Topic": 1, "Name": "climate_energy_policy", "Count": 3, "Top Words": "climate, energy, carbon, policy"},
        ]))
        (root / "video_distribution.json").write_text(json.dumps([
            {"title": "AliceSmith_en", "x": 0.5, "y": 0.3, "topics": [0]},
            {"title": "BobJones_de", "x": -0.2, "y": 0.8, "topics": [1]},
        ]))
        (root / "temporal_sentiment_data.json").write_text(json.dumps([
            {"title": "AliceSmith_en", "temporal_sentiment": [0.5, 0.3, 0.7, 0.4, 0.6]},
            {"title": "BobJones_de", "temporal_sentiment": [-0.2, 0.1, -0.1, 0.0, 0.2]},
        ]))

        # --- Ingest into SQLite DB ---
        from database.schema import create_tables
        from database.ingest import ingest_corpus

        db_path = str(root / "smash.db")
        engine = create_tables(db_path)
        ingest_corpus(str(root), engine)

        # --- Create test client ---
        # Patch MATERIALS_FOLDER in config and in all route modules that
        # captured it at import time via `from config import MATERIALS_FOLDER`.
        import config
        from routes import analysis, analytics, preview

        materials_str = str(root)
        originals = {
            "config": config.MATERIALS_FOLDER,
            "analysis": getattr(analysis, "MATERIALS_FOLDER", None),
            "analytics": getattr(analytics, "MATERIALS_FOLDER", None),
            "preview": getattr(preview, "MATERIALS_FOLDER", None),
        }
        config.MATERIALS_FOLDER = materials_str
        analysis.MATERIALS_FOLDER = materials_str
        analytics.MATERIALS_FOLDER = materials_str
        preview.MATERIALS_FOLDER = materials_str

        from main import app
        with TestClient(app) as client:
            yield client, materials_str

        # Restore originals
        config.MATERIALS_FOLDER = originals["config"]
        if originals["analysis"] is not None:
            analysis.MATERIALS_FOLDER = originals["analysis"]
        if originals["analytics"] is not None:
            analytics.MATERIALS_FOLDER = originals["analytics"]
        if originals["preview"] is not None:
            preview.MATERIALS_FOLDER = originals["preview"]
        # Dispose engine to release SQLite file lock (Windows PermissionError fix)
        engine.dispose()


def _format_srt_time(seconds: float) -> str:
    """Convert seconds to SRT timestamp format."""
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = int(seconds % 60)
    ms = int((seconds % 1) * 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


# ---------------------------------------------------------------------------
# Analysis endpoint tests
# ---------------------------------------------------------------------------

class TestAnalysisEndpoints:
    def test_prosody(self, integration_env):
        client, _ = integration_env
        resp = client.get("/analysis/fetch_prosody?video_name=AliceSmith_en")
        assert resp.status_code == 200
        data = resp.json()
        assert "contours" in data
        assert len(data["contours"]["F0semitoneFrom27.5Hz_sma3nz"]) == 800

    def test_pauses_fillers(self, integration_env):
        client, _ = integration_env
        resp = client.get("/analysis/fetch_pauses_fillers?video_name=AliceSmith_en")
        assert resp.status_code == 200
        data = resp.json()
        assert data["summary"]["total_pauses"] >= 3
        assert "filler_word_counts" in data["summary"]

    def test_facial_expressions(self, integration_env):
        client, _ = integration_env
        resp = client.get("/analysis/fetch_facial_expressions?video_name=BobJones_de")
        assert resp.status_code == 200
        data = resp.json()
        assert data["summary"]["dominant_emotion"] == "happiness"
        assert len(data["action_units"]) == 16

    def test_visual_embeddings(self, integration_env):
        client, _ = integration_env
        resp = client.get("/analysis/fetch_visual_embeddings?video_name=AliceSmith_en")
        assert resp.status_code == 200
        data = resp.json()
        assert data["embedding_dim"] == 384
        assert len(data["mean_embedding"]) == 384


# ---------------------------------------------------------------------------
# Export endpoint tests (DB-backed)
# ---------------------------------------------------------------------------

class TestExportVideoReport:
    def test_json_report(self, integration_env):
        client, _ = integration_env
        resp = client.get("/export/video_report?video_name=AliceSmith_en&format=json")
        assert resp.status_code == 200
        report = resp.json()
        assert report["video_name"] == "AliceSmith_en"
        assert "prosody" in report
        assert "pauses_fillers" in report
        assert "facial_expressions" in report
        assert "transcript" in report
        assert report["transcript"]["segment_count"] == 10
        assert report["facial_expressions"]["dominant_emotion"] == "happiness"

    def test_csv_report(self, integration_env):
        client, _ = integration_env
        resp = client.get("/export/video_report?video_name=AliceSmith_en&format=csv")
        assert resp.status_code == 200
        assert "text/csv" in resp.headers["content-type"]

    def test_report_not_found(self, integration_env):
        client, _ = integration_env
        resp = client.get("/export/video_report?video_name=NonExistent")
        assert resp.status_code == 404


class TestExportCorpusDescriptives:
    def test_csv_all(self, integration_env):
        client, _ = integration_env
        resp = client.get("/export/corpus_descriptives?format=csv")
        assert resp.status_code == 200
        lines = resp.text.strip().split("\n")
        assert len(lines) == 3  # header + 2 videos
        assert "AliceSmith_en" in lines[1]
        # Check key columns present
        header = lines[0]
        for col in ["f0_mean", "avg_speech_rate_wpm", "happiness_mean", "gesture_count"]:
            assert col in header

    def test_filter_by_language(self, integration_env):
        client, _ = integration_env
        resp = client.get("/export/corpus_descriptives?format=json&language=en")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 1
        assert data[0]["video_name"] == "AliceSmith_en"

    def test_filter_excludes(self, integration_env):
        client, _ = integration_env
        resp = client.get("/export/corpus_descriptives?format=json&language=fr")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 0


class TestExportTimeAligned:
    def test_audio_prosody(self, integration_env):
        client, _ = integration_env
        resp = client.get("/export/time_aligned?video_name=AliceSmith_en&modalities=audio,prosody")
        assert resp.status_code == 200
        assert "text/csv" in resp.headers["content-type"]
        lines = resp.text.strip().split("\n")
        header = lines[0]
        assert "time_s" in header
        assert "modality" in header
        assert "feature" in header
        assert "value" in header
        # Should have lots of rows (500 audio frames * 3 features + 800 prosody frames * 8 features)
        assert len(lines) > 100

    def test_facial_transcript(self, integration_env):
        client, _ = integration_env
        resp = client.get("/export/time_aligned?video_name=BobJones_de&modalities=facial,transcript")
        assert resp.status_code == 200
        text = resp.text
        assert "facial" in text
        assert "transcript" in text

    def test_not_found(self, integration_env):
        client, _ = integration_env
        resp = client.get("/export/time_aligned?video_name=NonExistent")
        assert resp.status_code == 404


class TestExportEmbeddings:
    def test_json_embeddings(self, integration_env):
        client, _ = integration_env
        resp = client.get("/export/embeddings?format=json")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data["names"]) == 2
        assert len(data["embeddings"][0]) == 384
        assert len(data["variability"]) == 2

    def test_npy_embeddings(self, integration_env):
        client, _ = integration_env
        resp = client.get("/export/embeddings?format=npy")
        assert resp.status_code == 200
        assert "octet-stream" in resp.headers["content-type"]
        # Verify it's a valid numpy file
        import io
        arr = np.load(io.BytesIO(resp.content))
        assert arr.shape == (2, 384)
        assert arr.dtype == np.float32


class TestExportProvenance:
    def test_provenance(self, integration_env):
        client, _ = integration_env
        resp = client.get("/export/provenance")
        assert resp.status_code == 200
        data = resp.json()
        assert data["video_count"] == 2
        assert "corpus_metadata" in data
        assert data["corpus_metadata"]["schema_version"] == "1.0.0"
        assert len(data["processing_log"]) > 0
        # Check provenance has the right tools
        tools = {r["tool"] for r in data["processing_log"]}
        assert "opensmile" in tools
        assert "py-feat" in tools
        assert "librosa" in tools


class TestExportFilteredSubset:
    def test_filter_by_speech_rate(self, integration_env):
        client, _ = integration_env
        # Both videos should have speech rate > 100
        resp = client.get("/export/filtered_subset?min_speech_rate=100&format=json")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 2

    def test_filter_by_happiness(self, integration_env):
        client, _ = integration_env
        # Both videos have happiness ~0.62
        resp = client.get("/export/filtered_subset?min_happiness=0.5&format=json")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 2

    def test_filter_combined(self, integration_env):
        client, _ = integration_env
        resp = client.get("/export/filtered_subset?language=en&min_happiness=0.5&format=csv")
        assert resp.status_code == 200
        lines = resp.text.strip().split("\n")
        assert len(lines) == 2  # header + 1 English video

    def test_filter_no_match(self, integration_env):
        client, _ = integration_env
        resp = client.get("/export/filtered_subset?min_speech_rate=999&format=json")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 0


# ---------------------------------------------------------------------------
# DB integrity checks
# ---------------------------------------------------------------------------

class TestDatabaseIntegrity:
    def test_db_exists(self, integration_env):
        _, materials = integration_env
        db_path = Path(materials) / "smash.db"
        assert db_path.is_file()
        assert db_path.stat().st_size > 0

    def test_provenance_complete(self, integration_env):
        """Every ingested module should have a processing log entry."""
        client, _ = integration_env
        resp = client.get("/export/provenance")
        data = resp.json()
        logs = data["processing_log"]

        # Group by video
        from collections import Counter
        per_video = Counter(r["video"] for r in logs)
        # Each video should have 7 modules ingested (6 per-video + sentiment from corpus-level)
        for video, count in per_video.items():
            assert count == 7, f"{video} has {count} processing logs, expected 7"

    def test_sentiment_ingested(self, integration_env):
        """Temporal sentiment from corpus-level file should be in DB."""
        client, _ = integration_env
        resp = client.get("/export/video_report?video_name=AliceSmith_en")
        report = resp.json()
        assert "sentiment" in report
        assert report["sentiment"]["avg_compound"] is not None

    def test_topics_ingested(self, integration_env):
        client, _ = integration_env
        resp = client.get("/export/video_report?video_name=AliceSmith_en")
        report = resp.json()
        assert "topics" in report
        assert len(report["topics"]) >= 1
