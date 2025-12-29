"""
Tests for security utilities - path traversal prevention and input validation.
These tests are critical for ensuring the API is protected against malicious inputs.
"""
import pytest
import os
import tempfile
from fastapi import HTTPException

# Add parent directory to path for imports
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.security import sanitize_video_name, sanitize_model_name, safe_join_path


class TestSanitizeVideoName:
    """Tests for sanitize_video_name() function."""

    # Valid video names
    def test_valid_simple_name(self):
        """Simple alphanumeric names should pass."""
        assert sanitize_video_name("video123") == "video123"

    def test_valid_name_with_underscore(self):
        """Names with underscores should pass."""
        assert sanitize_video_name("my_video_1") == "my_video_1"

    def test_valid_name_with_hyphen(self):
        """Names with hyphens should pass."""
        assert sanitize_video_name("my-video-1") == "my-video-1"

    def test_valid_name_with_dot(self):
        """Names with dots (extensions) should pass."""
        assert sanitize_video_name("video.mp4") == "video.mp4"

    def test_valid_complex_name(self):
        """Complex valid names should pass."""
        assert sanitize_video_name("TED_Talk_2024-01-15_speaker.mp4") == "TED_Talk_2024-01-15_speaker.mp4"

    # Whitespace handling
    def test_strips_whitespace(self):
        """Leading and trailing whitespace should be stripped."""
        assert sanitize_video_name("  video123  ") == "video123"

    def test_strips_tabs(self):
        """Tabs should be stripped."""
        assert sanitize_video_name("\tvideo123\t") == "video123"

    # Path traversal attempts
    def test_rejects_double_dot(self):
        """Double dots (path traversal) should raise HTTPException."""
        with pytest.raises(HTTPException) as exc_info:
            sanitize_video_name("../etc/passwd")
        assert exc_info.value.status_code == 400

    def test_rejects_double_dot_windows(self):
        """Windows-style path traversal should raise HTTPException."""
        with pytest.raises(HTTPException) as exc_info:
            sanitize_video_name("..\\windows\\system32")
        assert exc_info.value.status_code == 400

    def test_rejects_absolute_path_unix(self):
        """Absolute Unix paths should raise HTTPException."""
        with pytest.raises(HTTPException) as exc_info:
            sanitize_video_name("/etc/passwd")
        assert exc_info.value.status_code == 400

    def test_rejects_absolute_path_windows(self):
        """Absolute Windows paths should raise HTTPException."""
        with pytest.raises(HTTPException) as exc_info:
            sanitize_video_name("C:\\Windows\\System32")
        assert exc_info.value.status_code == 400

    def test_extracts_basename_from_path(self):
        """Paths should be reduced to basename only."""
        # os.path.basename extracts just the filename
        result = sanitize_video_name("subdir/video.mp4")
        assert result == "video.mp4"

    # Invalid characters
    def test_rejects_special_characters(self):
        """Special characters should raise HTTPException."""
        invalid_chars = ['$', '&', '*', '?', '<', '>', '|', '"', "'", '`', ';', '!', '@', '#', '%', '^', '(', ')', '[', ']', '{', '}']
        for char in invalid_chars:
            with pytest.raises(HTTPException) as exc_info:
                sanitize_video_name(f"video{char}name")
            assert exc_info.value.status_code == 400, f"Should reject character: {char}"

    def test_rejects_spaces_in_name(self):
        """Spaces within the name should raise HTTPException."""
        with pytest.raises(HTTPException) as exc_info:
            sanitize_video_name("video name")
        assert exc_info.value.status_code == 400

    def test_rejects_newlines(self):
        """Newlines should raise HTTPException."""
        with pytest.raises(HTTPException) as exc_info:
            sanitize_video_name("video\nname")
        assert exc_info.value.status_code == 400

    # Empty and null inputs
    def test_rejects_empty_string(self):
        """Empty string should raise HTTPException."""
        with pytest.raises(HTTPException) as exc_info:
            sanitize_video_name("")
        assert exc_info.value.status_code == 400

    def test_rejects_whitespace_only(self):
        """Whitespace-only string should raise HTTPException."""
        with pytest.raises(HTTPException) as exc_info:
            sanitize_video_name("   ")
        assert exc_info.value.status_code == 400

    # Length validation
    def test_accepts_max_length(self):
        """Names at max length (255) should pass."""
        name = "a" * 255
        assert sanitize_video_name(name) == name

    def test_rejects_over_max_length(self):
        """Names over max length should raise HTTPException."""
        name = "a" * 256
        with pytest.raises(HTTPException) as exc_info:
            sanitize_video_name(name)
        assert exc_info.value.status_code == 400


class TestSanitizeModelName:
    """Tests for sanitize_model_name() function."""

    ALLOWED_MODELS = ["Original", "YoloPose", "MediaPipePose", "OpenPose"]

    def test_valid_model_name(self):
        """Valid model names from whitelist should pass."""
        assert sanitize_model_name("Original", self.ALLOWED_MODELS) == "Original"
        assert sanitize_model_name("YoloPose", self.ALLOWED_MODELS) == "YoloPose"

    def test_strips_whitespace(self):
        """Whitespace should be stripped before validation."""
        assert sanitize_model_name("  Original  ", self.ALLOWED_MODELS) == "Original"

    def test_rejects_invalid_model(self):
        """Invalid model names should raise HTTPException."""
        with pytest.raises(HTTPException) as exc_info:
            sanitize_model_name("InvalidModel", self.ALLOWED_MODELS)
        assert exc_info.value.status_code == 400

    def test_rejects_empty_string(self):
        """Empty string should raise HTTPException."""
        with pytest.raises(HTTPException) as exc_info:
            sanitize_model_name("", self.ALLOWED_MODELS)
        assert exc_info.value.status_code == 400

    def test_case_sensitive(self):
        """Model names should be case-sensitive."""
        with pytest.raises(HTTPException) as exc_info:
            sanitize_model_name("original", self.ALLOWED_MODELS)  # lowercase
        assert exc_info.value.status_code == 400

    def test_rejects_partial_match(self):
        """Partial matches should not be accepted."""
        with pytest.raises(HTTPException) as exc_info:
            sanitize_model_name("Origin", self.ALLOWED_MODELS)
        assert exc_info.value.status_code == 400


class TestSafeJoinPath:
    """Tests for safe_join_path() function."""

    def test_simple_join(self):
        """Simple path joining should work."""
        result = safe_join_path("/materials", "video1")
        assert result.endswith("video1")
        assert "materials" in result

    def test_multiple_components(self):
        """Multiple path components should be joined."""
        result = safe_join_path("/materials", "video1", "thumbnails", "thumb.jpg")
        assert result.endswith("thumb.jpg")
        assert "video1" in result

    def test_rejects_parent_traversal(self):
        """Attempts to escape base path should raise HTTPException."""
        with pytest.raises(HTTPException) as exc_info:
            safe_join_path("/materials", "..", "etc", "passwd")
        assert exc_info.value.status_code == 400

    def test_rejects_double_parent_traversal(self):
        """Multiple parent traversals should raise HTTPException."""
        with pytest.raises(HTTPException) as exc_info:
            safe_join_path("/materials", "video", "..", "..", "etc")
        assert exc_info.value.status_code == 400

    def test_rejects_absolute_path_in_component(self):
        """Absolute paths in components should be blocked."""
        with pytest.raises(HTTPException) as exc_info:
            safe_join_path("/materials", "/etc/passwd")
        assert exc_info.value.status_code == 400

    def test_normalizes_path(self):
        """Paths should be normalized (no double slashes, etc.)."""
        result = safe_join_path("/materials", "video1", "file.json")
        assert "//" not in result

    def test_with_temp_directory(self):
        """Test with actual temp directory to verify real path behavior."""
        with tempfile.TemporaryDirectory() as tmpdir:
            result = safe_join_path(tmpdir, "subdir", "file.txt")
            assert result.startswith(tmpdir)
            assert result.endswith("file.txt")

    def test_rejects_escape_with_real_dir(self):
        """Test escape prevention with actual directory."""
        with tempfile.TemporaryDirectory() as tmpdir:
            with pytest.raises(HTTPException) as exc_info:
                safe_join_path(tmpdir, "..", "outside")
            assert exc_info.value.status_code == 400
