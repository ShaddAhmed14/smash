"""
Security utilities for input validation and path traversal prevention.
"""
import os
import re
from fastapi import HTTPException


# Allowed characters for video names: alphanumeric, underscores, hyphens, dots
VIDEO_NAME_PATTERN = re.compile(r'^[a-zA-Z0-9_\-\.]+$')

# Maximum length for video names
MAX_VIDEO_NAME_LENGTH = 255


def sanitize_video_name(video_name: str) -> str:
    """
    Sanitize video name to prevent path traversal attacks.

    Args:
        video_name: The video name from user input

    Returns:
        Sanitized video name

    Raises:
        HTTPException: If the video name is invalid or potentially malicious
    """
    if not video_name:
        raise HTTPException(status_code=400, detail="Video name is required")

    # Strip whitespace
    video_name = video_name.strip()

    # Check length
    if len(video_name) > MAX_VIDEO_NAME_LENGTH:
        raise HTTPException(status_code=400, detail="Video name is too long")

    # Remove any path components - only keep the basename
    video_name = os.path.basename(video_name)

    # Check for path traversal attempts
    if '..' in video_name or video_name.startswith('/') or video_name.startswith('\\'):
        raise HTTPException(status_code=400, detail="Invalid video name")

    # Validate characters
    if not VIDEO_NAME_PATTERN.match(video_name):
        raise HTTPException(status_code=400, detail="Video name contains invalid characters")

    # Ensure it's not empty after sanitization
    if not video_name:
        raise HTTPException(status_code=400, detail="Invalid video name")

    return video_name


def sanitize_model_name(model_name: str, allowed_models: list) -> str:
    """
    Validate model name against a whitelist of allowed models.

    Args:
        model_name: The model name from user input
        allowed_models: List of allowed model names

    Returns:
        Validated model name

    Raises:
        HTTPException: If the model name is not in the allowed list
    """
    if not model_name:
        raise HTTPException(status_code=400, detail="Model name is required")

    model_name = model_name.strip()

    if model_name not in allowed_models:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid model name. Allowed models: {', '.join(allowed_models)}"
        )

    return model_name


def safe_join_path(base_path: str, *paths: str) -> str:
    """
    Safely join paths and ensure the result is within the base path.

    Args:
        base_path: The base directory that should contain the result
        *paths: Path components to join

    Returns:
        The joined path

    Raises:
        HTTPException: If the resulting path would be outside the base path
    """
    # Normalize the base path
    base_path = os.path.normpath(os.path.abspath(base_path))

    # Join and normalize the full path
    full_path = os.path.normpath(os.path.abspath(os.path.join(base_path, *paths)))

    # Ensure the result is within the base path
    if not full_path.startswith(base_path):
        raise HTTPException(status_code=400, detail="Invalid path")

    return full_path
