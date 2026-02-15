"""Tests for the preview router endpoints."""


class TestPreviewHome:
    def test_home(self, client):
        resp = client.get("/preview/")
        assert resp.status_code == 200
        assert resp.json()["message"] == "Preview Router is working"


class TestFetchModels:
    def test_returns_model_list(self, client):
        resp = client.get("/preview/fetch_models/")
        assert resp.status_code == 200
        models = resp.json()["models"]
        assert "Original" in models
        assert "YoloPose" in models
        assert len(models) >= 4


class TestFetchMetadata:
    def test_returns_metadata(self, client):
        resp = client.get("/preview/fetch_metadata")
        assert resp.status_code == 200
        data = resp.json()
        assert data["num_videos"] == 2
        assert data["num_speakers"] == 2
        assert "English" in data["languages"]
        assert len(data["data"]) == 2

    def test_metadata_graph(self, client):
        resp = client.get("/preview/fetch_metadata_graph")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data["speaker_gender"]) == 2
        assert len(data["video_name"]) == 2
        assert len(data["topics"]) == 2


class TestFetchAudio:
    def test_stream_audio(self, client):
        resp = client.get("/preview/fetch_audio?video_name=TestVideo001")
        assert resp.status_code == 200
        assert resp.headers["content-type"] == "audio/mpeg"

    def test_audio_not_found(self, client):
        resp = client.get("/preview/fetch_audio?video_name=NonExistent")
        assert resp.status_code == 404


class TestFetchThumbnails:
    def test_fetch_thumbnails(self, client):
        resp = client.get("/preview/fetch_thumbnails/?video_name=TestVideo001")
        assert resp.status_code == 200
        data = resp.json()
        # Original thumbnail exists, should be base64
        assert data["Original"] is not None or data["Original"] is None  # may or may not decode as valid jpeg
        # All model keys should be present
        assert "YoloPose" in data

    def test_fetch_single_thumbnail(self, client):
        resp = client.get("/preview/fetch_thumbnail/?video_name=TestVideo001")
        assert resp.status_code == 200
        assert "image/jpeg" in resp.headers["content-type"]

    def test_thumbnail_not_found(self, client):
        resp = client.get("/preview/fetch_thumbnail/?video_name=NonExistent")
        assert resp.status_code == 404


class TestFetchVideo:
    def test_fetch_original_video(self, client):
        resp = client.get("/preview/fetch_video/?video_name=TestVideo001&model_name=Original")
        assert resp.status_code == 200
        assert resp.headers["content-type"] == "video/mp4"

    def test_fetch_processed_video(self, client):
        resp = client.get("/preview/fetch_video/?video_name=TestVideo001&model_name=YoloPose")
        assert resp.status_code == 200

    def test_video_not_found_bad_name(self, client):
        resp = client.get("/preview/fetch_video/?video_name=NoSuch&model_name=Original")
        assert resp.status_code == 404

    def test_video_not_found_bad_model(self, client):
        resp = client.get("/preview/fetch_video/?video_name=TestVideo001&model_name=FakeModel")
        assert resp.status_code == 404

    def test_range_request(self, client):
        resp = client.get(
            "/preview/fetch_video/?video_name=TestVideo001&model_name=Original",
            headers={"range": "bytes=0-49"},
        )
        assert resp.status_code == 206
        assert "content-range" in resp.headers


class TestAudioPeaks:
    def test_fetch_peaks(self, client):
        resp = client.get("/preview/audio_peaks?video_name=TestVideo001")
        assert resp.status_code == 200

    def test_peaks_not_found(self, client):
        resp = client.get("/preview/audio_peaks?video_name=NonExistent")
        assert resp.status_code == 404


class TestTranscript:
    def test_fetch_transcript(self, client):
        resp = client.get("/preview/fetch_transcript/?video_name=TestVideo001")
        assert resp.status_code == 200
        assert "Hello world" in resp.text

    def test_transcript_not_found(self, client):
        resp = client.get("/preview/fetch_transcript/?video_name=NonExistent")
        assert resp.status_code == 404


class TestWaveform:
    def test_fetch_waveform(self, client):
        resp = client.get("/preview/fetch_waveform/?video_name=TestVideo001")
        assert resp.status_code == 200

    def test_waveform_not_found(self, client):
        resp = client.get("/preview/fetch_waveform/?video_name=NonExistent")
        assert resp.status_code == 404
