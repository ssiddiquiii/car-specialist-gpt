import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi import FastAPI
from fastapi.testclient import TestClient
from routers.chats import router as chats_router
from utils.auth_utils import create_access_token

app = FastAPI()
app.include_router(chats_router)
client = TestClient(app)

valid_token = create_access_token({"sub": "usr_test_123", "email": "test@mechanic.com"})
auth_headers = {"Authorization": f"Bearer {valid_token}"}

def test_chats_missing_auth():
    response = client.get("/api/chats")
    assert response.status_code == 401
    assert "Missing or invalid token" in response.json()["detail"]

def test_chats_invalid_auth_token():
    response = client.get("/api/chats", headers={"Authorization": "Bearer bad.token.here"})
    assert response.status_code == 401
    assert "Invalid token" in response.json()["detail"]

@pytest.mark.asyncio
async def test_get_conversations_empty():
    mock_cursor = MagicMock()
    mock_cursor.sort = MagicMock(return_value=mock_cursor)
    mock_cursor.to_list = AsyncMock(return_value=[])

    mock_col = AsyncMock()
    mock_col.find = MagicMock(return_value=mock_cursor)

    with patch("routers.chats.get_conversations_collection", return_value=mock_col):
        response = client.get("/api/chats", headers=auth_headers)
        assert response.status_code == 200
        assert response.json() == []

@pytest.mark.asyncio
async def test_create_conversation_success():
    mock_col = AsyncMock()
    mock_col.insert_one = AsyncMock()

    with patch("routers.chats.get_conversations_collection", return_value=mock_col):
        response = client.post("/api/chats", json={"title": "Transmission Diagnosis"}, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Transmission Diagnosis"
        assert data["user_id"] == "usr_test_123"
        assert "id" in data
        mock_col.insert_one.assert_called_once()

@pytest.mark.asyncio
async def test_add_message_success():
    mock_col = AsyncMock()
    mock_col.find_one = AsyncMock(return_value={"_id": "chat_001", "user_id": "usr_test_123", "messages": []})
    mock_col.update_one = AsyncMock()

    with patch("routers.chats.get_conversations_collection", return_value=mock_col):
        response = client.post(
            "/api/chats/chat_001/message",
            json={"role": "user", "content": "What causes white exhaust smoke?"},
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert data["message"]["content"] == "What causes white exhaust smoke?"
        mock_col.update_one.assert_called_once()

@pytest.mark.asyncio
async def test_add_message_chat_not_found():
    mock_col = AsyncMock()
    mock_col.find_one = AsyncMock(return_value=None)

    with patch("routers.chats.get_conversations_collection", return_value=mock_col):
        response = client.post(
            "/api/chats/non_existent_chat/message",
            json={"role": "user", "content": "Hello?"},
            headers=auth_headers
        )
        assert response.status_code == 404
        assert "Conversation not found" in response.json()["detail"]

@pytest.mark.asyncio
async def test_delete_chat_success():
    mock_res = AsyncMock()
    mock_res.deleted_count = 1

    mock_col = AsyncMock()
    mock_col.delete_one = AsyncMock(return_value=mock_res)

    with patch("routers.chats.get_conversations_collection", return_value=mock_col):
        response = client.delete("/api/chats/chat_001", headers=auth_headers)
        assert response.status_code == 200
        assert response.json()["status"] == "ok"

@pytest.mark.asyncio
async def test_delete_chat_not_found():
    mock_res = AsyncMock()
    mock_res.deleted_count = 0

    mock_col = AsyncMock()
    mock_col.delete_one = AsyncMock(return_value=mock_res)

    with patch("routers.chats.get_conversations_collection", return_value=mock_col):
        response = client.delete("/api/chats/chat_missing", headers=auth_headers)
        assert response.status_code == 404
        assert "Chat not found" in response.json()["detail"]
