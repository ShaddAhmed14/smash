"""Visual embedding analysis using DINOv2 ViT.

Extracts visual embeddings from sampled video frames using the same DINOv2
model already used for spectrogram analysis. Enables cross-video visual
similarity comparison (speaker posture, gesture style, visual context).

Approach:
1. Sample N keyframes uniformly from each video
2. Extract CLS token embeddings via DINOv2 ViT-S/16
3. Compute per-video mean embedding (visual "fingerprint")
4. PCA + clustering across all videos for visual similarity map

Outputs:
- Per-video: {video_name}_visual_embeddings.json (frame embeddings + mean)
- Cross-corpus: visual_similarity_map.json (2D coords, clusters, Voronoi)
"""

import glob
import json
import logging
import os

import cv2
import numpy as np
import torch
from PIL import Image

logger = logging.getLogger(__name__)

# Number of frames to sample per video
N_KEYFRAMES = 20

# Same model as spectogram_analysis.py — reuses cached weights, no extra download
PRETRAINED_MODEL = "facebook/dinov3-vits16-pretrain-lvd1689m"


def _load_model():
    """Load DINOv2 ViT model and processor."""
    from transformers import AutoImageProcessor, AutoModel

    processor = AutoImageProcessor.from_pretrained(PRETRAINED_MODEL)
    model = AutoModel.from_pretrained(PRETRAINED_MODEL, dtype=torch.float32)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model.to(device)
    model.eval()
    return processor, model


def _sample_frames(video_path: str, n_frames: int = N_KEYFRAMES) -> list[np.ndarray]:
    """Sample N frames uniformly from a video."""
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        logger.warning(f"Cannot open video: {video_path}")
        return []

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    if total_frames <= 0:
        cap.release()
        return []

    # Skip first and last 5% (intros/outros)
    start = int(total_frames * 0.05)
    end = int(total_frames * 0.95)
    indices = np.linspace(start, end, n_frames, dtype=int)

    frames = []
    for idx in indices:
        cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
        ret, frame = cap.read()
        if ret:
            # Convert BGR to RGB
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            frames.append(frame_rgb)

    cap.release()
    return frames


def _extract_embeddings(
    frames: list[np.ndarray],
    processor,
    model,
) -> np.ndarray:
    """Extract CLS token embeddings from frames."""
    embeddings = []
    device = next(model.parameters()).device

    for frame in frames:
        img = Image.fromarray(frame)
        inputs = processor(images=img, return_tensors="pt").to(device, dtype=torch.float32)
        with torch.no_grad():
            outputs = model(**inputs)
        cls_embedding = outputs.last_hidden_state[:, 0, :].squeeze().cpu().numpy()
        embeddings.append(cls_embedding)

    return np.array(embeddings)


def extract_visual_embeddings(video_path: str, output_dir: str, processor, model) -> dict | None:
    """Extract visual embeddings for a single video.

    Returns the mean embedding for cross-corpus analysis, or None if failed.
    """
    base_name = os.path.basename(output_dir)
    output_path = os.path.join(output_dir, f"{base_name}_visual_embeddings.json")
    if os.path.exists(output_path):
        # Load and return the mean embedding for cross-corpus step
        with open(output_path, "r") as f:
            data = json.load(f)
        return {
            "title": base_name,
            "mean_embedding": data.get("mean_embedding", []),
        }

    if not os.path.exists(video_path):
        logger.warning(f"Video not found: {video_path}")
        return None

    logger.info(f"Extracting visual embeddings from {video_path}")

    frames = _sample_frames(video_path)
    if not frames:
        logger.warning(f"No frames sampled from {video_path}")
        return None

    embeddings = _extract_embeddings(frames, processor, model)
    if len(embeddings) == 0:
        return None

    mean_embedding = np.mean(embeddings, axis=0).tolist()

    # Compute per-frame statistics for temporal analysis
    # (how much does the visual scene change over the talk?)
    frame_norms = np.linalg.norm(embeddings - np.mean(embeddings, axis=0), axis=1)
    visual_variability = float(np.std(frame_norms))

    result = {
        "n_frames": len(frames),
        "embedding_dim": len(mean_embedding),
        "mean_embedding": mean_embedding,
        "visual_variability": round(visual_variability, 6),
        "frame_distances_from_mean": [round(float(d), 6) for d in frame_norms],
    }

    with open(output_path, "w") as f:
        json.dump(result, f)

    logger.info(f"Saved visual embeddings to {output_path}")

    return {"title": base_name, "mean_embedding": mean_embedding}


def compute_visual_similarity_map(
    video_embeddings: list[dict],
    materials_folder: str,
) -> None:
    """Compute 2D visual similarity map from mean embeddings."""
    output_path = os.path.join(materials_folder, "visual_similarity_map.json")
    if os.path.exists(output_path):
        return

    if len(video_embeddings) < 3:
        logger.warning("Need at least 3 videos for similarity map")
        return

    logger.info("Computing visual similarity map")

    from sklearn.cluster import KMeans
    from sklearn.decomposition import PCA
    from scipy.spatial import Voronoi

    titles = [v["title"] for v in video_embeddings]
    embeddings = np.array([v["mean_embedding"] for v in video_embeddings])

    # PCA to 2D
    n_components = min(2, len(embeddings))
    pca = PCA(n_components=n_components, random_state=42)
    coords_2d = pca.fit_transform(embeddings)

    # Cluster
    n_clusters = min(5, len(embeddings))
    kmeans = KMeans(n_clusters=n_clusters, random_state=42)
    labels = kmeans.fit_predict(coords_2d)

    # Voronoi regions (only if we have enough points)
    regions_data = {}
    if len(coords_2d) >= 4:
        try:
            vor = Voronoi(coords_2d)
            for point_idx, region_idx in enumerate(vor.point_region):
                region = vor.regions[region_idx]
                if not region or -1 in region:
                    continue
                label = int(labels[point_idx])
                polygon = [vor.vertices[i].tolist() for i in region]
                if label not in regions_data:
                    regions_data[label] = []
                regions_data[label].append((int(point_idx), polygon))
        except Exception as e:
            logger.warning(f"Voronoi computation failed: {e}")

    result = {
        "titles": titles,
        "coords_2d": coords_2d.tolist(),
        "labels": labels.tolist(),
        "explained_variance": pca.explained_variance_ratio_.tolist(),
        "regions_by_label": regions_data,
    }

    with open(output_path, "w") as f:
        json.dump(result, f)

    logger.info(f"Saved visual similarity map to {output_path}")


def setup_visual_embedding_analysis(materials_folder: str = "/materials") -> None:
    """Run visual embedding analysis for all videos."""
    video_folders = glob.glob(os.path.join(materials_folder, "*"))
    video_folders = [f for f in video_folders if os.path.isdir(f)]

    if not video_folders:
        logger.warning("No video folders found")
        return

    processor, model = _load_model()

    all_embeddings = []
    for folder in video_folders:
        base_name = os.path.basename(folder)
        video_path = os.path.join(folder, f"{base_name}_Original.mp4")
        result = extract_visual_embeddings(video_path, folder, processor, model)
        if result is not None:
            all_embeddings.append(result)

    compute_visual_similarity_map(all_embeddings, materials_folder)
