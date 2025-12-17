from huggingface_hub import login
import json
import numpy as np
from transformers import AutoImageProcessor, AutoModel
import torch

import matplotlib.pyplot as plt
from PIL import Image
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from scipy.spatial import Voronoi
import pandas as pd
import os
import glob




login()




def extract_embeddings(image_folder, processor, model):
    embeddings = []
    filenames = []
    device = model.device
    images = glob.glob(os.path.join(image_folder, "*.png"))

    for img_path in images:
        try:
            img = Image.open(img_path).convert('RGB')
            inputs = processor(images=img, return_tensors="pt").to(device, dtype=torch.float32)
            with torch.no_grad():
                outputs = model(**inputs)
            cls_token_embedding = outputs.last_hidden_state[:, 0, :].squeeze().cpu().numpy()
            embeddings.append(cls_token_embedding)
            filenames.append(os.path.basename(img_path))
        except Exception as e:
            print(f"Could not get embedding for image: {e}")
            continue

    embeddings = np.array(embeddings)
    print(f"Extracted embeddings with shape: {embeddings.shape}")
    return embeddings, filenames

def reduce_for_viz(embeddings, n_components=2):
    """
    Reduce embeddings to 2D for visualization.
    """
    pca = PCA(n_components=n_components, random_state=42)
    reduced = pca.fit_transform(embeddings)
    return reduced

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


def main():
    IMAGE_FOLDER = "spectograms"

    pretrained_model_name = "facebook/dinov3-vits16-pretrain-lvd1689m"
    processor = AutoImageProcessor.from_pretrained(pretrained_model_name)
    model = AutoModel.from_pretrained(
        pretrained_model_name,
        device_map="auto",
        torch_dtype=torch.float32 # Changed dtype to float32
        )

    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model.to(device)

    embeddings, filenames = extract_embeddings(IMAGE_FOLDER, processor, model)
    coords_2d = reduce_for_viz(embeddings, n_components=2)

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

    data_to_save = {
        'coords_2d': coords_2d_list,
        'filenames': filenames, # filenames is already a list of strings
        'labels': labels_list,
        'regions_by_label': regions_by_label_serializable
    }

    with open('spectrogram_voronoi_data.json', 'w') as f:
        json.dump(data_to_save, f, indent=4)