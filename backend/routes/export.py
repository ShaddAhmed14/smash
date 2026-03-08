"""Data export routes — researcher-facing downloads from the SMASH database.

Export types designed for downstream research use:
1. Per-video report        — all analysis for one video (paper case studies)
2. Corpus descriptives     — summary table across all videos (paper Table 1)
3. Time-aligned streams    — synchronized multimodal time series (replication)
4. Embeddings              — visual/spectrogram embeddings (downstream ML)
5. Provenance metadata     — FAIR compliance, tool versions (grant reporting)
6. Filtered subset         — query-based corpus slicing (custom research designs)
"""

import csv
import io
import json
import logging
from pathlib import Path
from typing import Optional

import numpy as np
from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse, StreamingResponse

from config import MATERIALS_FOLDER
from database.schema import (
    AudioFeatures,
    CorpusMetadata,
    FacialExpressions,
    GestureSegment,
    PausesFillers,
    ProcessingLog,
    Prosody,
    Sentiment,
    TopicAssignment,
    TranscriptSegment,
    Video,
    VisualEmbedding,
    get_engine,
    get_session,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/export", tags=["export"])

DB_PATH = str(Path(MATERIALS_FOLDER) / "smash.db")


def _get_db_session():
    """Get a database session, creating tables if needed."""
    try:
        engine = get_engine(DB_PATH)
        return get_session(engine)
    except Exception as e:
        logger.warning(f"Database not available: {e}")
        return None


def _stream_json(data: dict | list, filename: str) -> StreamingResponse:
    """Stream JSON response as file download."""
    content = json.dumps(data, indent=2, default=str)
    return StreamingResponse(
        io.BytesIO(content.encode()),
        media_type="application/json",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


def _stream_csv(rows: list[dict], filename: str) -> StreamingResponse:
    """Stream CSV response as file download."""
    if not rows:
        return JSONResponse(content={"message": "No data"}, status_code=404)
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=rows[0].keys())
    writer.writeheader()
    writer.writerows(rows)
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode()),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


# ---------------------------------------------------------------------------
# 1. Per-video report — all analysis for one video
# ---------------------------------------------------------------------------

@router.get("/video_report")
def export_video_report(
    video_name: str,
    format: str = Query("json", pattern="^(json|csv)$"),
):
    """Export complete analysis report for a single video.

    Includes: audio features, prosody, pauses/fillers, facial expressions,
    transcript, gesture segments, sentiment, and topic assignments.
    Suitable for paper case studies and supplementary materials.
    """
    session = _get_db_session()
    if session is None:
        return JSONResponse(content={"message": "Database not available"}, status_code=503)

    try:
        video = session.query(Video).filter_by(name=video_name).first()
        if video is None:
            return JSONResponse(content={"message": "Video not found"}, status_code=404)

        report = {
            "video_name": video.name,
            "metadata": {
                "speaker": video.speaker_name,
                "title": video.title,
                "duration_s": video.duration_s,
                "language": video.language,
                "source": video.source,
                "processing_status": video.processing_status,
            },
        }

        # Audio features
        af = session.query(AudioFeatures).filter_by(video_id=video.id).first()
        if af:
            report["audio_features"] = {
                "avg_pitch": af.avg_pitch,
                "avg_volume": af.avg_volume,
                "avg_tempo": af.avg_tempo,
                "time_series_length": len(af.time) if af.time else 0,
            }

        # Prosody
        p = session.query(Prosody).filter_by(video_id=video.id).first()
        if p:
            report["prosody"] = {
                "f0_mean": p.f0_mean,
                "f0_stddev": p.f0_stddev,
                "jitter_mean": p.jitter_mean,
                "shimmer_mean": p.shimmer_mean,
                "hnr_mean": p.hnr_mean,
                "loudness_mean": p.loudness_mean,
                "alpha_ratio_mean": p.alpha_ratio_mean,
                "hammarberg_index_mean": p.hammarberg_index_mean,
                "spectral_flux_mean": p.spectral_flux_mean,
                "functionals": p.functionals,
            }

        # Pauses/fillers
        pf = session.query(PausesFillers).filter_by(video_id=video.id).first()
        if pf:
            report["pauses_fillers"] = {
                "total_pauses": pf.total_pauses,
                "total_fillers": pf.total_fillers,
                "avg_pause_duration": pf.avg_pause_duration,
                "max_pause_duration": pf.max_pause_duration,
                "filler_rate_per_min": pf.filler_rate_per_min,
                "avg_speech_rate_wpm": pf.avg_speech_rate_wpm,
                "total_words": pf.total_words,
                "total_duration_s": pf.total_duration_s,
                "filler_word_counts": pf.filler_word_counts,
            }

        # Facial expressions
        fe = session.query(FacialExpressions).filter_by(video_id=video.id).first()
        if fe:
            report["facial_expressions"] = {
                "dominant_emotion": fe.dominant_emotion,
                "faces_detected": fe.faces_detected,
                "total_frames_analysed": fe.total_frames_analysed,
                "emotion_means": {
                    "anger": fe.anger_mean,
                    "disgust": fe.disgust_mean,
                    "fear": fe.fear_mean,
                    "happiness": fe.happiness_mean,
                    "sadness": fe.sadness_mean,
                    "surprise": fe.surprise_mean,
                    "neutral": fe.neutral_mean,
                },
                "au_means": {
                    "AU04": fe.au04_mean,
                    "AU06": fe.au06_mean,
                    "AU12": fe.au12_mean,
                },
            }

        # Transcript
        segments = (
            session.query(TranscriptSegment)
            .filter_by(video_id=video.id)
            .order_by(TranscriptSegment.segment_index)
            .all()
        )
        if segments:
            report["transcript"] = {
                "segment_count": len(segments),
                "full_text": " ".join(s.text for s in segments if s.text),
                "segments": [
                    {"index": s.segment_index, "start_s": s.start_s, "end_s": s.end_s, "text": s.text}
                    for s in segments
                ],
            }

        # Gestures
        gestures = session.query(GestureSegment).filter_by(video_id=video.id).all()
        if gestures:
            report["gestures"] = {
                "total_gestures": len(gestures),
                "segments": [
                    {
                        "gesture_id": g.gesture_id,
                        "start_s": g.start_s, "end_s": g.end_s, "duration_s": g.duration_s,
                        "amplitude": g.amplitude, "velocity_mean": g.velocity_mean,
                        "smoothness": g.smoothness,
                    }
                    for g in gestures
                ],
            }

        # Sentiment
        sent = session.query(Sentiment).filter_by(video_id=video.id).first()
        if sent:
            report["sentiment"] = {
                "avg_compound": sent.avg_compound,
                "sentiment_variability": sent.sentiment_variability,
                "segments": sent.segments,
            }

        # Topic assignments
        topics = session.query(TopicAssignment).filter_by(video_id=video.id).all()
        if topics:
            report["topics"] = [
                {"topic_id": t.topic_id, "probability": t.probability}
                for t in topics
            ]

        if format == "csv":
            flat = {"video_name": video.name}
            for section in ["audio_features", "prosody", "pauses_fillers"]:
                for k, v in report.get(section, {}).items():
                    if isinstance(v, (int, float, str, type(None))):
                        flat[f"{section}_{k}"] = v
            if "facial_expressions" in report:
                flat["dominant_emotion"] = report["facial_expressions"]["dominant_emotion"]
                for emo, val in report["facial_expressions"].get("emotion_means", {}).items():
                    flat[f"emotion_{emo}"] = val
            if "sentiment" in report:
                flat["sentiment_avg_compound"] = report["sentiment"]["avg_compound"]
            return _stream_csv([flat], f"{video_name}_report.csv")

        return _stream_json(report, f"{video_name}_report.json")

    finally:
        session.close()


# ---------------------------------------------------------------------------
# 2. Corpus descriptives — summary table across all videos
# ---------------------------------------------------------------------------

@router.get("/corpus_descriptives")
def export_corpus_descriptives(
    format: str = Query("csv", pattern="^(json|csv)$"),
    language: Optional[str] = Query(None, description="Filter by ISO 639-1 language code"),
):
    """Export descriptive statistics across all videos.

    Ready for paper Table 1: one row per video with key metrics from every
    analysis module. Supports language filtering for cross-cultural studies.
    """
    session = _get_db_session()
    if session is None:
        return JSONResponse(content={"message": "Database not available"}, status_code=503)

    try:
        query = session.query(Video)
        if language:
            query = query.filter(Video.language == language)
        videos = query.order_by(Video.name).all()

        rows = []
        for v in videos:
            row = {
                "video_name": v.name,
                "speaker": v.speaker_name,
                "language": v.language,
                "duration_s": v.duration_s,
                "source": v.source,
            }

            af = session.query(AudioFeatures).filter_by(video_id=v.id).first()
            if af:
                row["avg_pitch"] = af.avg_pitch
                row["avg_volume"] = af.avg_volume
                row["avg_tempo"] = af.avg_tempo

            p = session.query(Prosody).filter_by(video_id=v.id).first()
            if p:
                row["f0_mean"] = p.f0_mean
                row["f0_stddev"] = p.f0_stddev
                row["jitter_mean"] = p.jitter_mean
                row["shimmer_mean"] = p.shimmer_mean
                row["hnr_mean"] = p.hnr_mean
                row["loudness_mean"] = p.loudness_mean

            pf = session.query(PausesFillers).filter_by(video_id=v.id).first()
            if pf:
                row["total_pauses"] = pf.total_pauses
                row["total_fillers"] = pf.total_fillers
                row["avg_speech_rate_wpm"] = pf.avg_speech_rate_wpm
                row["filler_rate_per_min"] = pf.filler_rate_per_min
                row["total_words"] = pf.total_words

            fe = session.query(FacialExpressions).filter_by(video_id=v.id).first()
            if fe:
                row["dominant_emotion"] = fe.dominant_emotion
                row["happiness_mean"] = fe.happiness_mean
                row["anger_mean"] = fe.anger_mean
                row["neutral_mean"] = fe.neutral_mean
                row["au06_smile"] = fe.au06_mean
                row["au12_smile"] = fe.au12_mean

            ve = session.query(VisualEmbedding).filter_by(video_id=v.id).first()
            if ve:
                row["visual_variability"] = ve.visual_variability

            sent = session.query(Sentiment).filter_by(video_id=v.id).first()
            if sent:
                row["sentiment_avg_compound"] = sent.avg_compound
                row["sentiment_variability"] = sent.sentiment_variability

            row["gesture_count"] = session.query(GestureSegment).filter_by(video_id=v.id).count()

            rows.append(row)

        suffix = f"_{language}" if language else ""
        if format == "csv":
            return _stream_csv(rows, f"corpus_descriptives{suffix}.csv")
        return _stream_json(rows, f"corpus_descriptives{suffix}.json")

    finally:
        session.close()


# ---------------------------------------------------------------------------
# 3. Time-aligned multimodal streams — synchronized time series
# ---------------------------------------------------------------------------

@router.get("/time_aligned")
def export_time_aligned(
    video_name: str,
    modalities: str = Query(
        "audio,prosody",
        description="Comma-separated: audio,prosody,facial,transcript",
    ),
):
    """Export time-aligned multimodal data for a single video.

    Returns long-format CSV: time_s, modality, feature, value.
    Suitable for temporal alignment plots (prosody + gesture + emotion
    over time) and replication packages.
    """
    session = _get_db_session()
    if session is None:
        return JSONResponse(content={"message": "Database not available"}, status_code=503)

    try:
        video = session.query(Video).filter_by(name=video_name).first()
        if video is None:
            return JSONResponse(content={"message": "Video not found"}, status_code=404)

        mods = [m.strip() for m in modalities.split(",")]
        rows = []

        if "audio" in mods:
            af = session.query(AudioFeatures).filter_by(video_id=video.id).first()
            if af and af.time:
                for i, t in enumerate(af.time):
                    if af.pitch and i < len(af.pitch):
                        rows.append({"time_s": t, "modality": "audio", "feature": "pitch", "value": af.pitch[i]})
                    if af.volume and i < len(af.volume):
                        rows.append({"time_s": t, "modality": "audio", "feature": "volume", "value": af.volume[i]})
                    if af.tempo and i < len(af.tempo):
                        rows.append({"time_s": t, "modality": "audio", "feature": "tempo", "value": af.tempo[i]})

        if "prosody" in mods:
            p = session.query(Prosody).filter_by(video_id=video.id).first()
            if p and p.time and p.contours:
                for feature_name, values in p.contours.items():
                    short_name = feature_name.replace("_sma3nz", "")
                    for i, t in enumerate(p.time):
                        if i < len(values):
                            rows.append({"time_s": t, "modality": "prosody", "feature": short_name, "value": values[i]})

        if "facial" in mods:
            fe = session.query(FacialExpressions).filter_by(video_id=video.id).first()
            if fe and fe.frames and fe.emotions:
                fps = 30.0
                if video.duration_s and fe.total_frames_analysed:
                    fps = fe.total_frames_analysed / video.duration_s
                for emotion_name, values in fe.emotions.items():
                    for i, frame_idx in enumerate(fe.frames):
                        if i < len(values):
                            t = frame_idx / fps
                            rows.append({"time_s": round(t, 3), "modality": "facial", "feature": emotion_name, "value": values[i]})

        if "transcript" in mods:
            segments = (
                session.query(TranscriptSegment)
                .filter_by(video_id=video.id)
                .order_by(TranscriptSegment.start_s)
                .all()
            )
            for s in segments:
                rows.append({"time_s": s.start_s, "modality": "transcript", "feature": "text", "value": s.text})

        if not rows:
            return JSONResponse(content={"message": "No time-series data found"}, status_code=404)

        rows.sort(key=lambda r: (r["time_s"], r["modality"]))
        return _stream_csv(rows, f"{video_name}_time_aligned.csv")

    finally:
        session.close()


# ---------------------------------------------------------------------------
# 4. Embeddings — for downstream ML tasks
# ---------------------------------------------------------------------------

@router.get("/embeddings")
def export_embeddings(
    format: str = Query("json", pattern="^(json|npy)$"),
):
    """Export visual embeddings matrix for all videos.

    Returns N x 384 embedding matrix (DINOv2 ViT mean embeddings) plus
    video names. Suitable for similarity analysis, clustering, and
    dimensionality reduction in downstream research.

    Formats:
    - json: {names: [...], embeddings: [[...], ...], variability: [...]}
    - npy: NumPy .npy binary (384-dim float32 per video)
    """
    session = _get_db_session()
    if session is None:
        return JSONResponse(content={"message": "Database not available"}, status_code=503)

    try:
        results = (
            session.query(Video.name, VisualEmbedding)
            .join(VisualEmbedding)
            .order_by(Video.name)
            .all()
        )

        if not results:
            return JSONResponse(content={"message": "No embeddings found"}, status_code=404)

        names = []
        embeddings = []
        variabilities = []

        for name, ve in results:
            if ve.mean_embedding is None:
                continue
            emb = np.frombuffer(ve.mean_embedding, dtype=np.float32).tolist()
            names.append(name)
            embeddings.append(emb)
            variabilities.append(ve.visual_variability)

        if format == "npy":
            buf = io.BytesIO()
            np.save(buf, np.array(embeddings, dtype=np.float32))
            buf.seek(0)
            return StreamingResponse(
                buf,
                media_type="application/octet-stream",
                headers={"Content-Disposition": 'attachment; filename="embeddings.npy"'},
            )

        return _stream_json(
            {"names": names, "embeddings": embeddings, "variability": variabilities},
            "embeddings.json",
        )

    finally:
        session.close()


# ---------------------------------------------------------------------------
# 5. Provenance metadata — FAIR compliance
# ---------------------------------------------------------------------------

@router.get("/provenance")
def export_provenance():
    """Export full FAIR provenance metadata.

    Includes corpus metadata (Dublin Core), processing log for every video,
    and tool versions. Suitable for grant reporting, data archiving
    (DANS/Zenodo), and reproducibility documentation.
    """
    session = _get_db_session()
    if session is None:
        return JSONResponse(content={"message": "Database not available"}, status_code=503)

    try:
        corpus = session.query(CorpusMetadata).first()
        corpus_meta = {}
        if corpus:
            corpus_meta = {
                "schema_version": corpus.schema_version,
                "dc:title": corpus.dc_title,
                "dc:creator": corpus.dc_creator,
                "dc:subject": corpus.dc_subject,
                "dc:description": corpus.dc_description,
                "dc:publisher": corpus.dc_publisher,
                "dc:date": corpus.dc_date,
                "dc:type": corpus.dc_type,
                "dc:format": corpus.dc_format,
                "dc:identifier": corpus.dc_identifier,
                "dc:source": corpus.dc_source,
                "dc:language": corpus.dc_language,
                "dc:rights": corpus.dc_rights,
                "pipeline_version": corpus.pipeline_version,
                "tool_versions": corpus.tool_versions,
            }

        logs = (
            session.query(ProcessingLog, Video.name)
            .join(Video)
            .order_by(Video.name, ProcessingLog.module)
            .all()
        )

        processing_records = []
        for log, video_name in logs:
            processing_records.append({
                "video": video_name,
                "module": log.module,
                "tool": log.tool_name,
                "tool_version": log.tool_version,
                "parameters": log.parameters,
                "completed_at": str(log.completed_at) if log.completed_at else None,
                "success": log.success,
            })

        result = {
            "corpus_metadata": corpus_meta,
            "processing_log": processing_records,
            "video_count": session.query(Video).count(),
            "modules_available": sorted({r["module"] for r in processing_records}),
        }

        return _stream_json(result, "provenance.json")

    finally:
        session.close()


# ---------------------------------------------------------------------------
# 6. Filtered subset — query-based corpus slicing
# ---------------------------------------------------------------------------

@router.get("/filtered_subset")
def export_filtered_subset(
    format: str = Query("csv", pattern="^(json|csv)$"),
    language: Optional[str] = Query(None, description="ISO 639-1 code (en, es, de, ar)"),
    min_speech_rate: Optional[float] = Query(None, description="Minimum avg WPM"),
    max_speech_rate: Optional[float] = Query(None, description="Maximum avg WPM"),
    min_happiness: Optional[float] = Query(None, description="Minimum happiness mean"),
    min_filler_rate: Optional[float] = Query(None, description="Minimum filler rate/min"),
    max_filler_rate: Optional[float] = Query(None, description="Maximum filler rate/min"),
    dominant_emotion: Optional[str] = Query(None, description="Filter by dominant emotion"),
    min_duration: Optional[float] = Query(None, description="Minimum video duration (s)"),
    max_duration: Optional[float] = Query(None, description="Maximum video duration (s)"),
):
    """Export a filtered subset of the corpus matching query criteria.

    Enables researchers to build custom datasets for specific research designs.
    E.g., "all English talks where speech rate > 150 WPM and happiness > 0.5"

    Returns the same columns as /corpus_descriptives but filtered.
    """
    session = _get_db_session()
    if session is None:
        return JSONResponse(content={"message": "Database not available"}, status_code=503)

    try:
        query = session.query(Video)
        if language:
            query = query.filter(Video.language == language)
        if min_duration is not None:
            query = query.filter(Video.duration_s >= min_duration)
        if max_duration is not None:
            query = query.filter(Video.duration_s <= max_duration)

        videos = query.order_by(Video.name).all()

        rows = []
        for v in videos:
            pf = session.query(PausesFillers).filter_by(video_id=v.id).first()
            if min_speech_rate is not None:
                if not pf or pf.avg_speech_rate_wpm is None or pf.avg_speech_rate_wpm < min_speech_rate:
                    continue
            if max_speech_rate is not None:
                if not pf or pf.avg_speech_rate_wpm is None or pf.avg_speech_rate_wpm > max_speech_rate:
                    continue
            if min_filler_rate is not None:
                if not pf or pf.filler_rate_per_min is None or pf.filler_rate_per_min < min_filler_rate:
                    continue
            if max_filler_rate is not None:
                if not pf or pf.filler_rate_per_min is None or pf.filler_rate_per_min > max_filler_rate:
                    continue

            fe = session.query(FacialExpressions).filter_by(video_id=v.id).first()
            if min_happiness is not None:
                if not fe or fe.happiness_mean is None or fe.happiness_mean < min_happiness:
                    continue
            if dominant_emotion is not None:
                if not fe or fe.dominant_emotion != dominant_emotion:
                    continue

            row = {
                "video_name": v.name,
                "speaker": v.speaker_name,
                "language": v.language,
                "duration_s": v.duration_s,
            }

            p = session.query(Prosody).filter_by(video_id=v.id).first()
            if p:
                row["f0_mean"] = p.f0_mean
                row["loudness_mean"] = p.loudness_mean

            if pf:
                row["avg_speech_rate_wpm"] = pf.avg_speech_rate_wpm
                row["filler_rate_per_min"] = pf.filler_rate_per_min
                row["total_words"] = pf.total_words

            if fe:
                row["dominant_emotion"] = fe.dominant_emotion
                row["happiness_mean"] = fe.happiness_mean

            sent = session.query(Sentiment).filter_by(video_id=v.id).first()
            if sent:
                row["sentiment_avg_compound"] = sent.avg_compound

            rows.append(row)

        if format == "csv":
            return _stream_csv(rows, "filtered_subset.csv")
        return _stream_json(rows, "filtered_subset.json")

    finally:
        session.close()


# ---------------------------------------------------------------------------
# Legacy endpoints (backwards-compatible with existing frontend)
# ---------------------------------------------------------------------------

@router.get("/video_data")
def export_video_data(
    video_name: str,
    format: str = Query("json", pattern="^(json|csv)$"),
):
    """Legacy: export raw JSON analysis files for a single video."""
    import os
    video_folder = os.path.join(MATERIALS_FOLDER, video_name)
    if not os.path.isdir(video_folder):
        return JSONResponse(content={"message": "Video not found"}, status_code=404)

    data = {"video_name": video_name}
    for key, filename in {
        "audio_features": f"{video_name}_audio_features.json",
        "prosody": f"{video_name}_prosody.json",
        "pauses_fillers": f"{video_name}_pauses_fillers.json",
        "facial_expressions": f"{video_name}_facial_expressions.json",
        "visual_embeddings": f"{video_name}_visual_embeddings.json",
    }.items():
        filepath = os.path.join(video_folder, filename)
        if os.path.exists(filepath):
            with open(filepath) as f:
                data[key] = json.load(f)

    if format == "json":
        return _stream_json(data, f"{video_name}_export.json")

    flat = {"video_name": video_name}
    af = data.get("audio_features", {})
    flat["duration_s"] = af.get("duration")
    flat["sample_rate"] = af.get("sample_rate")
    pf = data.get("pauses_fillers", {}).get("summary", {})
    for k, v in pf.items():
        if isinstance(v, (int, float)):
            flat[k] = v
    return _stream_csv([flat], f"{video_name}_export.csv")


@router.get("/corpus_summary")
def export_corpus_summary(
    format: str = Query("json", pattern="^(json|csv)$"),
):
    """Legacy: export corpus summary from JSON files on disk."""
    import glob as _glob
    import os

    video_folders = sorted(
        d for d in _glob.glob(os.path.join(MATERIALS_FOLDER, "*"))
        if os.path.isdir(d)
    )

    rows = []
    for folder in video_folders:
        name = os.path.basename(folder)
        row = {"video_name": name}

        af_path = os.path.join(folder, f"{name}_audio_features.json")
        if os.path.exists(af_path):
            with open(af_path) as f:
                af = json.load(f)
            row["duration_s"] = af.get("duration", 0)

        p_path = os.path.join(folder, f"{name}_prosody.json")
        if os.path.exists(p_path):
            with open(p_path) as f:
                prosody = json.load(f)
            funcs = prosody.get("functionals", {})
            row["f0_mean"] = funcs.get("F0semitoneFrom27.5Hz_sma3nz_amean", 0)
            row["loudness_mean"] = funcs.get("loudness_sma3nz_amean", 0)

        pf_path = os.path.join(folder, f"{name}_pauses_fillers.json")
        if os.path.exists(pf_path):
            with open(pf_path) as f:
                pf = json.load(f)
            summary = pf.get("summary", {})
            row["total_pauses"] = summary.get("total_pauses", 0)
            row["avg_speech_rate_wpm"] = summary.get("avg_speech_rate_wpm", 0)
            row["filler_rate_per_min"] = summary.get("filler_rate_per_minute", 0)

        rows.append(row)

    if format == "csv":
        return _stream_csv(rows, "corpus_summary.csv")
    return _stream_json(rows, "corpus_summary.json")
