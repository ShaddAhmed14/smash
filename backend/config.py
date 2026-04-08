"""Centralized config — reads paths from environment variables.

Defaults to Docker mount paths (/materials, /envisionhgdetector_output)
so existing Docker Compose deployments keep working.
"""

import os
from dotenv import load_dotenv

load_dotenv()

MATERIALS_FOLDER: str = os.getenv("MATERIALS_FOLDER", "/materials")
ENVISIONHGDETECTOR_OUTPUT: str = os.getenv(
    "ENVISIONHGDETECTOR_OUTPUT", "/envisionhgdetector_output"
)
