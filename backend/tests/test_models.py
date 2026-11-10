import pytest
from pydantic import ValidationError
from models.preference import Message, DualChatRequest, PreferenceRequest, SingleResponse
from models.auth import UserCreate, UserLogin
from models.chat import ConversationCreate, AddMessageRequest

def test_message_model_valid():
    msg = Message(role="user", content="My engine is overheating with code P0117")
    assert msg.role == "user"
    assert "P0117" in msg.content

def test_user_create_validation():
    # Valid
    user = UserCreate(name="Ali Khan", email="ali@example.com", password="pass123456Secure")
    assert user.email == "ali@example.com"

    # Invalid email format
    with pytest.raises(ValidationError):
        UserCreate(name="Ali Khan", email="not-a-valid-email", password="pass123456Secure")

def test_preference_request_validation():
    resp_a = SingleResponse(
        content="Check ECT sensor wiring.",
        temperature=0.3,
        latency_ms=120.5,
        token_count=15
    )
    resp_b = SingleResponse(
        content="Replace engine coolant temperature sensor.",
        temperature=0.6,
        latency_ms=135.2,
        token_count=18
    )

    # Valid chosen options: 'a', 'b', 'skipped'
    pref = PreferenceRequest(
        prompt="Engine overheating",
        context=[Message(role="user", content="Engine overheating")],
        response_a=resp_a,
        response_b=resp_b,
        chosen="a"
    )
    assert pref.chosen == "a"

    # Invalid chosen option should raise ValidationError
    with pytest.raises(ValidationError):
        PreferenceRequest(
            prompt="Engine overheating",
            context=[Message(role="user", content="Engine overheating")],
            response_a=resp_a,
            response_b=resp_b,
            chosen="invalid_choice"
        )

def test_conversation_create_defaults():
    conv = ConversationCreate()
    assert conv.title == "New Chat"

    custom_conv = ConversationCreate(title="Brake Bleeding Guide")
    assert custom_conv.title == "Brake Bleeding Guide"
