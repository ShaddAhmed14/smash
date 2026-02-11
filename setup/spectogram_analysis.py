import json
import os
import glob
import logging
import torch
import numpy as np
from huggingface_hub import login
from PIL import Image
from transformers import AutoImageProcessor, AutoModel
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from scipy.spatial import Voronoi

login(os.getenv("HUGGINGFACE_API_KEY"))

def extract_embeddings(spectograms_list, processor, model):
    embeddings = []
    filenames = []

    for img_path in spectograms_list:
        try:
            img = Image.open(img_path).convert('RGB')
            inputs = processor(images=img, return_tensors="pt").to(model.device, dtype=torch.float32)
            with torch.no_grad():
                outputs = model(**inputs)
            cls_token_embedding = outputs.last_hidden_state[:, 0, :].squeeze().cpu().numpy()
            embeddings.append(cls_token_embedding)
            filenames.append(os.path.basename(img_path))
        except Exception as e:
            logging.error(f"Could not get embedding for image: {e}")
            continue

    embeddings = np.array(embeddings)
    return embeddings, filenames

def get_voronoi_regions(vor, labels):
    regions_by_label = {}
    for point_idx, region_idx in enumerate(vor.point_region):
        region = vor.regions[region_idx]
        if not region or -1 in region:
            continue

        label = labels[point_idx]
        polygon = [vor.vertices[i] for i in region]

        if label not in regions_by_label:
            regions_by_label[label] = []
        regions_by_label[label].append((point_idx, polygon))

    return regions_by_label

def setup_spectogram_analysis():
    pretrained_model_name = "facebook/dinov3-vits16-pretrain-lvd1689m"
    processor = AutoImageProcessor.from_pretrained(pretrained_model_name)
    model = AutoModel.from_pretrained(
        pretrained_model_name,
        # torch_dtype=torch.float32 # Changed dtype to float32
        dtype=torch.float32 # Changed dtype to float32
        )
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model.to(device)

    spectograms_list = glob.glob(os.path.join("/materials", "*", "*.png"))

    embeddings, filenames = extract_embeddings(spectograms_list, processor, model)
    pca = PCA(n_components=2, random_state=42)
    coords_2d = pca.fit_transform(embeddings)

    kmeans = KMeans(n_clusters=5, random_state=42)
    vor = Voronoi(coords_2d)
    labels = kmeans.fit_predict(coords_2d)

    regions_by_label = get_voronoi_regions(vor, labels)

    # Convert numpy arrays to lists for JSON serialization
    coords_2d_list = coords_2d.tolist()
    labels_list = labels.tolist()

    # Convert Voronoi regions data to a JSON serializable format
    regions_by_label_serializable = {}
    for label, regions_list in regions_by_label.items():
        # Ensure label is serializable (e.g., int)
        serializable_label = int(label) if isinstance(label, np.integer) else label
        regions_by_label_serializable[serializable_label] = []
        for point_idx, polygon in regions_list:
            # Convert point_idx to int
            serializable_point_idx = int(point_idx) if isinstance(point_idx, np.integer) else point_idx
            # Convert polygon (list of numpy arrays) to list of lists
            serializable_polygon = [v.tolist() for v in polygon]
            regions_by_label_serializable[serializable_label].append((serializable_point_idx, serializable_polygon))

    logging.info("Saving spectrogram Voronoi data to JSON...")
    data_to_save = {
        'coords_2d': coords_2d_list,
        'filenames': filenames, # filenames is already a list of strings
        'labels': labels_list,
        'regions_by_label': regions_by_label_serializable
    }

    with open('/materials/spectrogram_voronoi_data.json', 'w') as f:
        json.dump(data_to_save, f, indent=4)