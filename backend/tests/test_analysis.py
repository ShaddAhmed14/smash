"""Tests for the analysis router endpoints."""


class TestAudioFeatures:
    def test_fetch_audio_features(self, client):
        resp = client.get("/analysis/fetch_audio_features?video_name=TestVideo001")
        assert resp.status_code == 200
        data = resp.json()
        assert data["tempo"] == 120

    def test_audio_features_not_found(self, client):
        resp = client.get("/analysis/fetch_audio_features?video_name=NonExistent")
        assert resp.status_code == 404


class TestDTW:
    def test_fetch_dtw(self, client):
        resp = client.get("/analysis/fetch_dtw")
        assert resp.status_code == 200
        data = resp.json()
        assert "gesture_id" in data
        assert len(data["gesture_id"]) == 2


class TestDataMap:
    def test_fetch_data_map(self, client):
        resp = client.get("/analysis/fetch_data_map")
        assert resp.status_code == 200


class TestSpectrogram:
    def test_fetch_spectrogram(self, client):
        resp = client.get("/analysis/fetch_spectrogram?video_name=TestVideo001")
        assert resp.status_code == 200
        assert "image/png" in resp.headers["content-type"]

    def test_spectrogram_not_found(self, client):
        resp = client.get("/analysis/fetch_spectrogram?video_name=NonExistent")
        assert resp.status_code == 404


class TestVideoDistribution:
    def test_fetch_video_distribution(self, client):
        resp = client.get("/analysis/fetch_video_distribution")
        assert resp.status_code == 200


class TestTopicInterdistance:
    def test_fetch_topic_interdistance(self, client):
        resp = client.get("/analysis/fetch_topic_interdistance")
        assert resp.status_code == 200


class TestAverageAudioFeatures:
    def test_fetch_average_audio_features(self, client):
        resp = client.get("/analysis/fetch_average_audio_features")
        assert resp.status_code == 200


class TestMaxAudioFeatures:
    def test_fetch_max_audio_features(self, client):
        resp = client.get("/analysis/fetch_max_audio_features")
        assert resp.status_code == 200


class TestWordCloud:
    def test_fetch_word_cloud(self, client):
        resp = client.get("/analysis/fetch_world_cloud")
        assert resp.status_code == 200
        assert "image/png" in resp.headers["content-type"]


class TestSpectrogramEmbeddings:
    def test_fetch_embeddings(self, client):
        resp = client.get("/analysis/fetch_audio_spectrogram_embeddings")
        assert resp.status_code == 200


class TestKinematicFeatures:
    def test_fetch_per_video_kinematic(self, client):
        resp = client.get("/analysis/fetch_kinematic_features?video_name=TestVideo001")
        assert resp.status_code == 200
        data = resp.json()
        assert "x" in data
        assert "y" in data

    def test_kinematic_not_found(self, client):
        resp = client.get("/analysis/fetch_kinematic_features?video_name=NonExistent")
        assert resp.status_code == 404
