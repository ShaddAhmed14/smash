# SMASH

**Synthesis and Multimodal Analytics System for Humanities**

An open-source platform for understanding non-verbal communication — body language, facial expressions, and speech prosody. SMASH takes audiovisual recordings as input and produces a summary of multimodal communication characteristics, integrating gesture detection, posture analysis, voice tone tracking, and semantic analysis into a single accessible platform for researchers without programming experience.

Developed at the [Donders Institute for Brain, Cognition and Behaviour](https://www.ru.nl/donders), Radboud University, in partnership with [Hasso Plattner Institute](https://hpi.de). Funded by NWO.

---

## Modules

### Preview Module

Upload and preview audiovisual recordings. Automatic transcription, waveform visualization, and multi-model pose comparison.

![smash_preview_gif](https://github.com/user-attachments/assets/bfb08a1d-25da-467a-bbb8-a210aca1b1a5)

### Analysis Module

Cross-corpus visualizations for comparative analysis. Dynamic Time Warping, topic modeling, spectrogram embeddings, and DataMap overview.

![smash_analysis_gif](https://github.com/user-attachments/assets/891b9658-8ca9-4a4e-92b6-04b6baa14b82)

### Analytics Module

Deep per-talk analysis with temporal sentiment tracking, SpaCy NLP, semantic network graphs, and kinematic gesture features.

![smash_analytics_gif](https://github.com/user-attachments/assets/9bd0d9e4-b32c-4209-824f-ed2044b2fc54)

---

## Prerequisites

| Dependency | Version | Required for             |
|------------|---------|--------------------------|
| Node.js    | 18+     | Frontend                 |
| Python     | 3.11+   | Backend                  |
| FFmpeg     | any     | Audio extraction         |
| Docker     | any     | Docker setup (optional)  |

---

## Quick Start

### Option A: Docker Compose

```bash
git clone https://github.com/ShaddAhmed14/smash.git
cd smash

# Create and configure .env
cp .env.dist .env
# Edit .env — set MATERIALS_FOLDER and ENVISIONHGDETECTOR_OUTPUT paths

docker compose up --build
```

Frontend: `http://localhost:3070` | Backend: `http://localhost:1234`

### Option B: Local Development

**Backend:**

```bash
cd backend
python -m venv venv

# Activate virtual environment
source venv/bin/activate        # Linux/Mac
source venv/Scripts/activate    # Windows (Git Bash)

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:3000` | Backend: `http://localhost:8000`

> For local development, ensure `NEXT_PUBLIC_BACKEND_URL` in `frontend/.env.local` matches the backend port.

---

## Environment Variables

Create a `.env` file from the template:

```bash
cp .env.dist .env
```

| Variable | Description | Required |
| --- | --- | --- |
| `MATERIALS_FOLDER` | Path to prepared materials directory | Yes |
| `ENVISIONHGDETECTOR_OUTPUT` | Path to gesture detection output | Yes |
| `DATASET_FOLDER` | Path to raw video dataset (setup only) | Setup |
| `HUGGINGFACE_API_KEY` | HuggingFace token for spectrogram analysis | Setup |
| `FRONTEND_PORT` | Frontend port (default: 3070) | No |
| `BACKEND_PORT` | Backend port (default: 1234) | No |
| `NEXT_PUBLIC_BACKEND_URL` | Backend URL for frontend API calls | No |

---

## Materials Folder Structure

The `MATERIALS_FOLDER` path must point to a directory with this structure:

```text
materials/
├── metadata.json
├── video_distribution.json
├── topic_interdistance.json
├── temporal_sentiment_data.json
├── datamap_data.json
├── average_audio_features.json
├── max_audio_features.json
├── spectrogram_voronoi_data.json
├── kinematic_features.csv
├── gesture_visualization.csv
├── word_cloud.png
├── tfidf.json
├── sbert.json
│
└── {video_name}/
    ├── {video_name}_Original.mp4
    ├── {video_name}_audio.wav
    ├── {video_name}_transcript.srt
    ├── {video_name}_audio_features.json
    ├── {video_name}_peaks.json
    ├── {video_name}_waveform.json
    ├── {video_name}_spectrogram.png
    ├── {video_name}_kinematic_features.csv
    ├── thumbnails/
    │   ├── {video_name}_Original_thumbnail.jpg
    │   ├── {video_name}_YoloPose_thumbnail.jpg
    │   └── ...
    ├── processed/
    │   ├── {video_name}_YoloPose.mp4
    │   ├── {video_name}_MediaPipePose.mp4
    │   └── ...
    └── gesture_segments/
        └── {video_name}_tracked.mp4
```

Use `setup/prepare_materials.py` to generate this structure from raw video files.

---

## Tech Stack

**Frontend:** Next.js 15, React 19, Tailwind CSS v4, Plotly.js, Sigma.js, WaveSurfer.js

**Backend:** FastAPI, Whisper, SpaCy, librosa, pandas

**Processing:** EnvisionHGDetector, YoloPose, MediaPipe, OpenPose, Sentence-BERT, BERTopic, Dynamic Time Warping

---

## Project Structure

```text
smash/
├── frontend/          # Next.js application
│   ├── app/           # App router (layout, pages)
│   ├── pages/         # Module pages (LandingPage, AnalyticsModule, etc.)
│   └── components/    # React components per module
├── backend/           # FastAPI server
│   ├── main.py        # App entry point
│   ├── config.py      # Centralized path configuration
│   └── routes/        # API route handlers
│       ├── preview.py
│       ├── analysis.py
│       └── analytics.py
├── setup/             # Data preparation pipeline
│   └── prepare_materials.py
├── docs/              # GitHub Pages site
└── docker-compose.yml
```

---

## Team

- **Babajide Owoyele** — Project Member (Radboud University / Hasso Plattner Institute)
- **Gerard de Melo** — Project Member (Hasso Plattner Institute)
- **Wim Pouw** — Lead Applicant (Radboud University)
- **Shadd Ahmed** — Developer (Hasso Plattner Institute)

Grant obtained tripartitely by Babajide Owoyele, Gerard de Melo, and Wim Pouw. Project duration: December 2024 – December 2025.

---

## License

This project is developed at the Donders Institute for Brain, Cognition and Behaviour, Faculty of Social Sciences, Radboud University, Nijmegen.
