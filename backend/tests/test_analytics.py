"""Tests for the analytics router endpoints."""


class TestSpacy:
    def test_fetch_spacy(self, client):
        resp = client.get("/analytics/fetch_spacy?video_name=TestVideo001")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        assert data[0]["tokens"][0]["text"] == "Hello"

    def test_spacy_not_found(self, client):
        resp = client.get("/analytics/fetch_spacy?video_name=NonExistent")
        assert resp.status_code == 404


class TestSpacyList:
    def test_fetch_spacy_list(self, client):
        resp = client.get("/analytics/fetch_spacy_list")
        assert resp.status_code == 200
        data = resp.json()
        assert "video_names" in data
        assert "TestVideo001" in data["video_names"]


class TestDependencyTree:
    def test_dependency_tree_not_found(self, client):
        resp = client.get("/analytics/fetch_dependency_tree?video_name=TestVideo001&sentence_id=0")
        assert resp.status_code == 404


class TestPerTalkList:
    def test_fetch_pertalk_list_empty(self, client):
        resp = client.get("/analytics/fetch_pertalk_list")
        assert resp.status_code == 200
        data = resp.json()
        assert "video_names" in data


class TestSemanticNetwork:
    def test_fetch_tfidf(self, client):
        resp = client.get("/analytics/fetch_semantic_network?type=TFIDF")
        assert resp.status_code == 200
        data = resp.json()
        assert "nodes" in data

    def test_fetch_sbert(self, client):
        resp = client.get("/analytics/fetch_semantic_network?type=SBERT")
        assert resp.status_code == 200

    def test_fetch_unknown_type(self, client):
        resp = client.get("/analytics/fetch_semantic_network?type=nonexistent")
        assert resp.status_code == 404


class TestTemporalSentiment:
    def test_fetch_temporal_sentiment(self, client):
        resp = client.get("/analytics/fetch_temporal_sentiment")
        assert resp.status_code == 200


class TestKinematicFeatures:
    def test_fetch_kinematic_features(self, client):
        resp = client.get("/analytics/fetch_kinematic_features")
        assert resp.status_code == 200
        data = resp.json()
        assert "gesture_ids" in data
        assert "features" in data
        assert "jitter_values" in data
        assert len(data["gesture_ids"]) == 2


class TestGestureSegment:
    def test_gesture_segment_not_found(self, client):
        resp = client.get("/analytics/fetch_gesture_segment?video_name=NonExistent")
        assert resp.status_code == 404
