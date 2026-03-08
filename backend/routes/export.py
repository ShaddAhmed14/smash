"""Data export routes — download analysis results as CSV or JSON.

Supports exporting:
- Audio features (pitch, volume, tempo)
- Prosody features (openSMILE eGeMAPS)
- Pauses and fillers
- Transcript text
- Kinematic features (gesture analysis)

All exports are per-video, with a bulk export option for cross-corpus data.
"""

import csv
import io
import json
import logging
import os

import glob
from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse, StreamingResponse

from config import MATERIALS_FOLDER

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/export", tags=["export"])


@router.get("/video_data")
def export_video_data(
    video_name: str,
    format: str = Query("json", regex="^(json|csv)$"),
):
    """Export all analysis data for a single video."""
    video_folder = os.path.join(MATERIALS_FOLDER, video_name)
    if not os.path.isdir(video_folder):
        return JSONResponse(content={"message": "Video not found"}, status_code=404)

    data = {"video_name": video_name}

    # Collect all available JSON analysis files
    analysis_files = {
        "audio_features": f"{video_name}_audio_features.json",
        "prosody": f"{video_name}_prosody.json",
        "pauses_fillers": f"{video_name}_pauses_fillers.json",
    }

    for key, filename in analysis_files.items():
        filepath = os.path.join(video_folder, filename)
        if os.path.exists(filepath):
            with open(filepath, "r") as f:
                data[key] = json.load(f)

    if format == "json":
        content = json.dumps(data, indent=2)
        return StreamingResponse(
            io.BytesIO(content.encode()),
            media_type="application/json",
            headers={
                "Content-Disposition": f'attachment; filename="{video_name}_export.json"'
            },
        )

    # CSV: flatten key metrics into rows
    return _export_csv_summary(video_name, data)


@router.get("/corpus_summary")
def export_corpus_summary(
    format: str = Query("json", regex="^(json|csv)$"),
):
    """Export summary statistics for all videos in the corpus."""
    video_folders = [
        d for d in glob.glob(os.path.join(MATERIALS_FOLDER, "*"))
        if os.path.isdir(d)
    ]

    rows = []
    for folder in sorted(video_folders):
        name = os.path.basename(folder)
        row = {"video_name": name}

        # Audio features summary
        af_path = os.path.join(folder, f"{name}_audio_features.json")
        if os.path.exists(af_path):
            with open(af_path, "r") as f:
                af = json.load(f)
            row["duration_s"] = af.get("duration", 0)
            row["sample_rate"] = af.get("sample_rate", 0)

        # Prosody summary
        p_path = os.path.join(folder, f"{name}_prosody.json")
        if os.path.exists(p_path):
            with open(p_path, "r") as f:
                prosody = json.load(f)
            funcs = prosody.get("functionals", {})
            row["f0_mean"] = funcs.get("F0semitoneFrom27.5Hz_sma3nz_amean", 0)
            row["loudness_mean"] = funcs.get("loudness_sma3nz_amean", 0)
            row["jitter_mean"] = funcs.get("jitterLocal_sma3nz_amean", 0)
            row["shimmer_mean"] = funcs.get("shimmerLocaldB_sma3nz_amean", 0)
            row["hnr_mean"] = funcs.get("HNRdBACF_sma3nz_amean", 0)

        # Pauses/fillers summary
        pf_path = os.path.join(folder, f"{name}_pauses_fillers.json")
        if os.path.exists(pf_path):
            with open(pf_path, "r") as f:
                pf = json.load(f)
            summary = pf.get("summary", {})
            row["total_pauses"] = summary.get("total_pauses", 0)
            row["total_fillers"] = summary.get("total_fillers", 0)
            row["avg_speech_rate_wpm"] = summary.get("avg_speech_rate_wpm", 0)
            row["filler_rate_per_min"] = summary.get("filler_rate_per_minute", 0)
            row["total_words"] = summary.get("total_words", 0)

        rows.append(row)

    if format == "json":
        content = json.dumps(rows, indent=2)
        return StreamingResponse(
            io.BytesIO(content.encode()),
            media_type="application/json",
            headers={
                "Content-Disposition": 'attachment; filename="corpus_summary.json"'
            },
        )

    # CSV export
    if not rows:
        return JSONResponse(content={"message": "No data found"}, status_code=404)

    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=rows[0].keys())
    writer.writeheader()
    writer.writerows(rows)

    return StreamingResponse(
        io.BytesIO(output.getvalue().encode()),
        media_type="text/csv",
        headers={
            "Content-Disposition": 'attachment; filename="corpus_summary.csv"'
        },
    )


def _export_csv_summary(video_name: str, data: dict) -> StreamingResponse:
    """Flatten a single video's data into a CSV summary."""
    rows = []

    # Audio features time series
    af = data.get("audio_features", {})
    times = af.get("time", [])
    for i, t in enumerate(times):
        rows.append({
            "time": t,
            "pitch": af.get("pitch", [0] * len(times))[i] if i < len(af.get("pitch", [])) else 0,
            "volume": af.get("volume", [0] * len(times))[i] if i < len(af.get("volume", [])) else 0,
            "tempo": af.get("tempo", [0] * len(times))[i] if i < len(af.get("tempo", [])) else 0,
        })

    if not rows:
        rows = [{"video_name": video_name, "note": "no time-series data available"}]

    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=rows[0].keys())
    writer.writeheader()
    writer.writerows(rows)

    return StreamingResponse(
        io.BytesIO(output.getvalue().encode()),
        media_type="text/csv",
        headers={
            "Content-Disposition": f'attachment; filename="{video_name}_export.csv"'
        },
    )
