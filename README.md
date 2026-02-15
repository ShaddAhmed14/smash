# SMASH - Synthesis and Multimodal Analytics System for Humanities

A full-stack web application for analyzing multimodal audiovisual data with synchronized audio, speech transcripts, and gesture tracking. Built for academic research at Radboud University's Donders Institute.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15.5.0-black)
![React](https://img.shields.io/badge/React-19.1.0-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-latest-green)

## About the Project

SMASH (Synthesis and Multimodal Analytics System for Humanities) is a collaborative project developed at Radboud University's Donders Institute. It aims to support humanities researchers in analyzing complex multimodal audiovisual data without requiring programming expertise.

### Vision

How can multimodal information be systematically analyzed? As research questions require more complex linguistic analyses, the type of data that needs to be analyzed also grows in complexity, becoming more multimodal. Simply relying on textual data is not sufficient, as many communicative aspects like prosody and gestures are better captured in audiovisual data. Yet, current practices (e.g., manual annotation or transcription) are impractical for handling large and increasing dataset sizes. With the evolution of deep-learning-based methods in video, audio, and language analysis, there are huge untapped possibilities for new kinds of multimodal research.

This project develops a **web application that wraps state-of-the-art deep-learning models** for analyzing video, audio, language, and gesture data. Key goals include:

- **Accessibility**: Enable humanities researchers to perform complex multimodal analyses without programming
- **Multi-output analysis**: Provide rich analytical outputs for video, audio, speech, and gesture data
- **Multi-input aggregation**: Support batch processing and corpus-level analyses across multiple recordings
- **Open science**: Fully open-source tools for reproducible research

### Project Team

- **Dr. Wim Pouw** - Project Lead, Donders Institute for Brain, Cognition and Behaviour
- **Babajide Owoyele** - Lead Developer
- **Sharjeel Shaikh** - Developer, Hasso Plattner Institute
- **Prof. Gerard de Melo** - HPC Deep Learning Lab, Hasso Plattner Institute

### Funding

This project is funded by the **Netherlands Organisation for Scientific Research (NWO)** under the Digital Humanities programme.

## Usage Guide

SMASH consists of three integrated modules that form a complete workflow for multimodal analysis:

### Step 1: Preview Module

The Preview Module is your starting point for exploring and preparing audiovisual data.

**What you can do:**
- **Browse your video library**: View all uploaded videos with metadata (speaker, language, duration, topics)
- **Preview videos**: Play videos with synchronized waveforms showing audio amplitude
- **View transcripts**: See auto-generated speech transcripts synced to video playback
- **Compare pose models**: Switch between different pose detection outputs (YoloPose, MediaPipe, OpenPose)
- **Navigate with waveforms**: Click on the audio waveform to jump to specific moments

**Getting started:**
1. Navigate to the Preview section from the landing page
2. Select a video from your library
3. Use the waveform panel to navigate and the transcript panel to follow along
4. Switch between pose detection models using the thumbnail selector

### Step 2: Analysis Module

The Analysis Module provides deep analytical visualizations for comparing and understanding your data.

**Available visualizations:**
- **DTW (Dynamic Time Warping)**: Compare gesture trajectories between two videos to find similar movement patterns
- **Video Distribution**: Interactive scatter plot showing how videos cluster by topics and features
- **Topic Interdistance**: Radar chart comparing audio features across different topics
- **Average Audio Features**: 3D visualization of pitch, volume, and tempo relationships
- **Voronoi Graph**: Spectrogram embedding clusters showing acoustic similarity
- **Data Map**: Topic modeling visualization for exploring thematic patterns

**Getting started:**
1. Navigate to the Analysis section
2. Select a visualization type from the available options
3. Choose videos to compare (for DTW) or explore corpus-wide patterns
4. Interact with visualizations by clicking, hovering, and zooming

### Step 3: Analytics Module

The Analytics Module provides detailed statistical analyses and exportable insights.

**Available analyses:**
- **Temporal Sentiment**: Track how sentiment evolves over the course of a recording
- **Kinematic Features**: Analyze gesture movement properties (velocity, acceleration, jerk)
- **Radial Graph**: Multi-dimensional comparison of audio features across recordings

**Getting started:**
1. Navigate to the Analytics section
2. Select videos or topics to analyze
3. Explore temporal patterns and statistical summaries
4. Export findings for publication or further analysis

## Features

### Preview Module

- Video playback with synchronized waveforms and transcripts
- Multiple pose detection model outputs (YoloPose, MediaPipe, OpenPose)
- Interactive timeline navigation
- Real-time subtitle display with auto-scrolling

### Analysis Module

- **DTW (Dynamic Time Warping)**: Compare gesture trajectories across videos
- **Video Distribution**: Scatter plot clustering by topics
- **Topic Interdistance**: Radar chart of audio features
- **Average Audio Features**: 3D visualization of pitch/volume/tempo
- **Voronoi Graph**: Spectrogram embedding clusters
- **Data Map**: Topic modeling visualization

### Analytics Module

- **Temporal Sentiment**: Sentiment evolution over time
- **Kinematic Features**: Gesture movement analysis (velocity, acceleration)
- **Radial Graph**: Multi-dimensional audio feature comparison

## Tech Stack

### Frontend

- **Framework**: Next.js 15.5.0 with App Router
- **UI Library**: React 19.1.0
- **Design System**: IBM Carbon Design System
- **Styling**: Tailwind CSS v4
- **Visualization**: Plotly.js, Wavesurfer.js, Recharts
- **Language**: TypeScript

### Backend

- **Framework**: FastAPI
- **Server**: Uvicorn (ASGI)
- **Audio Processing**: librosa
- **Data Processing**: pandas
- **Video Processing**: FFmpeg

## Prerequisites

- Docker & Docker Compose
- Node.js 20+ (for local development)
- Python 3.11+ (for local development)
- FFmpeg (included in Docker)

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/ShaddAhmed14/smash.git
cd smash
```

### 2. Configure Environment

Copy the example environment file and configure:

```bash
cp .env.dist .env
```

Edit `.env`:

```env
# Data folders
MATERIALS_FOLDER=/path/to/your/videos
ENVISIONHGDETECTOR_OUTPUT=/path/to/detector/output

# API routes
NEXT_PUBLIC_PREVIEW=/preview
NEXT_PUBLIC_ANALYSIS=/analysis
NEXT_PUBLIC_ANALYTICS=/analytics

# Ports
FRONTEND_PORT=3070
BACKEND_PORT=1234

# Backend URL (use server IP for remote access)
NEXT_PUBLIC_BACKEND_URL=http://localhost:1234
```

### 3. Run with Docker

```bash
docker-compose up --build
```

Access the application:

- **Frontend**: <http://localhost:3070>
- **Backend API**: <http://localhost:1234>
- **API Docs**: <http://localhost:1234/docs>

### 4. Initialize Materials

Visit <http://localhost:1234/setup> to process videos and create materials.

## Local Development Setup

### Frontend Development

```bash
cd frontend
npm install
npm run build && npm start
```

Runs on http://localhost:3000

> **Note**: Due to Node.js 22 compatibility issues with Next.js 15 dev mode, use production build (`npm run build && npm start`) instead of `npm run dev`.

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 1234
```

Runs on http://localhost:1234

## Project Structure

```
smash/
├── frontend/
│   ├── app/                    # Next.js App Router pages
│   │   ├── preview/           # Video preview module
│   │   ├── analysis/          # Analysis visualizations
│   │   ├── analytics/         # Analytics module
│   │   └── video_library/     # Video browsing
│   ├── components/            # React components
│   │   ├── NavBar.tsx         # Navigation bar
│   │   ├── preview/           # Preview module components
│   │   ├── analysis/          # Analysis visualizations
│   │   └── analytics/         # Analytics components
│   ├── pages/                 # Page-level components
│   └── dockerfile             # Frontend container
├── backend/
│   ├── main.py               # FastAPI application
│   ├── utils.py              # Audio/video processing
│   ├── routes/               # API endpoints
│   │   ├── preview.py        # Preview endpoints
│   │   ├── analysis.py       # Analysis endpoints
│   │   └── analytics.py      # Analytics endpoints
│   ├── requirements.txt      # Python dependencies
│   └── dockerfile            # Backend container
├── materials/                # Video data and metadata
├── docker-compose.yml        # Container orchestration
├── .env.dist                 # Environment template
└── README.md                 # This file
```

## Data Format

Expected folder structure in `MATERIALS_FOLDER`:

```
materials/
├── metadata.json                           # Video metadata
├── {video_name}/
│   ├── {video_name}_Original.mp4          # Source video
│   ├── {video_name}_{model}.mp4           # Pose-tracked videos
│   ├── {video_name}_audio.wav             # Extracted audio
│   ├── {video_name}_peaks.json            # 1000 amplitude peaks
│   ├── {video_name}_transcript.srt        # Speech transcript
│   ├── {video_name}_audio_features.json   # Audio analysis
│   └── thumbnails/
│       └── {video_name}_{model}_thumbnail.jpg
├── video_distribution.json                 # Topic clustering
├── average_audio_features.json            # Aggregated stats
└── spectrograms/
    └── {video_name}.png
```

## API Endpoints

### Preview Module

- `GET /preview/fetch_models/` - List available pose detection models
- `GET /preview/fetch_metadata/` - Get all video metadata
- `GET /preview/fetch_video/?video_name={name}&model_name={model}` - Stream video
- `GET /preview/fetch_audio?video_name={name}` - Stream audio
- `GET /preview/fetch_transcript/?video_name={name}` - Get SRT transcript
- `GET /preview/audio_peaks?video_name={name}` - Get waveform peaks
- `GET /preview/fetch_waveform/?video_name={name}` - Get detailed waveform

### Analysis Module

- `GET /analysis/fetch_dtw/` - Dynamic Time Warping analysis
- `GET /analysis/fetch_video_distribution/` - Video clustering data
- `GET /analysis/fetch_average_audio_features/` - Audio feature statistics
- `GET /analysis/fetch_data_map/` - Topic modeling data
- `GET /analysis/fetch_audio_spectogram_embeddings/` - Spectrogram embeddings

### Analytics Module

- `GET /analytics/fetch_temporal_sentiment/` - Sentiment over time
- `GET /analytics/fetch_kinematic_features/` - Gesture kinematics
- `GET /analytics/fetch_gesture_segment?video_name={name}` - Gesture video clips

Full API documentation: http://localhost:1234/docs

## Configuration

### Frontend Configuration

Edit [frontend/next.config.ts](frontend/next.config.ts):

```typescript
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
  },
};
```

### Backend Configuration

Environment variables are loaded from `.env` via `python-dotenv`.

## Development

### Adding a New Visualization

1. Create component in `frontend/components/`
2. Add route in appropriate pillar page
3. Create backend endpoint in `backend/routes/`
4. Process data in `backend/utils.py`

### Processing New Videos

1. Place videos in `MATERIALS_FOLDER`
2. Run setup endpoint: `GET /setup`
3. Backend extracts audio, creates transcripts, generates thumbnails

## Troubleshooting

### Port Already in Use

Change ports in `.env`:
```env
FRONTEND_PORT=3080
BACKEND_PORT=1235
```

### CORS Issues

Update `allow_origins` in [backend/main.py](backend/main.py):
```python
allow_origins=["http://localhost:3070"]
```

### Video Not Playing

1. Check video codec (requires H.264)
2. Verify file exists in materials folder
3. Check browser console for errors

### Docker Build Fails

Clear Docker cache:
```bash
docker-compose down
docker system prune -a
docker-compose up --build
```

### Node.js 22 Compatibility

If using Node.js 22, run production builds instead of dev mode:
```bash
npm run build && npm start
```

## Performance Tips

- Use H.264 codec for videos (best browser support)
- Keep video files under 500MB for optimal streaming
- Enable HTTP/2 on production server
- Use CDN for static assets

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## Known Issues

- Large video files (>500MB) may cause buffering
- TypeScript strict mode disabled (being fixed)
- No pagination in video library yet
- Node.js 22 incompatible with Next.js dev mode (use production build)

See [Issues](https://github.com/ShaddAhmed14/smash/issues) for full list.

## Roadmap

- [ ] Add user authentication
- [ ] Implement video upload functionality
- [ ] Add transcript search/filtering
- [ ] Database integration (PostgreSQL)
- [ ] Video comparison mode
- [ ] Export analysis results (CSV, PDF)
- [ ] Mobile responsive design
- [ ] Real-time collaboration features

## License

This project is licensed under the MIT License - see LICENSE file for details.

## Acknowledgments

- **Radboud University** - Donders Institute for Brain, Cognition and Behaviour
- **NWO** - Netherlands Organisation for Scientific Research (Digital Humanities funding)
- **Hasso Plattner Institute** - HPC Deep Learning Lab collaboration
- Built with Next.js, React, FastAPI, and IBM Carbon Design System
- Audio processing powered by librosa
- Visualization using Plotly.js and Recharts

## Contact

- **Project Website**: [Radboud University SMASH Project](https://www.ru.nl/en/research/research-projects/smash-synthesis-and-multimodal-analytics-system-for-humanities)
- **Dr. Wim Pouw**: Donders Institute for Brain, Cognition and Behaviour
- **Repository**: [github.com/ShaddAhmed14/smash](https://github.com/ShaddAhmed14/smash)

## Citation

If you use SMASH in your research, please cite:

```bibtex
@software{smash2024,
  title={SMASH: Synthesis and Multimodal Analytics System for Humanities},
  author={Pouw, Wim and Owoyele, Babajide and Shaikh, Sharjeel and de Melo, Gerard},
  year={2024},
  institution={Radboud University, Donders Institute for Brain, Cognition and Behaviour},
  url={https://github.com/ShaddAhmed14/smash},
  note={Funded by NWO Digital Humanities}
}
```
