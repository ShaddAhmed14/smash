"""SMASH database schema — SQLAlchemy ORM models.

Single SQLite database storing all analysis results. Replaces the flat
JSON/CSV file-based approach for better querying, cross-video comparison,
and scalability to Goal 2's 3000+ TED Talks corpus.

Design principles:
- One core `videos` table as the central entity
- Time-series data stored as JSON arrays (SQLite JSON1 extension)
- Summary statistics as indexed columns for fast cross-corpus queries
- Embeddings stored as binary blobs (numpy arrays)
- All tables linked via video_id foreign key
- FAIR metadata: persistent identifiers, provenance, licensing, schema versioning

FAIR compliance:
- Findable: unique persistent IDs (video name + source), full-text search on transcripts
- Accessible: SQLite is self-contained, no server dependencies
- Interoperable: Dublin Core-aligned metadata fields, ISO 639-1 language codes,
  JSON-LD-ready provenance, standard feature names (eGeMAPS, FACS)
- Reusable: per-record provenance (tool version, parameters), corpus-level license
"""

from datetime import UTC, datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    JSON,
    LargeBinary,
    String,
    Text,
    UniqueConstraint,
    create_engine,
)
from sqlalchemy.orm import DeclarativeBase, relationship, sessionmaker

# Schema version — increment when schema changes
SCHEMA_VERSION = "1.0.0"


class Base(DeclarativeBase):
    pass


# ---------------------------------------------------------------------------
# FAIR: Corpus-level metadata
# ---------------------------------------------------------------------------

class CorpusMetadata(Base):
    """Corpus-level metadata following Dublin Core and FAIR principles.

    One row per corpus instance (typically just one for SMASH).
    """

    __tablename__ = "corpus_metadata"

    id = Column(Integer, primary_key=True)
    schema_version = Column(String(16), nullable=False, default=SCHEMA_VERSION)

    # Dublin Core metadata elements
    dc_title = Column(String(512), default="SMASH Multimodal Communication Corpus")
    dc_creator = Column(String(512))       # PI / team
    dc_subject = Column(JSON)              # keywords: ["multimodal", "communication", ...]
    dc_description = Column(Text)
    dc_publisher = Column(String(256))     # institution
    dc_date = Column(String(32))           # ISO 8601
    dc_type = Column(String(64), default="Dataset")
    dc_format = Column(String(64), default="application/x-sqlite3")
    dc_identifier = Column(String(256))    # DOI or persistent URL
    dc_source = Column(String(512))        # origin (e.g., TED Talks)
    dc_language = Column(JSON)             # ISO 639-1 codes: ["en", "es", "de", "ar"]
    dc_rights = Column(String(256))        # license (e.g., "CC-BY-4.0")

    # Provenance
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))
    pipeline_version = Column(String(32))  # SMASH version that generated this DB
    tool_versions = Column(JSON)           # {"opensmile": "2.5", "py-feat": "0.6.2", ...}


# ---------------------------------------------------------------------------
# FAIR: Processing provenance per analysis
# ---------------------------------------------------------------------------

class ProcessingLog(Base):
    """Provenance record for each processing step (FAIR: Reusable).

    Tracks which tool produced which result, with what parameters.
    """

    __tablename__ = "processing_log"

    id = Column(Integer, primary_key=True)
    video_id = Column(Integer, ForeignKey("videos.id"), nullable=False, index=True)
    module = Column(String(64), nullable=False, index=True)  # "prosody", "facial", etc.
    tool_name = Column(String(128))     # "opensmile", "py-feat", "whisper", etc.
    tool_version = Column(String(32))
    parameters = Column(JSON)           # {"feature_set": "eGeMAPSv02", "skip_frames": 12}
    started_at = Column(DateTime)
    completed_at = Column(DateTime)
    success = Column(Boolean, default=True)
    error_message = Column(Text)


# ---------------------------------------------------------------------------
# Core entity
# ---------------------------------------------------------------------------

class Video(Base):
    """Central entity — one row per video in the corpus.

    FAIR metadata: Dublin Core-aligned fields for findability.
    """

    __tablename__ = "videos"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(512), unique=True, nullable=False, index=True)

    # Dublin Core-aligned descriptive metadata
    speaker_name = Column(String(256), index=True)   # dc:creator
    title = Column(String(512))                       # dc:title (talk title)
    duration_s = Column(Float)
    sample_rate = Column(Integer)
    language = Column(String(8), index=True)          # ISO 639-1 (en, es, de, ar)
    year = Column(Integer, index=True)                # dc:date (year)
    topics = Column(JSON)                             # dc:subject
    speaker_gender = Column(String(32))
    source = Column(String(64), default="TED", index=True)  # dc:source
    source_url = Column(String(1024))                 # original video URL
    license = Column(String(64))                      # dc:rights per video

    # FAIR: provenance
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))
    updated_at = Column(DateTime, default=lambda: datetime.now(UTC), onupdate=lambda: datetime.now(UTC))
    processing_status = Column(String(32), default="pending")  # pending, processing, complete, error

    # Relationships
    audio_features = relationship("AudioFeatures", back_populates="video", uselist=False)
    prosody = relationship("Prosody", back_populates="video", uselist=False)
    pauses_fillers = relationship("PausesFillers", back_populates="video", uselist=False)
    facial_expressions = relationship("FacialExpressions", back_populates="video", uselist=False)
    visual_embedding = relationship("VisualEmbedding", back_populates="video", uselist=False)
    transcript_segments = relationship("TranscriptSegment", back_populates="video")
    gesture_segments = relationship("GestureSegment", back_populates="video")
    topic_assignments = relationship("TopicAssignment", back_populates="video")


# ---------------------------------------------------------------------------
# Audio features (existing: pitch, volume, tempo from librosa)
# ---------------------------------------------------------------------------

class AudioFeatures(Base):
    """Per-video audio features from librosa piptrack/RMS/onset."""

    __tablename__ = "audio_features"

    id = Column(Integer, primary_key=True)
    video_id = Column(Integer, ForeignKey("videos.id"), unique=True, nullable=False)

    # Time series stored as JSON arrays
    time = Column(JSON)       # frame timestamps
    pitch = Column(JSON)      # F0 values per frame
    volume = Column(JSON)     # volume (dB) per frame
    tempo = Column(JSON)      # tempo estimate per frame

    # Summary stats (indexed for cross-corpus queries)
    avg_pitch = Column(Float, index=True)
    avg_volume = Column(Float, index=True)
    avg_tempo = Column(Float, index=True)

    video = relationship("Video", back_populates="audio_features")


# ---------------------------------------------------------------------------
# Prosody (openSMILE eGeMAPS)
# ---------------------------------------------------------------------------

class Prosody(Base):
    """Per-video prosody features from openSMILE eGeMAPS."""

    __tablename__ = "prosody"

    id = Column(Integer, primary_key=True)
    video_id = Column(Integer, ForeignKey("videos.id"), unique=True, nullable=False)

    # Frame-level contours (JSON: {feature_name: [values]})
    contours = Column(JSON)
    time = Column(JSON)

    # Functionals (summary stats from eGeMAPS — ~88 features)
    functionals = Column(JSON)

    # Key indexed summaries for cross-corpus queries
    f0_mean = Column(Float, index=True)
    f0_stddev = Column(Float)
    jitter_mean = Column(Float, index=True)
    shimmer_mean = Column(Float, index=True)
    hnr_mean = Column(Float, index=True)
    loudness_mean = Column(Float, index=True)
    alpha_ratio_mean = Column(Float)
    hammarberg_index_mean = Column(Float)
    spectral_flux_mean = Column(Float)

    video = relationship("Video", back_populates="prosody")


# ---------------------------------------------------------------------------
# Pauses, fillers, speech rate
# ---------------------------------------------------------------------------

class PausesFillers(Base):
    """Per-video pause and filler analysis."""

    __tablename__ = "pauses_fillers"

    id = Column(Integer, primary_key=True)
    video_id = Column(Integer, ForeignKey("videos.id"), unique=True, nullable=False)

    # Event lists (JSON arrays of {start, end, duration, ...})
    pauses = Column(JSON)
    fillers = Column(JSON)
    speech_rates = Column(JSON)
    audio_silences = Column(JSON)

    # Summary stats (indexed)
    total_pauses = Column(Integer, index=True)
    total_fillers = Column(Integer, index=True)
    avg_pause_duration = Column(Float)
    max_pause_duration = Column(Float)
    filler_rate_per_min = Column(Float, index=True)
    avg_speech_rate_wpm = Column(Float, index=True)
    total_words = Column(Integer)
    total_duration_s = Column(Float)
    filler_word_counts = Column(JSON)  # {"um": 5, "uh": 3, ...}

    video = relationship("Video", back_populates="pauses_fillers")


# ---------------------------------------------------------------------------
# Facial expressions (py-feat)
# ---------------------------------------------------------------------------

class FacialExpressions(Base):
    """Per-video facial expression analysis from py-feat."""

    __tablename__ = "facial_expressions"

    id = Column(Integer, primary_key=True)
    video_id = Column(Integer, ForeignKey("videos.id"), unique=True, nullable=False)

    # Time series (JSON: {emotion: [values], AU: [values]})
    frames = Column(JSON)
    emotions = Column(JSON)     # 7 basic emotions per frame
    action_units = Column(JSON)  # 16 key AUs per frame

    # Summary stats (indexed)
    faces_detected = Column(Integer)
    total_frames_analysed = Column(Integer)
    dominant_emotion = Column(String(32), index=True)

    # Per-emotion means (indexed for "find happiest speakers" queries)
    anger_mean = Column(Float, index=True)
    disgust_mean = Column(Float)
    fear_mean = Column(Float)
    happiness_mean = Column(Float, index=True)
    sadness_mean = Column(Float)
    surprise_mean = Column(Float)
    neutral_mean = Column(Float)

    # Key AU means
    au06_mean = Column(Float)  # Cheek raiser (Duchenne smile)
    au12_mean = Column(Float)  # Lip corner puller (smile)
    au04_mean = Column(Float)  # Brow lowerer

    video = relationship("Video", back_populates="facial_expressions")


# ---------------------------------------------------------------------------
# Visual embeddings (DINOv2 ViT)
# ---------------------------------------------------------------------------

class VisualEmbedding(Base):
    """Per-video visual embedding from DINOv2 keyframe analysis."""

    __tablename__ = "visual_embeddings"

    id = Column(Integer, primary_key=True)
    video_id = Column(Integer, ForeignKey("videos.id"), unique=True, nullable=False)

    # Embedding stored as binary (numpy tobytes/frombuffer)
    mean_embedding = Column(LargeBinary)  # 384-dim float32 = 1.5KB
    embedding_dim = Column(Integer)
    n_frames = Column(Integer)
    visual_variability = Column(Float, index=True)

    video = relationship("Video", back_populates="visual_embedding")


# ---------------------------------------------------------------------------
# Transcript segments (from Whisper SRT)
# ---------------------------------------------------------------------------

class TranscriptSegment(Base):
    """Individual subtitle segment from Whisper transcription."""

    __tablename__ = "transcript_segments"

    id = Column(Integer, primary_key=True)
    video_id = Column(Integer, ForeignKey("videos.id"), nullable=False, index=True)
    segment_index = Column(Integer)
    start_s = Column(Float)
    end_s = Column(Float)
    text = Column(Text)

    __table_args__ = (
        UniqueConstraint("video_id", "segment_index"),
    )

    video = relationship("Video", back_populates="transcript_segments")


# ---------------------------------------------------------------------------
# Gesture segments (from EnvisionHGDetector)
# ---------------------------------------------------------------------------

class GestureSegment(Base):
    """Individual gesture segment detected by EnvisionHGDetector."""

    __tablename__ = "gesture_segments"

    id = Column(Integer, primary_key=True)
    video_id = Column(Integer, ForeignKey("videos.id"), nullable=False, index=True)
    gesture_id = Column(String(128))
    start_s = Column(Float)
    end_s = Column(Float)
    duration_s = Column(Float)

    # DTW kinematic features
    amplitude = Column(Float)
    velocity_mean = Column(Float)
    velocity_max = Column(Float)
    acceleration_mean = Column(Float)
    smoothness = Column(Float)

    video = relationship("Video", back_populates="gesture_segments")


# ---------------------------------------------------------------------------
# Topic modelling (BERTopic)
# ---------------------------------------------------------------------------

class Topic(Base):
    """BERTopic topic cluster."""

    __tablename__ = "topics"

    id = Column(Integer, primary_key=True)
    topic_id = Column(Integer, unique=True, nullable=False)
    label = Column(String(256))
    keywords = Column(JSON)  # top-N keywords
    size = Column(Integer)   # number of documents in topic


class TopicAssignment(Base):
    """Video-to-topic assignment with probability."""

    __tablename__ = "topic_assignments"

    id = Column(Integer, primary_key=True)
    video_id = Column(Integer, ForeignKey("videos.id"), nullable=False, index=True)
    topic_id = Column(Integer, ForeignKey("topics.topic_id"), nullable=False, index=True)
    probability = Column(Float)

    video = relationship("Video", back_populates="topic_assignments")


# ---------------------------------------------------------------------------
# Sentiment (NLTK VADER temporal)
# ---------------------------------------------------------------------------

class Sentiment(Base):
    """Per-video temporal sentiment from VADER."""

    __tablename__ = "sentiment"

    id = Column(Integer, primary_key=True)
    video_id = Column(Integer, ForeignKey("videos.id"), unique=True, nullable=False)

    # Per-segment sentiment scores (JSON array)
    segments = Column(JSON)  # [{start, end, pos, neg, neu, compound}]

    # Summary
    avg_compound = Column(Float, index=True)
    avg_positive = Column(Float)
    avg_negative = Column(Float)
    sentiment_variability = Column(Float)  # std of compound scores


# ---------------------------------------------------------------------------
# Database setup
# ---------------------------------------------------------------------------

def get_engine(db_path: str = "/materials/smash.db"):
    """Create SQLite engine with WAL mode for concurrent reads."""
    from sqlalchemy import text

    engine = create_engine(
        f"sqlite:///{db_path}",
        connect_args={"check_same_thread": False},
        echo=False,
    )
    # Enable WAL mode for better concurrent read performance
    with engine.connect() as conn:
        conn.execute(text("PRAGMA journal_mode=WAL"))
        conn.execute(text("PRAGMA foreign_keys=ON"))
        conn.commit()
    return engine


def create_tables(db_path: str = "/materials/smash.db"):
    """Create all tables and seed corpus metadata."""
    engine = get_engine(db_path)
    Base.metadata.create_all(engine)

    # Seed corpus metadata if not exists
    Session = sessionmaker(bind=engine)
    session = Session()
    if session.query(CorpusMetadata).count() == 0:
        session.add(CorpusMetadata(
            schema_version=SCHEMA_VERSION,
            dc_title="SMASH Multimodal Communication Corpus",
            dc_type="Dataset",
            dc_format="application/x-sqlite3",
            dc_rights="MIT",
            created_at=datetime.now(UTC),
        ))
        session.commit()
    session.close()
    return engine


def get_session(engine):
    """Create a new database session."""
    Session = sessionmaker(bind=engine)
    return Session()
