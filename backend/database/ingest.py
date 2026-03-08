"""Ingest JSON analysis outputs into the SMASH SQLite database.

Reads the per-video JSON files produced by each analysis module and
populates the corresponding ORM tables. Designed to be idempotent —
re-running on the same video folder updates existing records rather
than duplicating them.

Usage (from prepare_materials.py or standalone):
    from database.ingest import ingest_video_folder, ingest_corpus

    engine = create_tables("/materials/smash.db")
    ingest_corpus("/materials", engine)
"""

from __future__ import annotations

import json
import logging
from datetime import UTC, datetime
from pathlib import Path

import numpy as np
from sqlalchemy.orm import Session

from .schema import (
    AudioFeatures,
    FacialExpressions,
    GestureSegment,
    PausesFillers,
    ProcessingLog,
    Prosody,
    Sentiment,
    Topic,
    TopicAssignment,
    TranscriptSegment,
    Video,
    VisualEmbedding,
    get_session,
)

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _load_json(path: Path) -> dict | list | None:
    """Load a JSON file, returning None if missing or invalid."""
    if not path.is_file():
        return None
    with open(path) as f:
        return json.load(f)


def _get_or_create_video(session: Session, name: str) -> Video:
    """Get existing video record or create a new one."""
    video = session.query(Video).filter_by(name=name).first()
    if video is None:
        video = Video(name=name, processing_status="processing")
        session.add(video)
        session.flush()  # assign id
    return video


def _log_processing(
    session: Session,
    video_id: int,
    module: str,
    tool_name: str,
    tool_version: str | None = None,
    parameters: dict | None = None,
    success: bool = True,
    error_message: str | None = None,
) -> None:
    """Record a processing step in the provenance log."""
    session.add(ProcessingLog(
        video_id=video_id,
        module=module,
        tool_name=tool_name,
        tool_version=tool_version,
        parameters=parameters,
        started_at=datetime.now(UTC),
        completed_at=datetime.now(UTC),
        success=success,
        error_message=error_message,
    ))


# ---------------------------------------------------------------------------
# Per-module ingestors
# ---------------------------------------------------------------------------

def ingest_audio_features(session: Session, video: Video, folder: Path) -> bool:
    """Ingest {video}_audio_features.json into AudioFeatures table."""
    data = _load_json(folder / f"{video.name}_audio_features.json")
    if data is None:
        return False

    # Compute summary stats from time series
    pitch_vals = [v for v in (data.get("pitch") or []) if v > 0]
    volume_vals = data.get("volume") or []
    tempo_vals = [v for v in (data.get("tempo") or []) if v > 0]

    record = session.query(AudioFeatures).filter_by(video_id=video.id).first()
    if record is None:
        record = AudioFeatures(video_id=video.id)
        session.add(record)

    record.time = data.get("time")
    record.pitch = data.get("pitch")
    record.volume = data.get("volume")
    record.tempo = data.get("tempo")
    record.avg_pitch = float(np.mean(pitch_vals)) if pitch_vals else None
    record.avg_volume = float(np.mean(volume_vals)) if volume_vals else None
    record.avg_tempo = float(np.mean(tempo_vals)) if tempo_vals else None

    # Update video metadata from audio
    if data.get("sample_rate"):
        video.sample_rate = data["sample_rate"]
    if data.get("duration"):
        video.duration_s = data["duration"]

    _log_processing(session, video.id, "audio_features", "librosa")
    return True


def ingest_prosody(session: Session, video: Video, folder: Path) -> bool:
    """Ingest {video}_prosody.json into Prosody table."""
    data = _load_json(folder / f"{video.name}_prosody.json")
    if data is None:
        return False

    record = session.query(Prosody).filter_by(video_id=video.id).first()
    if record is None:
        record = Prosody(video_id=video.id)
        session.add(record)

    record.contours = data.get("contours")
    record.time = data.get("time")
    record.functionals = data.get("functionals")

    # Extract key summary stats from contours
    contours = data.get("contours") or {}
    for feature_key, column_name in [
        ("F0semitoneFrom27.5Hz_sma3nz", "f0_mean"),
        ("jitterLocal_sma3nz", "jitter_mean"),
        ("shimmerLocaldB_sma3nz", "shimmer_mean"),
        ("HNRdBACF_sma3nz", "hnr_mean"),
        ("loudness_sma3nz", "loudness_mean"),
        ("alphaRatioV_sma3nz", "alpha_ratio_mean"),
        ("hammarbergIndexV_sma3nz", "hammarberg_index_mean"),
        ("spectralFlux_sma3nz", "spectral_flux_mean"),
    ]:
        vals = contours.get(feature_key, [])
        if vals:
            setattr(record, column_name, float(np.mean(vals)))

    # F0 stddev
    f0_vals = contours.get("F0semitoneFrom27.5Hz_sma3nz", [])
    if f0_vals:
        record.f0_stddev = float(np.std(f0_vals))

    _log_processing(
        session, video.id, "prosody", "opensmile",
        parameters={"feature_set": "eGeMAPSv02"},
    )
    return True


def ingest_pauses_fillers(session: Session, video: Video, folder: Path) -> bool:
    """Ingest {video}_pauses_fillers.json into PausesFillers table."""
    data = _load_json(folder / f"{video.name}_pauses_fillers.json")
    if data is None:
        return False

    record = session.query(PausesFillers).filter_by(video_id=video.id).first()
    if record is None:
        record = PausesFillers(video_id=video.id)
        session.add(record)

    record.pauses = data.get("pauses")
    record.fillers = data.get("fillers")
    record.speech_rates = data.get("speech_rates")
    record.audio_silences = data.get("audio_silences")

    summary = data.get("summary") or {}
    record.total_pauses = summary.get("total_pauses")
    record.total_fillers = summary.get("total_fillers")
    record.avg_pause_duration = summary.get("avg_pause_duration")
    record.max_pause_duration = summary.get("max_pause_duration")
    record.filler_rate_per_min = summary.get("filler_rate_per_minute")
    record.avg_speech_rate_wpm = summary.get("avg_speech_rate_wpm")
    record.total_words = summary.get("total_words")
    record.total_duration_s = summary.get("total_duration_s")
    record.filler_word_counts = summary.get("filler_word_counts")

    _log_processing(
        session, video.id, "pauses_fillers", "srt_parser+librosa",
        parameters={"pause_threshold": 0.5},
    )
    return True


def ingest_facial_expressions(session: Session, video: Video, folder: Path) -> bool:
    """Ingest {video}_facial_expressions.json into FacialExpressions table."""
    data = _load_json(folder / f"{video.name}_facial_expressions.json")
    if data is None:
        return False

    record = session.query(FacialExpressions).filter_by(video_id=video.id).first()
    if record is None:
        record = FacialExpressions(video_id=video.id)
        session.add(record)

    record.frames = data.get("frames")
    record.emotions = data.get("emotions")
    record.action_units = data.get("action_units")

    summary = data.get("summary") or {}
    record.faces_detected = summary.get("faces_detected")
    record.total_frames_analysed = summary.get("total_frames_analysed")
    record.dominant_emotion = summary.get("dominant_emotion")

    emotion_means = summary.get("emotion_means") or {}
    record.anger_mean = emotion_means.get("anger")
    record.disgust_mean = emotion_means.get("disgust")
    record.fear_mean = emotion_means.get("fear")
    record.happiness_mean = emotion_means.get("happiness")
    record.sadness_mean = emotion_means.get("sadness")
    record.surprise_mean = emotion_means.get("surprise")
    record.neutral_mean = emotion_means.get("neutral")

    au_means = summary.get("au_means") or {}
    record.au06_mean = au_means.get("AU06")
    record.au12_mean = au_means.get("AU12")
    record.au04_mean = au_means.get("AU04")

    _log_processing(
        session, video.id, "facial_expressions", "py-feat",
        parameters={"skip_frames": 12, "face_detection_threshold": 0.9},
    )
    return True


def ingest_visual_embedding(session: Session, video: Video, folder: Path) -> bool:
    """Ingest {video}_visual_embeddings.json into VisualEmbedding table."""
    data = _load_json(folder / f"{video.name}_visual_embeddings.json")
    if data is None:
        return False

    record = session.query(VisualEmbedding).filter_by(video_id=video.id).first()
    if record is None:
        record = VisualEmbedding(video_id=video.id)
        session.add(record)

    mean_emb = data.get("mean_embedding", [])
    record.mean_embedding = np.array(mean_emb, dtype=np.float32).tobytes() if mean_emb else None
    record.embedding_dim = data.get("embedding_dim")
    record.n_frames = data.get("n_frames")
    record.visual_variability = data.get("visual_variability")

    _log_processing(
        session, video.id, "visual_embedding", "dinov2-vits16",
        parameters={"n_keyframes": 20, "skip_percent": 0.05},
    )
    return True


def ingest_transcript(session: Session, video: Video, folder: Path) -> bool:
    """Ingest SRT transcript into TranscriptSegment table.

    Reads the .srt file and parses segments. Falls back to checking
    for pre-parsed transcript JSON.
    """
    srt_path = folder / f"{video.name}_Original.srt"
    if not srt_path.is_file():
        return False

    # Delete existing segments for this video (full replace)
    session.query(TranscriptSegment).filter_by(video_id=video.id).delete()

    try:
        content = srt_path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        content = srt_path.read_text(encoding="latin-1")

    blocks = content.strip().split("\n\n")
    for idx, block in enumerate(blocks):
        lines = block.strip().split("\n")
        if len(lines) < 3:
            continue

        # Parse timestamp line: "00:00:01,234 --> 00:00:03,456"
        timestamp_line = lines[1]
        if "-->" not in timestamp_line:
            continue

        start_str, end_str = timestamp_line.split("-->")
        text = " ".join(lines[2:]).strip()

        def _parse_srt_time(t: str) -> float:
            t = t.strip().replace(",", ".")
            parts = t.split(":")
            return float(parts[0]) * 3600 + float(parts[1]) * 60 + float(parts[2])

        session.add(TranscriptSegment(
            video_id=video.id,
            segment_index=idx,
            start_s=_parse_srt_time(start_str),
            end_s=_parse_srt_time(end_str),
            text=text,
        ))

    _log_processing(session, video.id, "transcript", "whisper")
    return True


def ingest_sentiment(session: Session, video: Video, data: dict) -> bool:
    """Ingest temporal sentiment data for a single video.

    Called from ingest_corpus_level with pre-parsed data from
    temporal_sentiment_data.json.
    """
    sentiments = data.get("temporal_sentiment", [])
    if not sentiments:
        return False

    record = session.query(Sentiment).filter_by(video_id=video.id).first()
    if record is None:
        record = Sentiment(video_id=video.id)
        session.add(record)

    # Build segment list matching the schema
    segments = []
    for i, compound in enumerate(sentiments):
        segments.append({"segment_index": i, "compound": compound})

    record.segments = segments
    record.avg_compound = float(np.mean(sentiments))
    record.avg_positive = None  # VADER compound only in this output
    record.avg_negative = None
    record.sentiment_variability = float(np.std(sentiments))

    _log_processing(session, video.id, "sentiment", "vader")
    return True


# ---------------------------------------------------------------------------
# Corpus-level ingestors (cross-video JSON files)
# ---------------------------------------------------------------------------

def ingest_topics(session: Session, materials: Path, video_lookup: dict[str, Video]) -> None:
    """Ingest BERTopic results from topic_interdistance.json and video_distribution.json."""
    topics_data = _load_json(materials / "topic_interdistance.json")
    dist_data = _load_json(materials / "video_distribution.json")

    if topics_data:
        # Clear and re-insert topics
        session.query(Topic).delete()
        for t in topics_data:
            topic_id = t.get("Topic")
            if topic_id is None:
                continue
            keywords_str = t.get("Top Words", "")
            keywords = [w.strip() for w in keywords_str.split(",") if w.strip()]
            session.add(Topic(
                topic_id=int(topic_id),
                label=t.get("Name"),
                keywords=keywords,
                size=t.get("Count"),
            ))

    if dist_data:
        session.query(TopicAssignment).delete()
        for entry in dist_data:
            title = entry.get("title", "")
            video = video_lookup.get(title)
            if video is None:
                continue
            for topic_id in entry.get("topics", []):
                session.add(TopicAssignment(
                    video_id=video.id,
                    topic_id=int(topic_id),
                    probability=1.0,  # distribution doesn't store probabilities
                ))


def ingest_temporal_sentiment(session: Session, materials: Path, video_lookup: dict[str, Video]) -> None:
    """Ingest temporal_sentiment_data.json across all videos."""
    data = _load_json(materials / "temporal_sentiment_data.json")
    if not data:
        return

    for entry in data:
        title = entry.get("title", "")
        video = video_lookup.get(title)
        if video is None:
            continue
        ingest_sentiment(session, video, entry)


# ---------------------------------------------------------------------------
# Main entry points
# ---------------------------------------------------------------------------

def ingest_video_folder(session: Session, folder: Path) -> Video | None:
    """Ingest all analysis outputs for a single video folder.

    Args:
        session: Active SQLAlchemy session.
        folder: Path to the video's output folder (e.g., /materials/VideoName/).

    Returns:
        The Video ORM object, or None if folder doesn't exist.
    """
    if not folder.is_dir():
        return None

    video_name = folder.name
    video = _get_or_create_video(session, video_name)

    modules_ingested = []

    if ingest_audio_features(session, video, folder):
        modules_ingested.append("audio_features")

    if ingest_prosody(session, video, folder):
        modules_ingested.append("prosody")

    if ingest_pauses_fillers(session, video, folder):
        modules_ingested.append("pauses_fillers")

    if ingest_facial_expressions(session, video, folder):
        modules_ingested.append("facial_expressions")

    if ingest_visual_embedding(session, video, folder):
        modules_ingested.append("visual_embedding")

    if ingest_transcript(session, video, folder):
        modules_ingested.append("transcript")

    if modules_ingested:
        video.processing_status = "complete"
        logger.info(f"Ingested {video_name}: {', '.join(modules_ingested)}")
    else:
        logger.warning(f"No analysis files found for {video_name}")

    return video


def ingest_corpus(materials_path: str, engine) -> None:
    """Ingest all videos and corpus-level data into the database.

    Scans the materials folder for video subfolders, ingests per-video
    data, then ingests cross-corpus files (topics, sentiment).

    Args:
        materials_path: Path to the materials folder.
        engine: SQLAlchemy engine (from create_tables or get_engine).
    """
    materials = Path(materials_path)
    session = get_session(engine)

    try:
        # Find all video folders (directories that aren't hidden)
        video_folders = sorted(
            p for p in materials.iterdir()
            if p.is_dir() and not p.name.startswith(".")
        )

        if not video_folders:
            logger.warning(f"No video folders found in {materials}")
            return

        logger.info(f"Ingesting {len(video_folders)} videos from {materials}")

        # Per-video ingestion
        video_lookup: dict[str, Video] = {}
        for folder in video_folders:
            video = ingest_video_folder(session, folder)
            if video is not None:
                video_lookup[video.name] = video

        # Corpus-level ingestion
        ingest_topics(session, materials, video_lookup)
        ingest_temporal_sentiment(session, materials, video_lookup)

        session.commit()
        logger.info(
            f"Corpus ingestion complete: {len(video_lookup)} videos, "
            f"{session.query(ProcessingLog).count()} processing log entries"
        )

    except Exception:
        session.rollback()
        logger.exception("Corpus ingestion failed")
        raise
    finally:
        session.close()
