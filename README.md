# SMASH

## Synthesis and Multimodal Analytics System for Humanities

A fully open-source tool for understanding the composition of non-verbal communication aspects, including body language, facial expressions, and melodic aspects of speech.

## Project Overview

SMASH takes audio-visual recordings of communicating individuals as input and produces a summary of their multimodal communication characteristics as output. It provides:

- **Gesture Analysis**: Number and diversity of hand gestures
- **Posture & Expression Tracking**: Changes in posture and facial expressions relevant to communication context
- **Voice Tone Analysis**: How voice tone changes in relation to other gestures
- **Speech Analysis**: Detection of pauses, fillers, and other speech patterns
- **Semantic Analysis**: Automatic speech transcription and topic modeling

By integrating body language, facial expressions, voice, and content in an easily understandable way, SMASH allows a detailed zoomed-out view of the full gamut of communication modes.

## Features

- **Privacy Protection**: Integrated masking tool for audio-visual data
- **Standard Baselines**: Compare speakers against existing speaker databases
- **Data Export**: Options for customized analysis
- **No Programming Required**: Designed for users without programming experience

## Project Duration

7 December 2024 - 7 December 2025

## Collaborators

### Radboud University

- **Babajide Owoyele**
- **Wim Pouw** (Lead Applicant)

Faculty of Social Sciences, Donders Institute for Brain, Cognition and Behaviour, Donders Centre for Cognition

### University of Potsdam

- **Gerard de Melo**
- **Sharjeel Shaikh**

## Funding

This project is funded by NWO (Dutch Research Council). Babajide Owoyele, Gerard de Melo, and Wim Pouw obtained this grant tripartitely. Wim Pouw is lead applicant due to NWO guidelines.

## Architecture

SMASH consists of three main modules:

1. **Preview**: Video preparation, thumbnail generation, and material setup
2. **Analysis**: Deep dive into gesture detection, audio features, and transcript analysis
3. **Analytics**: Comparative analytics and visualization dashboards

### Tech Stack

- **Backend**: Python/FastAPI with ML libraries (PyTorch, Transformers, Whisper, BERTopic)
- **Frontend**: Next.js 15 with React 19, Plotly.js, Recharts, WaveSurfer.js
- **Deployment**: Docker with docker-compose orchestration

## Getting Started

### Prerequisites

- Docker and Docker Compose
- FFmpeg (for audio/video processing)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-org/smash.git
   cd smash
   ```

2. Copy environment template and configure:

   ```bash
   cp .env.dist .env
   # Edit .env with your configuration
   ```

3. Start the application:

   ```bash
   docker-compose up --build
   ```

4. Access the application:
   - Frontend: <http://localhost:3000>
   - Backend API: <http://localhost:8000>

## Project Links

- [Radboud University Project Page](https://www.ru.nl/en/research/research-projects/smash)

## License

This project is open-source. License details to be added.

## Contact

For more information about SMASH, please contact the project team through Radboud University.

---

SMASH is developed as a versatile and easy-to-use tool for research and clinical contexts in social sciences and humanities.
