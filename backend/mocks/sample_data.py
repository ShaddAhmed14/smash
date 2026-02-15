"""
Mock data for backend testing and development
Provides sample data for API responses when real data is not available
"""

from typing import List, Dict, Any
import random
random.seed(42)  # Consistent random data


# Sample video metadata
MOCK_VIDEOS: List[Dict[str, Any]] = [
    {
        "id": "video-001",
        "title": "The Future of Artificial Intelligence",
        "speaker": "Dr. Sarah Chen",
        "duration": 1080,
        "file_path": "/materials/video-001/video.mp4",
        "status": "processed"
    },
    {
        "id": "video-002",
        "title": "Climate Action: What We Can Do Today",
        "speaker": "Prof. Michael Torres",
        "duration": 924,
        "file_path": "/materials/video-002/video.mp4",
        "status": "processed"
    },
    {
        "id": "video-003",
        "title": "The Art of Public Speaking",
        "speaker": "Amanda Williams",
        "duration": 1260,
        "file_path": "/materials/video-003/video.mp4",
        "status": "processed"
    }
]


# Sample transcript segments
MOCK_TRANSCRIPT_SEGMENTS: List[Dict[str, Any]] = [
    {"start": 0.0, "end": 4.5, "text": "Good morning everyone. Today I want to talk about something that affects all of us."},
    {"start": 4.5, "end": 9.2, "text": "Artificial intelligence is no longer a concept from science fiction."},
    {"start": 9.2, "end": 14.8, "text": "It's here, it's real, and it's transforming every aspect of our lives."},
    {"start": 14.8, "end": 20.5, "text": "From healthcare to transportation, from education to entertainment."},
    {"start": 20.5, "end": 26.3, "text": "Let me share with you three key insights about where AI is heading."},
]


# Sample audio features (mel spectrogram-like data)
def generate_mock_audio_features(duration_seconds: int = 60, sample_rate: int = 22050) -> Dict[str, Any]:
    """Generate mock audio feature data"""
    num_frames = duration_seconds * 10  # ~10 frames per second
    num_mels = 128

    return {
        "mel_spectrogram": [[random.random() for _ in range(num_frames)] for _ in range(num_mels)],
        "sample_rate": sample_rate,
        "duration": duration_seconds,
        "n_mels": num_mels
    }


# Sample analysis results
MOCK_ANALYSIS_RESULTS: Dict[str, Any] = {
    "gesture_score": 78.5,
    "prosody_score": 82.3,
    "facial_expression_score": 71.2,
    "topic_coherence": 85.0,
    "overall_score": 79.25,
    "recommendations": [
        "Consider varying your gestures more throughout the presentation",
        "Great use of vocal emphasis on key points",
        "Maintain more consistent eye contact with the audience"
    ]
}


# Sample analytics aggregates
MOCK_ANALYTICS_SUMMARY: Dict[str, Any] = {
    "total_videos": 1247,
    "total_hours": 892,
    "average_score": 78.5,
    "top_speakers": 156,
    "unique_topics": 42,
    "weekly_activity": [
        {"week": f"W{i+1}", "videos": random.randint(20, 100)}
        for i in range(52)
    ]
}


def get_mock_video(video_id: str) -> Dict[str, Any] | None:
    """Get mock video by ID"""
    for video in MOCK_VIDEOS:
        if video["id"] == video_id:
            return video
    return None


def get_mock_transcript(video_id: str) -> List[Dict[str, Any]]:
    """Get mock transcript for a video"""
    return MOCK_TRANSCRIPT_SEGMENTS


def get_mock_analysis(video_id: str) -> Dict[str, Any]:
    """Get mock analysis results for a video"""
    return MOCK_ANALYSIS_RESULTS.copy()
