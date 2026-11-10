from datetime import timedelta
import pytest
from utils.auth_utils import (
    get_password_hash,
    verify_password,
    create_access_token,
    decode_access_token,
)

def test_password_hashing_and_verification():
    raw_password = "SecretPassword!123"
    hashed = get_password_hash(raw_password)

    assert hashed != raw_password
    assert verify_password(raw_password, hashed) is True
    assert verify_password("WrongPassword999", hashed) is False

def test_jwt_create_and_decode_valid():
    payload_data = {"sub": "user_abc_123", "email": "mechanic@garage.com"}
    token = create_access_token(payload_data, expires_delta=timedelta(minutes=30))

    assert isinstance(token, str)
    decoded = decode_access_token(token)
    assert decoded is not None
    assert decoded.get("sub") == "user_abc_123"
    assert decoded.get("email") == "mechanic@garage.com"

def test_jwt_guest_token_passthrough():
    guest_token = "guest_sess_789456"
    decoded = decode_access_token(guest_token)

    assert decoded is not None
    assert decoded.get("sub") == guest_token
    assert decoded.get("email") == "guest@local"

def test_jwt_invalid_token_returns_none():
    invalid_token = "invalid.tampered.token"
    decoded = decode_access_token(invalid_token)
    assert decoded is None

def test_jwt_expired_token():
    payload_data = {"sub": "expired_user"}
    # Token expired 10 minutes ago
    expired_token = create_access_token(payload_data, expires_delta=timedelta(minutes=-10))

    decoded = decode_access_token(expired_token)
    assert decoded is None
