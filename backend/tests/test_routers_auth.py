import pytest
from unittest.mock import AsyncMock, patch
from fastapi import FastAPI
from fastapi.testclient import TestClient
from routers.auth import router as auth_router
from utils.auth_utils import create_access_token, get_password_hash

app = FastAPI()
app.include_router(auth_router)
client = TestClient(app)

@pytest.mark.asyncio
async def test_get_me_valid_token():
    token = create_access_token({"sub": "usr_999", "email": "driver@highway.com"})
    mock_col = AsyncMock()
    mock_col.find_one = AsyncMock(return_value={
        "_id": "usr_999",
        "name": "Mechanic Dave",
        "email": "driver@highway.com",
        "created_at": "2026-01-01T00:00:00Z"
    })

    with patch("routers.auth.get_users_collection", return_value=mock_col):
        response = client.get(f"/api/auth/me?token={token}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "usr_999"
        assert data["name"] == "Mechanic Dave"
        assert data["email"] == "driver@highway.com"

def test_get_me_guest_token():
    response = client.get("/api/auth/me?token=guest_123456")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "guest_123456"
    assert data["email"] == "guest@local"

def test_get_me_invalid_token():
    response = client.get("/api/auth/me?token=garbage_token")
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid token"

@pytest.mark.asyncio
async def test_register_duplicate_email():
    mock_col = AsyncMock()
    mock_col.find_one = AsyncMock(return_value={"_id": "existing_id", "email": "mechanic@garage.com"})

    with patch("routers.auth.get_users_collection", return_value=mock_col):
        response = client.post("/api/auth/register", json={
            "name": "Bob",
            "email": "mechanic@garage.com",
            "password": "mypassword123"
        })
        assert response.status_code == 400
        assert "Email already registered" in response.json()["detail"]

@pytest.mark.asyncio
async def test_register_success():
    mock_col = AsyncMock()
    mock_col.find_one = AsyncMock(return_value=None)
    mock_col.insert_one = AsyncMock()

    with patch("routers.auth.get_users_collection", return_value=mock_col):
        response = client.post("/api/auth/register", json={
            "name": "Sarah",
            "email": "sarah@diagnostics.com",
            "password": "SecurePassword!9"
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        mock_col.insert_one.assert_called_once()

@pytest.mark.asyncio
async def test_login_invalid_password():
    mock_col = AsyncMock()
    mock_col.find_one = AsyncMock(return_value={
        "_id": "usr_1",
        "email": "user@test.com",
        "password_hash": get_password_hash("CorrectPassword123")
    })

    with patch("routers.auth.get_users_collection", return_value=mock_col):
        response = client.post("/api/auth/login", json={
            "email": "user@test.com",
            "password": "WrongPassword999"
        })
        assert response.status_code == 400
        assert "Invalid email or password" in response.json()["detail"]

@pytest.mark.asyncio
async def test_login_success():
    raw_pass = "CorrectPassword123"
    mock_col = AsyncMock()
    mock_col.find_one = AsyncMock(return_value={
        "_id": "usr_10",
        "email": "user@test.com",
        "password_hash": get_password_hash(raw_pass)
    })

    with patch("routers.auth.get_users_collection", return_value=mock_col):
        response = client.post("/api/auth/login", json={
            "email": "user@test.com",
            "password": raw_pass
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
