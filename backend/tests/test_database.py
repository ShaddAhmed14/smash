"""Tests for SMASH database schema and operations.

All tests use in-memory SQLite — no real videos or GPU needed.
Run with: pytest tests/test_database.py -v
"""

import json
import tempfile
from datetime import datetime
from pathlib import Path

import numpy as np
import pytest

import sys
sys.path.insert(0, str(Path(__file__).parent.parent))

from database import (
    SCHEMA_VERSION,
    Base,
    CorpusMetadata,
    ProcessingLog,
    Video,
    AudioFeatures,
    Prosody,
    PausesFillers,
    FacialExpressions,
    VisualEmbedding,
    TranscriptSegment,
    GestureSegment,
    Topic,
    TopicAssignment,
    Sentiment,
    create_tables,
    get_engine,
    get_session,
)


@pytest.fixture
def db_path(tmp_path):
    """Create a temporary database path."""
    return str(tmp_path / "test_smash.db")


@pytest.fixture
def engine(db_path):
    """Create database engine with all tables."""
    return create_tables(db_path)


@pytest.fixture
def session(engine):
    """Create a database session."""
    s = get_session(engine)
    yield s
    s.close()


# ---------------------------------------------------------------------------
# Schema creation
# ---------------------------------------------------------------------------

class TestSchemaCreation:
    def test_create_tables(self, engine):
        """All tables should be created."""
        inspector = Base.metadata
        table_names = list(inspector.tables.keys())
        expected = [
            "corpus_metadata", "processing_log", "videos",
            "audio_features", "prosody", "pauses_fillers",
            "facial_expressions", "visual_embeddings",
            "transcript_segments", "gesture_segments",
            "topics", "topic_assignments", "sentiment",
        ]
        for name in expected:
            assert name in table_names, f"Missing table: {name}"

    def test_corpus_metadata_seeded(self, session):
        """Corpus metadata should be auto-seeded on creation."""
        meta = session.query(CorpusMetadata).first()
        assert meta is not None
        assert meta.schema_version == SCHEMA_VERSION
        assert meta.dc_title == "SMASH Multimodal Communication Corpus"
        assert meta.dc_type == "Dataset"
        assert meta.dc_rights == "MIT"

    def test_schema_version(self):
        """Schema version should be a valid semver string."""
        parts = SCHEMA_VERSION.split(".")
        assert len(parts) == 3
        assert all(p.isdigit() for p in parts)


# ---------------------------------------------------------------------------
# Video CRUD
# ---------------------------------------------------------------------------

class TestVideoCRUD:
    def test_create_video(self, session):
        video = Video(
            name="TestTalk001",
            speaker_name="Alice Speaker",
            title="The Art of Testing",
            duration_s=600.0,
            sample_rate=44100,
            language="en",
            year=2024,
            topics=["testing", "software"],
            speaker_gender="Female",
            source="TED",
            source_url="https://ted.com/talks/test001",
            license="CC-BY-4.0",
        )
        session.add(video)
        session.commit()

        fetched = session.query(Video).filter_by(name="TestTalk001").first()
        assert fetched is not None
        assert fetched.speaker_name == "Alice Speaker"
        assert fetched.language == "en"
        assert fetched.topics == ["testing", "software"]
        assert fetched.source_url == "https://ted.com/talks/test001"

    def test_unique_video_name(self, session):
        session.add(Video(name="Unique001", language="en"))
        session.commit()
        session.add(Video(name="Unique001", language="de"))
        with pytest.raises(Exception):
            session.commit()
        session.rollback()

    def test_video_processing_status(self, session):
        video = Video(name="StatusTest001")
        session.add(video)
        session.commit()
        assert video.processing_status == "pending"

        video.processing_status = "complete"
        session.commit()
        assert session.query(Video).filter_by(name="StatusTest001").first().processing_status == "complete"


# ---------------------------------------------------------------------------
# FAIR metadata
# ---------------------------------------------------------------------------

class TestFAIRMetadata:
    def test_dublin_core_fields_on_video(self, session):
        """Videos should support Dublin Core metadata."""
        video = Video(
            name="FAIR001",
            title="Testing FAIR Principles",
            speaker_name="Dr. FAIR",
            language="en",
            year=2025,
            topics=["FAIR", "metadata", "open science"],
            source="TED",
            source_url="https://ted.com/talks/fair001",
            license="CC-BY-4.0",
        )
        session.add(video)
        session.commit()

        v = session.query(Video).filter_by(name="FAIR001").first()
        assert v.title == "Testing FAIR Principles"
        assert v.license == "CC-BY-4.0"
        assert v.source_url is not None

    def test_corpus_metadata_dublin_core(self, session):
        meta = session.query(CorpusMetadata).first()
        meta.dc_creator = "Wim Pouw, Babajide Owoyele, Gerard de Melo"
        meta.dc_subject = ["multimodal communication", "gesture", "prosody", "NLP"]
        meta.dc_language = ["en", "es", "de", "ar"]
        meta.dc_identifier = "doi:10.5281/zenodo.XXXXXXX"
        meta.pipeline_version = "1.0.0"
        meta.tool_versions = {
            "opensmile": "2.5.0",
            "py-feat": "0.6.2",
            "whisper": "20231117",
            "spacy": "3.7.0",
            "bertopic": "0.16.0",
        }
        session.commit()

        fetched = session.query(CorpusMetadata).first()
        assert fetched.dc_creator == "Wim Pouw, Babajide Owoyele, Gerard de Melo"
        assert "en" in fetched.dc_language
        assert fetched.tool_versions["opensmile"] == "2.5.0"

    def test_processing_provenance(self, session):
        """Each analysis step should have a provenance record."""
        video = Video(name="Provenance001")
        session.add(video)
        session.commit()

        log = ProcessingLog(
            video_id=video.id,
            module="prosody",
            tool_name="opensmile",
            tool_version="2.5.0",
            parameters={"feature_set": "eGeMAPSv02", "feature_level": "LowLevelDescriptors"},
            started_at=datetime(2026, 3, 8, 10, 0, 0),
            completed_at=datetime(2026, 3, 8, 10, 0, 15),
            success=True,
        )
        session.add(log)
        session.commit()

        logs = session.query(ProcessingLog).filter_by(video_id=video.id).all()
        assert len(logs) == 1
        assert logs[0].tool_name == "opensmile"
        assert logs[0].parameters["feature_set"] == "eGeMAPSv02"


# ---------------------------------------------------------------------------
# Analysis tables
# ---------------------------------------------------------------------------

class TestAudioFeatures:
    def test_create_audio_features(self, session):
        video = Video(name="Audio001", duration_s=120.0)
        session.add(video)
        session.commit()

        af = AudioFeatures(
            video_id=video.id,
            time=[0.0, 0.5, 1.0],
            pitch=[220.0, 225.0, 230.0],
            volume=[-20.0, -18.0, -22.0],
            tempo=[120.0, 120.0, 122.0],
            avg_pitch=225.0,
            avg_volume=-20.0,
            avg_tempo=120.67,
        )
        session.add(af)
        session.commit()

        assert video.audio_features is not None
        assert video.audio_features.avg_pitch == 225.0
        assert len(video.audio_features.pitch) == 3


class TestProsody:
    def test_create_prosody(self, session):
        video = Video(name="Prosody001")
        session.add(video)
        session.commit()

        prosody = Prosody(
            video_id=video.id,
            time=[0.0, 0.02, 0.04],
            contours={
                "F0semitoneFrom27.5Hz_sma3nz": [12.5, 13.0, 12.8],
                "loudness_sma3nz": [0.8, 0.9, 0.85],
            },
            functionals={"F0semitoneFrom27.5Hz_sma3nz_amean": 12.77},
            f0_mean=12.77,
            jitter_mean=0.015,
            shimmer_mean=0.8,
            hnr_mean=15.2,
            loudness_mean=0.85,
        )
        session.add(prosody)
        session.commit()

        assert video.prosody.f0_mean == 12.77
        assert len(video.prosody.contours["loudness_sma3nz"]) == 3


class TestPausesFillers:
    def test_create_pauses_fillers(self, session):
        video = Video(name="Pauses001")
        session.add(video)
        session.commit()

        pf = PausesFillers(
            video_id=video.id,
            pauses=[{"start": 5.0, "end": 6.2, "duration": 1.2}],
            fillers=[{"word": "um", "start": 10.0, "end": 10.5}],
            speech_rates=[{"start": 0.0, "end": 30.0, "wpm": 145.0}],
            audio_silences=[],
            total_pauses=1,
            total_fillers=1,
            avg_pause_duration=1.2,
            max_pause_duration=1.2,
            filler_rate_per_min=2.0,
            avg_speech_rate_wpm=145.0,
            total_words=300,
            total_duration_s=120.0,
            filler_word_counts={"um": 1},
        )
        session.add(pf)
        session.commit()

        assert video.pauses_fillers.total_pauses == 1
        assert video.pauses_fillers.filler_word_counts["um"] == 1


class TestFacialExpressions:
    def test_create_facial_expressions(self, session):
        video = Video(name="Face001")
        session.add(video)
        session.commit()

        fe = FacialExpressions(
            video_id=video.id,
            frames=[0, 12, 24, 36],
            emotions={
                "happiness": [0.8, 0.7, 0.9, 0.6],
                "neutral": [0.1, 0.2, 0.05, 0.3],
            },
            action_units={"AU12": [0.9, 0.8, 0.95, 0.7]},
            faces_detected=4,
            total_frames_analysed=4,
            dominant_emotion="happiness",
            happiness_mean=0.75,
            au12_mean=0.8375,
        )
        session.add(fe)
        session.commit()

        assert video.facial_expressions.dominant_emotion == "happiness"
        assert len(video.facial_expressions.emotions["happiness"]) == 4


class TestVisualEmbedding:
    def test_create_visual_embedding(self, session):
        video = Video(name="Visual001")
        session.add(video)
        session.commit()

        embedding = np.random.randn(384).astype(np.float32)
        ve = VisualEmbedding(
            video_id=video.id,
            mean_embedding=embedding.tobytes(),
            embedding_dim=384,
            n_frames=20,
            visual_variability=0.142,
        )
        session.add(ve)
        session.commit()

        # Round-trip the embedding
        stored = video.visual_embedding
        recovered = np.frombuffer(stored.mean_embedding, dtype=np.float32)
        assert recovered.shape == (384,)
        np.testing.assert_array_almost_equal(recovered, embedding)


class TestTranscriptSegments:
    def test_create_transcript(self, session):
        video = Video(name="Transcript001")
        session.add(video)
        session.commit()

        segments = [
            TranscriptSegment(video_id=video.id, segment_index=0, start_s=0.0, end_s=5.0, text="Hello world"),
            TranscriptSegment(video_id=video.id, segment_index=1, start_s=5.0, end_s=10.0, text="This is a test"),
        ]
        session.add_all(segments)
        session.commit()

        assert len(video.transcript_segments) == 2
        assert video.transcript_segments[0].text == "Hello world"

    def test_unique_segment_per_video(self, session):
        video = Video(name="TranscriptDup001")
        session.add(video)
        session.commit()

        session.add(TranscriptSegment(video_id=video.id, segment_index=0, text="First"))
        session.commit()
        session.add(TranscriptSegment(video_id=video.id, segment_index=0, text="Duplicate"))
        with pytest.raises(Exception):
            session.commit()
        session.rollback()


class TestGestureSegments:
    def test_create_gesture(self, session):
        video = Video(name="Gesture001")
        session.add(video)
        session.commit()

        gs = GestureSegment(
            video_id=video.id,
            gesture_id="g_001",
            start_s=12.5,
            end_s=14.0,
            duration_s=1.5,
            amplitude=0.45,
            velocity_mean=0.12,
            velocity_max=0.38,
            smoothness=0.85,
        )
        session.add(gs)
        session.commit()

        assert len(video.gesture_segments) == 1
        assert video.gesture_segments[0].amplitude == 0.45


class TestTopics:
    def test_topic_assignment(self, session):
        video = Video(name="Topic001")
        topic = Topic(topic_id=0, label="AI and Ethics", keywords=["AI", "ethics", "bias"], size=42)
        session.add_all([video, topic])
        session.commit()

        ta = TopicAssignment(video_id=video.id, topic_id=0, probability=0.87)
        session.add(ta)
        session.commit()

        assert len(video.topic_assignments) == 1
        assert video.topic_assignments[0].probability == 0.87


class TestSentiment:
    def test_create_sentiment(self, session):
        video = Video(name="Sentiment001")
        session.add(video)
        session.commit()

        s = Sentiment(
            video_id=video.id,
            segments=[
                {"start": 0, "end": 30, "compound": 0.6},
                {"start": 30, "end": 60, "compound": -0.2},
            ],
            avg_compound=0.2,
            avg_positive=0.3,
            avg_negative=0.1,
            sentiment_variability=0.4,
        )
        session.add(s)
        session.commit()

        assert video.id == s.video_id


# ---------------------------------------------------------------------------
# Cross-corpus queries (the real value of the DB)
# ---------------------------------------------------------------------------

class TestCrossCorpusQueries:
    """Queries that would be very slow with flat JSON files but fast with DB."""

    @pytest.fixture(autouse=True)
    def populate(self, session):
        """Insert 10 synthetic videos with analysis data."""
        languages = ["en", "es", "de", "ar", "en", "es", "de", "ar", "en", "en"]
        for i in range(10):
            video = Video(
                name=f"TED{i:04d}",
                speaker_name=f"Speaker_{i}",
                language=languages[i],
                year=2020 + (i % 5),
                duration_s=120 + i * 30,
                processing_status="complete",
            )
            session.add(video)
            session.flush()

            session.add(Prosody(
                video_id=video.id,
                f0_mean=100.0 + i * 10,
                loudness_mean=0.5 + i * 0.05,
                jitter_mean=0.01 + i * 0.002,
                shimmer_mean=0.5 + i * 0.1,
                hnr_mean=15.0 + i,
            ))
            session.add(PausesFillers(
                video_id=video.id,
                total_pauses=5 + i,
                total_fillers=2 + i,
                avg_speech_rate_wpm=130 + i * 5,
                filler_rate_per_min=1.0 + i * 0.3,
            ))
            session.add(FacialExpressions(
                video_id=video.id,
                dominant_emotion="happiness" if i % 2 == 0 else "neutral",
                happiness_mean=0.5 + (i % 3) * 0.1,
            ))

        session.commit()

    def test_query_by_language(self, session):
        """Find all English speakers."""
        en_videos = session.query(Video).filter(Video.language == "en").all()
        assert len(en_videos) == 4

    def test_query_fastest_speakers(self, session):
        """Top 3 speakers by speech rate."""
        fastest = (
            session.query(Video.name, PausesFillers.avg_speech_rate_wpm)
            .join(PausesFillers)
            .order_by(PausesFillers.avg_speech_rate_wpm.desc())
            .limit(3)
            .all()
        )
        assert len(fastest) == 3
        assert fastest[0][1] > fastest[1][1]  # sorted descending

    def test_query_highest_pitch_by_language(self, session):
        """Average F0 per language."""
        from sqlalchemy import func

        result = (
            session.query(
                Video.language,
                func.avg(Prosody.f0_mean).label("avg_f0"),
                func.count(Video.id).label("n"),
            )
            .join(Prosody)
            .group_by(Video.language)
            .all()
        )
        lang_f0 = {r[0]: r[1] for r in result}
        assert "en" in lang_f0
        assert "es" in lang_f0

    def test_query_happiest_speakers(self, session):
        """Speakers with dominant emotion = happiness."""
        happy = (
            session.query(Video.name, FacialExpressions.happiness_mean)
            .join(FacialExpressions)
            .filter(FacialExpressions.dominant_emotion == "happiness")
            .order_by(FacialExpressions.happiness_mean.desc())
            .all()
        )
        assert len(happy) == 5  # every other video

    def test_query_most_fillers_per_language(self, session):
        """Compare filler rates across languages."""
        from sqlalchemy import func

        result = (
            session.query(
                Video.language,
                func.avg(PausesFillers.filler_rate_per_min).label("avg_filler_rate"),
            )
            .join(PausesFillers)
            .group_by(Video.language)
            .all()
        )
        assert len(result) == 4  # 4 languages

    def test_query_prosody_vs_expression_correlation(self, session):
        """Join prosody and facial expression data for correlation analysis."""
        result = (
            session.query(
                Video.name,
                Prosody.f0_mean,
                FacialExpressions.happiness_mean,
            )
            .join(Prosody)
            .join(FacialExpressions)
            .all()
        )
        assert len(result) == 10
        # All records should have both prosody and expression data
        for name, f0, happiness in result:
            assert f0 is not None
            assert happiness is not None
