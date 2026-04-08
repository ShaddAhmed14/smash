"""Prosody feature extraction using openSMILE (eGeMAPS feature set).

Extracts per-video and cross-corpus prosody features:
- F0 (fundamental frequency) statistics
- Jitter and shimmer (voice quality)
- HNR (harmonics-to-noise ratio)
- Loudness contour
- Spectral features (alpha ratio, Hammarberg index)

Outputs:
- Per-video: {video_name}_prosody.json  (frame-level + summary stats)
- Cross-corpus: average_prosody_features.json
"""

import glob
import json
import logging
import os

import numpy as np
import opensmile

logger = logging.getLogger(__name__)

# eGeMAPS gives 88 features at frame level (LLDs) — the gold standard
# for computational paralinguistics and speech emotion recognition.
SMILE = opensmile.Smile(
    feature_set=opensmile.FeatureSet.eGeMAPSv02,
    feature_level=opensmile.FeatureLevel.LowLevelDescriptors,
)

# Functionals (summary stats per file) — useful for cross-video comparison
SMILE_FUNC = opensmile.Smile(
    feature_set=opensmile.FeatureSet.eGeMAPSv02,
    feature_level=opensmile.FeatureLevel.Functionals,
)

# Key features we surface in the UI
KEY_FEATURES = [
    "F0semitoneFrom27.5Hz_sma3nz",
    "jitterLocal_sma3nz",
    "shimmerLocaldB_sma3nz",
    "HNRdBACF_sma3nz",
    "loudness_sma3nz",
    "alphaRatioV_sma3nz",
    "hammarbergIndexV_sma3nz",
    "spectralFlux_sma3nz",
    "mfcc1_sma3nz",
    "mfcc2_sma3nz",
    "mfcc3_sma3nz",
    "mfcc4_sma3nz",
]


def extract_prosody(audio_path: str) -> None:
    """Extract prosody features from a single audio file."""
    output_path = audio_path.replace("audio.wav", "prosody.json")
    if os.path.exists(output_path):
        return

    logger.info(f"Extracting prosody features from {audio_path}")

    # Frame-level (LLD) features
    lld_df = SMILE.process_file(audio_path)
    # Reset multi-index (start, end) to simple numeric index
    lld_df = lld_df.reset_index()

    # Convert timestamps to seconds
    times = lld_df["end"].dt.total_seconds().tolist()

    # Extract key feature contours
    contours = {}
    for feat in KEY_FEATURES:
        if feat in lld_df.columns:
            values = lld_df[feat].tolist()
            # Replace NaN with 0 for JSON serialization
            contours[feat] = [0.0 if np.isnan(v) else float(v) for v in values]

    # Summary statistics (functionals)
    func_df = SMILE_FUNC.process_file(audio_path)
    func_dict = {}
    for col in func_df.columns:
        val = func_df[col].iloc[0]
        func_dict[col] = 0.0 if np.isnan(val) else float(val)

    result = {
        "time": times,
        "contours": contours,
        "functionals": func_dict,
    }

    with open(output_path, "w") as f:
        json.dump(result, f)

    logger.info(f"Saved prosody features to {output_path}")


def compute_average_prosody(materials_folder: str) -> None:
    """Compute cross-corpus average prosody features."""
    output_path = os.path.join(materials_folder, "average_prosody_features.json")
    if os.path.exists(output_path):
        return

    logger.info("Computing average prosody features across all videos")

    prosody_files = glob.glob(
        os.path.join(materials_folder, "*", "*_prosody.json")
    )

    if not prosody_files:
        logger.warning("No prosody files found, skipping average computation")
        return

    titles = []
    all_functionals: list[dict] = []

    for filepath in prosody_files:
        with open(filepath, "r") as f:
            data = json.load(f)

        title = os.path.basename(filepath).replace("_prosody.json", "")
        titles.append(title)
        all_functionals.append(data["functionals"])

    # Build per-feature averages for key features
    summary = {"titles": titles}
    for feat in KEY_FEATURES:
        # Find matching functional keys (openSMILE appends _mean, _stddev, etc.)
        mean_key = f"{feat}_amean"
        if mean_key in all_functionals[0]:
            summary[f"avg_{feat}"] = [
                f.get(mean_key, 0.0) for f in all_functionals
            ]

    with open(output_path, "w") as f:
        json.dump(summary, f)

    logger.info(f"Saved average prosody features to {output_path}")


def setup_prosody_analysis(materials_folder: str = "/materials") -> None:
    """Run prosody extraction for all videos in the materials folder."""
    audio_files = glob.glob(
        os.path.join(materials_folder, "*", "*_audio.wav")
    )

    for audio_path in audio_files:
        extract_prosody(audio_path)

    compute_average_prosody(materials_folder)
