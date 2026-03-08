"""Facial expression analysis using py-feat.

Extracts per-video:
- Action Unit (AU) activations over time
- Emotion predictions (anger, disgust, fear, happiness, sadness, surprise, neutral)
- Face detection confidence and bounding boxes
- Summary statistics (dominant emotion, AU means, emotion distributions)

Replaces the originally planned EmoCo integration (ref [11] in application),
which has no available open-source code. py-feat (MIT license) provides
equivalent functionality with a cleaner API.

Outputs:
- Per-video: {video_name}_facial_expressions.json
- Cross-corpus: average_facial_expressions.json
"""

import glob
import json
import logging
import os

import numpy as np

logger = logging.getLogger(__name__)

# Emotion columns returned by py-feat
EMOTION_COLS = [
    "anger", "disgust", "fear", "happiness", "sadness", "surprise", "neutral"
]

# Key Action Units for communication research
# (subset — py-feat returns ~20 AUs, we surface the most interpretable ones)
KEY_AUS = [
    "AU01",  # Inner brow raiser
    "AU02",  # Outer brow raiser
    "AU04",  # Brow lowerer
    "AU05",  # Upper lid raiser
    "AU06",  # Cheek raiser (Duchenne smile)
    "AU07",  # Lid tightener
    "AU09",  # Nose wrinkler
    "AU10",  # Upper lip raiser
    "AU12",  # Lip corner puller (smile)
    "AU14",  # Dimpler
    "AU15",  # Lip corner depressor
    "AU17",  # Chin raiser
    "AU20",  # Lip stretcher
    "AU23",  # Lip tightener
    "AU25",  # Lips part
    "AU26",  # Jaw drop
]


def _init_detector():
    """Lazy-initialize py-feat Detector (heavy import, loads models)."""
    from feat import Detector
    return Detector()


def extract_facial_expressions(video_path: str, output_dir: str) -> None:
    """Extract facial expressions from a video file.

    Args:
        video_path: Path to the original video file.
        output_dir: Directory to write the output JSON.
    """
    base_name = os.path.basename(output_dir)
    output_path = os.path.join(output_dir, f"{base_name}_facial_expressions.json")
    if os.path.exists(output_path):
        return

    if not os.path.exists(video_path):
        logger.warning(f"Video not found: {video_path}")
        return

    logger.info(f"Extracting facial expressions from {video_path}")

    detector = _init_detector()

    # Process video — skip_frames=12 means ~2 FPS for a 24fps video,
    # balancing detail with processing time
    predictions = detector.detect(
        video_path,
        data_type="video",
        skip_frames=12,
        face_detection_threshold=0.9,
    )

    if predictions is None or len(predictions) == 0:
        logger.warning(f"No faces detected in {video_path}")
        result = {
            "frames": [],
            "emotions": {},
            "action_units": {},
            "summary": {"faces_detected": 0},
        }
        with open(output_path, "w") as f:
            json.dump(result, f)
        return

    # Extract frame numbers
    frames = predictions.index.get_level_values("frame").tolist()
    # Deduplicate (multiple faces per frame) — take first face per frame
    seen_frames = set()
    unique_indices = []
    for i, frame in enumerate(frames):
        if frame not in seen_frames:
            seen_frames.add(frame)
            unique_indices.append(i)

    # Emotion time series (first face per frame)
    emotions = {}
    for col in EMOTION_COLS:
        if col in predictions.columns:
            values = predictions[col].iloc[unique_indices].tolist()
            emotions[col] = [
                0.0 if (isinstance(v, float) and np.isnan(v)) else float(v)
                for v in values
            ]

    # Action Unit time series
    action_units = {}
    for au in KEY_AUS:
        matching_cols = [c for c in predictions.columns if au in c]
        if matching_cols:
            col = matching_cols[0]
            values = predictions[col].iloc[unique_indices].tolist()
            action_units[au] = [
                0.0 if (isinstance(v, float) and np.isnan(v)) else float(v)
                for v in values
            ]

    # Frame list (deduplicated)
    frame_list = [int(frames[i]) for i in unique_indices]

    # Summary statistics
    dominant_emotions = []
    for col in EMOTION_COLS:
        if col in emotions and emotions[col]:
            dominant_emotions.append((col, float(np.mean(emotions[col]))))
    dominant_emotions.sort(key=lambda x: x[1], reverse=True)

    au_means = {}
    for au, values in action_units.items():
        au_means[au] = round(float(np.mean(values)), 4)

    emotion_means = {}
    for emo, values in emotions.items():
        emotion_means[emo] = round(float(np.mean(values)), 4)

    result = {
        "frames": frame_list,
        "emotions": emotions,
        "action_units": action_units,
        "summary": {
            "faces_detected": len(seen_frames),
            "total_frames_analysed": len(frame_list),
            "dominant_emotion": dominant_emotions[0][0] if dominant_emotions else "unknown",
            "emotion_means": emotion_means,
            "au_means": au_means,
        },
    }

    with open(output_path, "w") as f:
        json.dump(result, f)

    logger.info(f"Saved facial expressions to {output_path}")


def compute_average_facial_expressions(materials_folder: str) -> None:
    """Compute cross-corpus average facial expression features."""
    output_path = os.path.join(materials_folder, "average_facial_expressions.json")
    if os.path.exists(output_path):
        return

    logger.info("Computing average facial expressions across all videos")

    expr_files = glob.glob(
        os.path.join(materials_folder, "*", "*_facial_expressions.json")
    )

    if not expr_files:
        logger.warning("No facial expression files found")
        return

    titles = []
    all_emotion_means: list[dict] = []
    all_au_means: list[dict] = []
    all_dominant: list[str] = []

    for filepath in expr_files:
        with open(filepath, "r") as f:
            data = json.load(f)

        title = os.path.basename(filepath).replace("_facial_expressions.json", "")
        summary = data.get("summary", {})

        if summary.get("faces_detected", 0) == 0:
            continue

        titles.append(title)
        all_emotion_means.append(summary.get("emotion_means", {}))
        all_au_means.append(summary.get("au_means", {}))
        all_dominant.append(summary.get("dominant_emotion", "unknown"))

    if not titles:
        logger.warning("No videos with detected faces found")
        return

    # Build per-emotion and per-AU averages
    summary = {"titles": titles, "dominant_emotions": all_dominant}

    for emo in EMOTION_COLS:
        summary[f"avg_{emo}"] = [
            em.get(emo, 0.0) for em in all_emotion_means
        ]

    for au in KEY_AUS:
        summary[f"avg_{au}"] = [
            am.get(au, 0.0) for am in all_au_means
        ]

    with open(output_path, "w") as f:
        json.dump(summary, f)

    logger.info(f"Saved average facial expressions to {output_path}")


def setup_facial_expression_analysis(materials_folder: str = "/materials") -> None:
    """Run facial expression analysis for all videos."""
    video_folders = glob.glob(os.path.join(materials_folder, "*"))
    video_folders = [f for f in video_folders if os.path.isdir(f)]

    for folder in video_folders:
        base_name = os.path.basename(folder)
        video_path = os.path.join(folder, f"{base_name}_Original.mp4")
        extract_facial_expressions(video_path, folder)

    compute_average_facial_expressions(materials_folder)
