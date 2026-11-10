import pytest
from unittest.mock import AsyncMock, patch
from fastapi.testclient import TestClient
from main import app
from models.preference import SingleResponse

client = TestClient(app)

def test_health_check_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "llama_server_running" in data

@pytest.mark.asyncio
async def test_save_preference_success():
    resp_a = SingleResponse(
        content="Inspect spark plug gap and ignition coils.",
        temperature=0.3,
        latency_ms=150.0,
        token_count=10
    )
    resp_b = SingleResponse(
        content="Replace MAF sensor immediately.",
        temperature=0.6,
        latency_ms=180.0,
        token_count=12
    )

    mock_pref_col = AsyncMock()
    mock_insert_res = AsyncMock()
    mock_insert_res.inserted_id = "mongo_id_abc_123"
    mock_pref_col.insert_one = AsyncMock(return_value=mock_insert_res)

    mock_conv_col = AsyncMock()
    mock_conv_col.update_one = AsyncMock()

    with patch("main.get_preference_collection", return_value=mock_pref_col), \
         patch("main.get_conversations_collection", return_value=mock_conv_col):
        response = client.post("/api/preference", json={
            "conversation_id": "conv_99",
            "user_id": "usr_test",
            "prompt": "Misfire code P0300",
            "context": [{"role": "user", "content": "Misfire code P0300"}],
            "response_a": resp_a.model_dump(),
            "response_b": resp_b.model_dump(),
            "chosen": "a"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["saved"] is True
        assert data["log_id"] == "mongo_id_abc_123"
        assert "spark plug" in data["chosen_content"]

@pytest.mark.asyncio
async def test_save_preference_offline_db_fallback():
    resp_a = SingleResponse(
        content="Inspect fuel pump pressure.",
        temperature=0.3,
        latency_ms=140.0,
        token_count=8
    )
    resp_b = SingleResponse(
        content="Check battery voltage.",
        temperature=0.6,
        latency_ms=160.0,
        token_count=9
    )

    # When MongoDB throws connection error (offline mode)
    with patch("main.get_preference_collection", side_effect=Exception("Database connection timeout")):
        response = client.post("/api/preference", json={
            "conversation_id": "conv_offline",
            "user_id": "usr_guest",
            "prompt": "Engine cranks but won't start",
            "context": [{"role": "user", "content": "Engine cranks but won't start"}],
            "response_a": resp_a.model_dump(),
            "response_b": resp_b.model_dump(),
            "chosen": "b"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["saved"] is False
        assert data["log_id"] == "db_unavailable"
        assert "battery voltage" in data["chosen_content"]
