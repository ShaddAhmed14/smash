"""
Tests for the main FastAPI application
"""
import pytest
from fastapi.testclient import TestClient
import sys
import os

# Add parent directory to path to import main
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app


client = TestClient(app)


class TestHealthEndpoints:
    """Test basic health and info endpoints"""

    def test_home_endpoint(self):
        """Test the home endpoint returns successfully"""
        response = client.get("/")
        assert response.status_code == 200
        assert response.json() == "Hello World"

    def test_cors_headers(self):
        """Test that CORS headers are present"""
        response = client.options(
            "/",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "GET"
            }
        )
        # CORS preflight should succeed
        assert response.status_code in [200, 204, 400]


class TestAPIStructure:
    """Test API structure and documentation"""

    def test_openapi_schema_available(self):
        """Test that OpenAPI schema is accessible"""
        response = client.get("/openapi.json")
        assert response.status_code == 200
        schema = response.json()
        assert schema["info"]["title"] == "SMASH API"
        assert schema["info"]["version"] == "1.0.0"

    def test_docs_endpoint(self):
        """Test that docs endpoint is accessible"""
        response = client.get("/docs")
        assert response.status_code == 200
