"""
Tests for mock data module
"""
import pytest
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from mocks.sample_data import (
    MOCK_VIDEOS,
    MOCK_TRANSCRIPT_SEGMENTS,
    MOCK_ANALYSIS_RESULTS,
    MOCK_ANALYTICS_SUMMARY,
    generate_mock_audio_features,
    get_mock_video,
    get_mock_transcript,
    get_mock_analysis
)


class TestMockVideos:
    """Test mock video data"""

    def test_videos_not_empty(self):
        """Test that mock videos list is not empty"""
        assert len(MOCK_VIDEOS) > 0

    def test_video_has_required_fields(self):
        """Test that each video has required fields"""
        required_fields = ["id", "title", "speaker", "duration", "file_path", "status"]
        for video in MOCK_VIDEOS:
            for field in required_fields:
                assert field in video, f"Missing field: {field}"

    def test_video_duration_positive(self):
        """Test that video durations are positive"""
        for video in MOCK_VIDEOS:
            assert video["duration"] > 0


class TestMockTranscripts:
    """Test mock transcript data"""

    def test_segments_not_empty(self):
        """Test that transcript segments exist"""
        assert len(MOCK_TRANSCRIPT_SEGMENTS) > 0

    def test_segment_structure(self):
        """Test segment structure"""
        for segment in MOCK_TRANSCRIPT_SEGMENTS:
            assert "start" in segment
            assert "end" in segment
            assert "text" in segment
            assert segment["end"] > segment["start"]

    def test_segments_non_overlapping(self):
        """Test that segments don't overlap"""
        for i in range(1, len(MOCK_TRANSCRIPT_SEGMENTS)):
            prev = MOCK_TRANSCRIPT_SEGMENTS[i - 1]
            curr = MOCK_TRANSCRIPT_SEGMENTS[i]
            assert curr["start"] >= prev["end"]


class TestMockAnalysis:
    """Test mock analysis data"""

    def test_analysis_has_scores(self):
        """Test that analysis has score fields"""
        assert "gesture_score" in MOCK_ANALYSIS_RESULTS
        assert "prosody_score" in MOCK_ANALYSIS_RESULTS
        assert "overall_score" in MOCK_ANALYSIS_RESULTS

    def test_scores_in_valid_range(self):
        """Test that scores are in 0-100 range"""
        score_fields = ["gesture_score", "prosody_score", "facial_expression_score",
                       "topic_coherence", "overall_score"]
        for field in score_fields:
            score = MOCK_ANALYSIS_RESULTS[field]
            assert 0 <= score <= 100, f"{field} out of range: {score}"

    def test_has_recommendations(self):
        """Test that recommendations exist"""
        assert "recommendations" in MOCK_ANALYSIS_RESULTS
        assert len(MOCK_ANALYSIS_RESULTS["recommendations"]) > 0


class TestMockAnalytics:
    """Test mock analytics data"""

    def test_summary_has_totals(self):
        """Test that analytics summary has totals"""
        assert "total_videos" in MOCK_ANALYTICS_SUMMARY
        assert "total_hours" in MOCK_ANALYTICS_SUMMARY
        assert MOCK_ANALYTICS_SUMMARY["total_videos"] > 0

    def test_weekly_activity_52_weeks(self):
        """Test that weekly activity covers full year"""
        assert len(MOCK_ANALYTICS_SUMMARY["weekly_activity"]) == 52


class TestMockFunctions:
    """Test mock data getter functions"""

    def test_get_mock_video_found(self):
        """Test getting existing video"""
        video = get_mock_video("video-001")
        assert video is not None
        assert video["id"] == "video-001"

    def test_get_mock_video_not_found(self):
        """Test getting non-existent video"""
        video = get_mock_video("non-existent")
        assert video is None

    def test_get_mock_transcript(self):
        """Test getting transcript"""
        transcript = get_mock_transcript("video-001")
        assert len(transcript) > 0

    def test_get_mock_analysis(self):
        """Test getting analysis"""
        analysis = get_mock_analysis("video-001")
        assert "overall_score" in analysis


class TestAudioFeatureGeneration:
    """Test audio feature generation"""

    def test_generate_audio_features(self):
        """Test generating mock audio features"""
        features = generate_mock_audio_features(duration_seconds=10)
        assert "mel_spectrogram" in features
        assert "sample_rate" in features
        assert features["duration"] == 10

    def test_audio_features_dimensions(self):
        """Test audio feature dimensions"""
        features = generate_mock_audio_features(duration_seconds=10)
        mel = features["mel_spectrogram"]
        assert len(mel) == features["n_mels"]
        assert len(mel[0]) == 100  # 10 seconds * 10 frames/second
