"""Tests for database ingestion pipeline.

Uses synthetic JSON files on disk — no GPU, Docker, or real videos needed.
Creates a temporary directory tree mimicking the materials folder structure,
writes synthetic analysis JSON files, and verifies ingestion into SQLite.
"""

import json
import tempfile
from pathlib import Path

import numpy as np
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from database.schema import (
    AudioFeatures,
    Base,
    FacialExpressions,
    PausesFillers,
    ProcessingLog,
    Prosody,
    Sentiment,
    Topic,
    TopicAssignment,
    TranscriptSegment,
    Video,
    VisualEmbedding,
)
from database.ingest import (
    ingest_audio_features,
    ingest_corpus,
    ingest_facial_expressions,
    ingest_pauses_fillers,
    ingest_prosody,
    ingest_transcript,
    ingest_video_folder,
    ingest_visual_embedding,
    _get_or_create_video,
)


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture
def db_session():
    """In-memory SQLite session."""
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()


@pytest.fixture
def db_engine():
    """In-memory SQLite engine for corpus-level tests."""
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    return engine


@pytest.fixture
def sample_video_dir(tmp_path):
    """Create a temporary video folder with synthetic analysis JSON files."""
    video_name = "TestSpeaker_en"
    folder = tmp_path / video_name
    folder.mkdir()

    # Audio features
    (folder / f"{video_name}_audio_features.json").write_text(json.dumps({
        "time": [0.0, 0.5, 1.0, 1.5, 2.0],
        "pitch": [220.0, 0.0, 245.5, 230.1, 0.0],
        "volume": [-20.5, -18.3, -22.1, -19.8, -21.0],
        "tempo": [120.0, 118.5, 122.0, 119.0, 121.5],
        "sample_rate": 44100,
        "duration": 2.5,
    }))

    # Prosody
    (folder / f"{video_name}_prosody.json").write_text(json.dumps({
        "time": [0.0, 0.02, 0.04, 0.06],
        "contours": {
            "F0semitoneFrom27.5Hz_sma3nz": [25.0, 26.5, 24.8, 27.1],
            "jitterLocal_sma3nz": [0.01, 0.02, 0.015, 0.018],
            "shimmerLocaldB_sma3nz": [0.5, 0.6, 0.55, 0.58],
            "HNRdBACF_sma3nz": [12.0, 13.5, 11.8, 14.2],
            "loudness_sma3nz": [0.8, 0.9, 0.75, 0.85],
            "alphaRatioV_sma3nz": [-5.0, -4.5, -5.2, -4.8],
            "hammarbergIndexV_sma3nz": [20.0, 21.5, 19.8, 22.0],
            "spectralFlux_sma3nz": [0.05, 0.06, 0.04, 0.07],
        },
        "functionals": {
            "F0semitoneFrom27.5Hz_sma3nz_amean": 25.85,
            "loudness_sma3nz_amean": 0.825,
        },
    }))

    # Pauses and fillers
    (folder / f"{video_name}_pauses_fillers.json").write_text(json.dumps({
        "pauses": [
            {"start": 5.2, "end": 6.0, "duration": 0.8, "after_text": "and then"},
            {"start": 12.1, "end": 12.8, "duration": 0.7, "after_text": "so"},
        ],
        "fillers": [
            {"word": "um", "start": 3.0, "end": 3.3, "context": "I um think"},
            {"word": "like", "start": 8.5, "end": 8.7, "context": "it's like great"},
        ],
        "speech_rates": [
            {"start": 0.0, "end": 5.0, "wpm": 145.2, "word_count": 12},
            {"start": 6.0, "end": 12.0, "wpm": 130.5, "word_count": 13},
        ],
        "audio_silences": [
            {"start": 5.0, "end": 6.2, "duration": 1.2},
        ],
        "summary": {
            "total_pauses": 2,
            "total_fillers": 2,
            "avg_pause_duration": 0.75,
            "max_pause_duration": 0.8,
            "filler_rate_per_minute": 4.8,
            "avg_speech_rate_wpm": 137.85,
            "total_words": 25,
            "total_duration_s": 15.0,
            "filler_word_counts": {"um": 1, "like": 1},
        },
    }))

    # Facial expressions
    (folder / f"{video_name}_facial_expressions.json").write_text(json.dumps({
        "frames": [0, 12, 24, 36],
        "emotions": {
            "anger": [0.01, 0.02, 0.01, 0.03],
            "disgust": [0.005, 0.01, 0.008, 0.012],
            "fear": [0.02, 0.015, 0.025, 0.018],
            "happiness": [0.65, 0.70, 0.68, 0.72],
            "sadness": [0.05, 0.04, 0.06, 0.03],
            "surprise": [0.08, 0.07, 0.09, 0.06],
            "neutral": [0.185, 0.145, 0.127, 0.14],
        },
        "action_units": {
            "AU01": [0.1, 0.15, 0.12, 0.08],
            "AU04": [0.05, 0.03, 0.04, 0.06],
            "AU06": [0.45, 0.50, 0.48, 0.52],
            "AU12": [0.55, 0.60, 0.58, 0.62],
        },
        "summary": {
            "faces_detected": 4,
            "total_frames_analysed": 48,
            "dominant_emotion": "happiness",
            "emotion_means": {
                "anger": 0.0175,
                "disgust": 0.00875,
                "fear": 0.0195,
                "happiness": 0.6875,
                "sadness": 0.045,
                "surprise": 0.075,
                "neutral": 0.14925,
            },
            "au_means": {
                "AU01": 0.1125,
                "AU04": 0.045,
                "AU06": 0.4875,
                "AU12": 0.5875,
            },
        },
    }))

    # Visual embeddings
    embedding = np.random.randn(384).astype(np.float32).tolist()
    (folder / f"{video_name}_visual_embeddings.json").write_text(json.dumps({
        "n_frames": 20,
        "embedding_dim": 384,
        "mean_embedding": embedding,
        "visual_variability": 0.0342,
        "frame_distances_from_mean": [round(abs(np.random.randn() * 0.05), 6) for _ in range(20)],
    }))

    # SRT transcript
    (folder / f"{video_name}_Original.srt").write_text(
        "1\n00:00:01,000 --> 00:00:03,500\nHello everyone, welcome to my talk.\n\n"
        "2\n00:00:04,000 --> 00:00:07,200\nToday I want to discuss communication.\n\n"
        "3\n00:00:08,000 --> 00:00:11,500\nLet's start with the basics.\n"
    )

    return tmp_path, video_name


# ---------------------------------------------------------------------------
# Unit tests: per-module ingestion
# ---------------------------------------------------------------------------

class TestAudioFeaturesIngestion:
    def test_ingest_audio(self, db_session, sample_video_dir):
        materials, video_name = sample_video_dir
        video = _get_or_create_video(db_session, video_name)
        folder = materials / video_name

        assert ingest_audio_features(db_session, video, folder) is True
        db_session.flush()

        record = db_session.query(AudioFeatures).filter_by(video_id=video.id).one()
        assert len(record.time) == 5
        assert len(record.pitch) == 5
        # avg_pitch should exclude zeros
        assert abs(record.avg_pitch - np.mean([220.0, 245.5, 230.1])) < 0.01
        assert record.avg_volume is not None
        assert record.avg_tempo is not None
        # Video metadata updated
        assert video.sample_rate == 44100
        assert video.duration_s == 2.5

    def test_missing_file_returns_false(self, db_session, tmp_path):
        video = _get_or_create_video(db_session, "nonexistent")
        assert ingest_audio_features(db_session, video, tmp_path) is False


class TestProsodyIngestion:
    def test_ingest_prosody(self, db_session, sample_video_dir):
        materials, video_name = sample_video_dir
        video = _get_or_create_video(db_session, video_name)
        folder = materials / video_name

        assert ingest_prosody(db_session, video, folder) is True
        db_session.flush()

        record = db_session.query(Prosody).filter_by(video_id=video.id).one()
        assert record.f0_mean == pytest.approx(25.85, abs=0.01)
        assert record.f0_stddev is not None
        assert record.jitter_mean is not None
        assert record.shimmer_mean is not None
        assert record.hnr_mean is not None
        assert record.loudness_mean is not None
        assert record.functionals is not None
        assert "F0semitoneFrom27.5Hz_sma3nz_amean" in record.functionals


class TestPausesFillersIngestion:
    def test_ingest_pauses_fillers(self, db_session, sample_video_dir):
        materials, video_name = sample_video_dir
        video = _get_or_create_video(db_session, video_name)
        folder = materials / video_name

        assert ingest_pauses_fillers(db_session, video, folder) is True
        db_session.flush()

        record = db_session.query(PausesFillers).filter_by(video_id=video.id).one()
        assert record.total_pauses == 2
        assert record.total_fillers == 2
        assert record.avg_pause_duration == 0.75
        assert record.max_pause_duration == 0.8
        assert record.filler_rate_per_min == 4.8
        assert record.avg_speech_rate_wpm == 137.85
        assert record.filler_word_counts == {"um": 1, "like": 1}
        assert len(record.pauses) == 2
        assert len(record.fillers) == 2


class TestFacialExpressionsIngestion:
    def test_ingest_facial(self, db_session, sample_video_dir):
        materials, video_name = sample_video_dir
        video = _get_or_create_video(db_session, video_name)
        folder = materials / video_name

        assert ingest_facial_expressions(db_session, video, folder) is True
        db_session.flush()

        record = db_session.query(FacialExpressions).filter_by(video_id=video.id).one()
        assert record.dominant_emotion == "happiness"
        assert record.happiness_mean == pytest.approx(0.6875, abs=0.001)
        assert record.faces_detected == 4
        assert record.total_frames_analysed == 48
        assert record.au06_mean == pytest.approx(0.4875, abs=0.001)
        assert record.au12_mean == pytest.approx(0.5875, abs=0.001)


class TestVisualEmbeddingIngestion:
    def test_ingest_embedding(self, db_session, sample_video_dir):
        materials, video_name = sample_video_dir
        video = _get_or_create_video(db_session, video_name)
        folder = materials / video_name

        assert ingest_visual_embedding(db_session, video, folder) is True
        db_session.flush()

        record = db_session.query(VisualEmbedding).filter_by(video_id=video.id).one()
        assert record.embedding_dim == 384
        assert record.n_frames == 20
        assert record.visual_variability == pytest.approx(0.0342, abs=0.001)
        # Verify binary embedding can be decoded
        emb = np.frombuffer(record.mean_embedding, dtype=np.float32)
        assert emb.shape == (384,)


class TestTranscriptIngestion:
    def test_ingest_srt(self, db_session, sample_video_dir):
        materials, video_name = sample_video_dir
        video = _get_or_create_video(db_session, video_name)
        folder = materials / video_name

        assert ingest_transcript(db_session, video, folder) is True
        db_session.flush()

        segments = (
            db_session.query(TranscriptSegment)
            .filter_by(video_id=video.id)
            .order_by(TranscriptSegment.segment_index)
            .all()
        )
        assert len(segments) == 3
        assert segments[0].start_s == pytest.approx(1.0, abs=0.01)
        assert segments[0].end_s == pytest.approx(3.5, abs=0.01)
        assert "Hello everyone" in segments[0].text
        assert segments[2].text == "Let's start with the basics."

    def test_idempotent_reingest(self, db_session, sample_video_dir):
        """Re-ingesting transcript replaces segments, doesn't duplicate."""
        materials, video_name = sample_video_dir
        video = _get_or_create_video(db_session, video_name)
        folder = materials / video_name

        ingest_transcript(db_session, video, folder)
        db_session.flush()
        ingest_transcript(db_session, video, folder)
        db_session.flush()

        count = db_session.query(TranscriptSegment).filter_by(video_id=video.id).count()
        assert count == 3  # not 6


# ---------------------------------------------------------------------------
# Integration tests: full video folder + corpus ingestion
# ---------------------------------------------------------------------------

class TestVideoFolderIngestion:
    def test_ingest_full_folder(self, db_session, sample_video_dir):
        materials, video_name = sample_video_dir
        folder = materials / video_name

        video = ingest_video_folder(db_session, folder)
        db_session.flush()

        assert video is not None
        assert video.name == video_name
        assert video.processing_status == "complete"

        # All modules should be populated
        assert db_session.query(AudioFeatures).filter_by(video_id=video.id).count() == 1
        assert db_session.query(Prosody).filter_by(video_id=video.id).count() == 1
        assert db_session.query(PausesFillers).filter_by(video_id=video.id).count() == 1
        assert db_session.query(FacialExpressions).filter_by(video_id=video.id).count() == 1
        assert db_session.query(VisualEmbedding).filter_by(video_id=video.id).count() == 1
        assert db_session.query(TranscriptSegment).filter_by(video_id=video.id).count() == 3

        # Processing log should have entries
        logs = db_session.query(ProcessingLog).filter_by(video_id=video.id).all()
        assert len(logs) == 6  # one per module
        modules = {log.module for log in logs}
        assert modules == {
            "audio_features", "prosody", "pauses_fillers",
            "facial_expressions", "visual_embedding", "transcript",
        }

    def test_idempotent_folder_reingest(self, db_session, sample_video_dir):
        """Re-ingesting a folder updates records, doesn't duplicate."""
        materials, video_name = sample_video_dir
        folder = materials / video_name

        ingest_video_folder(db_session, folder)
        db_session.flush()
        ingest_video_folder(db_session, folder)
        db_session.flush()

        assert db_session.query(Video).count() == 1
        assert db_session.query(AudioFeatures).count() == 1
        assert db_session.query(Prosody).count() == 1


class TestCorpusIngestion:
    def test_ingest_corpus_multi_video(self, db_engine, tmp_path):
        """Test full corpus ingestion with multiple video folders."""
        # Create two video folders with minimal data
        for name in ["Speaker_A", "Speaker_B"]:
            folder = tmp_path / name
            folder.mkdir()
            (folder / f"{name}_audio_features.json").write_text(json.dumps({
                "time": [0.0, 1.0],
                "pitch": [200.0, 210.0],
                "volume": [-20.0, -19.0],
                "tempo": [120.0, 121.0],
                "sample_rate": 44100,
                "duration": 2.0,
            }))
            (folder / f"{name}_prosody.json").write_text(json.dumps({
                "time": [0.0, 0.02],
                "contours": {
                    "F0semitoneFrom27.5Hz_sma3nz": [25.0, 26.0],
                    "jitterLocal_sma3nz": [0.01, 0.02],
                    "shimmerLocaldB_sma3nz": [0.5, 0.6],
                    "HNRdBACF_sma3nz": [12.0, 13.0],
                    "loudness_sma3nz": [0.8, 0.9],
                    "alphaRatioV_sma3nz": [-5.0, -4.5],
                    "hammarbergIndexV_sma3nz": [20.0, 21.0],
                    "spectralFlux_sma3nz": [0.05, 0.06],
                },
                "functionals": {},
            }))

        # Add corpus-level files
        (tmp_path / "topic_interdistance.json").write_text(json.dumps([
            {"Topic": 0, "Name": "technology", "Count": 5, "Top Words": "ai, ml, data"},
            {"Topic": 1, "Name": "science", "Count": 3, "Top Words": "research, method, study"},
        ]))
        (tmp_path / "video_distribution.json").write_text(json.dumps([
            {"title": "Speaker_A", "x": 0.5, "y": 0.3, "topics": [0]},
            {"title": "Speaker_B", "x": -0.2, "y": 0.8, "topics": [1]},
        ]))
        (tmp_path / "temporal_sentiment_data.json").write_text(json.dumps([
            {"title": "Speaker_A", "temporal_sentiment": [0.5, 0.3, 0.7, 0.4]},
            {"title": "Speaker_B", "temporal_sentiment": [-0.2, 0.1, -0.1, 0.0]},
        ]))

        # Run corpus ingestion
        ingest_corpus(str(tmp_path), db_engine)

        # Verify
        Session = sessionmaker(bind=db_engine)
        session = Session()

        assert session.query(Video).count() == 2
        assert session.query(AudioFeatures).count() == 2
        assert session.query(Prosody).count() == 2
        assert session.query(Topic).count() == 2
        assert session.query(TopicAssignment).count() == 2

        # Topic keywords parsed correctly
        tech_topic = session.query(Topic).filter_by(topic_id=0).one()
        assert tech_topic.label == "technology"
        assert "ai" in tech_topic.keywords

        # Sentiment ingested
        assert session.query(Sentiment).count() == 2
        speaker_a = session.query(Video).filter_by(name="Speaker_A").one()
        sentiment = session.query(Sentiment).filter_by(video_id=speaker_a.id).one()
        assert sentiment.avg_compound == pytest.approx(0.475, abs=0.01)

        # Processing status
        for v in session.query(Video).all():
            assert v.processing_status == "complete"

        session.close()


class TestProvenanceLogging:
    def test_processing_log_populated(self, db_session, sample_video_dir):
        materials, video_name = sample_video_dir
        folder = materials / video_name

        video = ingest_video_folder(db_session, folder)
        db_session.flush()

        logs = db_session.query(ProcessingLog).filter_by(video_id=video.id).all()

        # Check prosody log has opensmile tool + eGeMAPS params
        prosody_log = next(l for l in logs if l.module == "prosody")
        assert prosody_log.tool_name == "opensmile"
        assert prosody_log.parameters["feature_set"] == "eGeMAPSv02"
        assert prosody_log.success is True

        # Check facial log has py-feat
        facial_log = next(l for l in logs if l.module == "facial_expressions")
        assert facial_log.tool_name == "py-feat"
        assert facial_log.parameters["skip_frames"] == 12
