"""Tests for new analysis routes (prosody, pauses, facial, visual) and export API."""


# ---------------------------------------------------------------------------
# Analysis route tests — new modules
# ---------------------------------------------------------------------------

class TestProsody:
    def test_fetch_prosody(self, client):
        resp = client.get("/analysis/fetch_prosody?video_name=TestVideo001")
        assert resp.status_code == 200
        data = resp.json()
        assert "contours" in data
        assert "F0semitoneFrom27.5Hz_sma3nz" in data["contours"]

    def test_prosody_not_found(self, client):
        resp = client.get("/analysis/fetch_prosody?video_name=NonExistent")
        assert resp.status_code == 404

    def test_fetch_average_prosody(self, client):
        resp = client.get("/analysis/fetch_average_prosody")
        assert resp.status_code == 200
        data = resp.json()
        assert "titles" in data


class TestPausesFillers:
    def test_fetch_pauses_fillers(self, client):
        resp = client.get("/analysis/fetch_pauses_fillers?video_name=TestVideo001")
        assert resp.status_code == 200
        data = resp.json()
        assert "summary" in data
        assert data["summary"]["total_pauses"] == 1
        assert data["summary"]["total_fillers"] == 1

    def test_pauses_fillers_not_found(self, client):
        resp = client.get("/analysis/fetch_pauses_fillers?video_name=NonExistent")
        assert resp.status_code == 404


class TestFacialExpressions:
    def test_fetch_facial(self, client):
        resp = client.get("/analysis/fetch_facial_expressions?video_name=TestVideo001")
        assert resp.status_code == 200
        data = resp.json()
        assert data["summary"]["dominant_emotion"] == "happiness"
        assert "emotions" in data
        assert "action_units" in data

    def test_facial_not_found(self, client):
        resp = client.get("/analysis/fetch_facial_expressions?video_name=NonExistent")
        assert resp.status_code == 404

    def test_fetch_average_facial(self, client):
        resp = client.get("/analysis/fetch_average_facial_expressions")
        assert resp.status_code == 200
        data = resp.json()
        assert "titles" in data


class TestVisualEmbeddings:
    def test_fetch_visual_embeddings(self, client):
        resp = client.get("/analysis/fetch_visual_embeddings?video_name=TestVideo001")
        assert resp.status_code == 200
        data = resp.json()
        assert data["embedding_dim"] == 384
        assert data["n_frames"] == 20
        assert len(data["mean_embedding"]) == 384

    def test_visual_not_found(self, client):
        resp = client.get("/analysis/fetch_visual_embeddings?video_name=NonExistent")
        assert resp.status_code == 404

    def test_fetch_visual_similarity_map(self, client):
        resp = client.get("/analysis/fetch_visual_similarity_map")
        assert resp.status_code == 200
        data = resp.json()
        assert "titles" in data
        assert len(data["labels"]) == 2


# ---------------------------------------------------------------------------
# Export route tests — legacy endpoints
# ---------------------------------------------------------------------------

class TestExportVideoData:
    def test_export_json(self, client):
        resp = client.get("/export/video_data?video_name=TestVideo001&format=json")
        assert resp.status_code == 200
        assert "application/json" in resp.headers["content-type"]
        data = resp.json()
        assert data["video_name"] == "TestVideo001"
        assert "audio_features" in data
        assert "prosody" in data
        assert "pauses_fillers" in data
        assert "facial_expressions" in data
        assert "visual_embeddings" in data

    def test_export_csv(self, client):
        resp = client.get("/export/video_data?video_name=TestVideo001&format=csv")
        assert resp.status_code == 200
        assert "text/csv" in resp.headers["content-type"]
        lines = resp.text.strip().split("\n")
        assert len(lines) >= 2  # header + at least 1 data row

    def test_export_not_found(self, client):
        resp = client.get("/export/video_data?video_name=NonExistent")
        assert resp.status_code == 404


class TestExportCorpusSummary:
    def test_export_json(self, client):
        resp = client.get("/export/corpus_summary?format=json")
        assert resp.status_code == 200
        data = resp.json()
        # At least 2 test videos (may include spacey_analysis dir)
        video_names = [d["video_name"] for d in data]
        assert "TestVideo001" in video_names
        assert "TestVideo002" in video_names

    def test_export_csv(self, client):
        resp = client.get("/export/corpus_summary?format=csv")
        assert resp.status_code == 200
        assert "text/csv" in resp.headers["content-type"]
        lines = resp.text.strip().split("\n")
        assert len(lines) >= 3  # header + at least 2 video rows
