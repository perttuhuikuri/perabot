import os
import sys
import types
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT_ROOT))

os.environ.setdefault("OPENAI_API_KEY", "test-key")

openai_stub = types.SimpleNamespace(OpenAI=types.SimpleNamespace)
sys.modules.setdefault("openai", openai_stub)

import pytest

from app import create_app


class StubCompletions:
    def __init__(self, reply: str = "Stub response") -> None:
        self.reply = reply
        self.calls: list[list[dict]] = []

    def create(self, *, messages, model, temperature, max_tokens):  # noqa: D401
        self.calls.append(list(messages))
        # Mimic the OpenAI response structure
        message = types.SimpleNamespace(content=self.reply)
        choice = types.SimpleNamespace(message=message)
        return types.SimpleNamespace(choices=[choice])


class StubChat:
    def __init__(self) -> None:
        self.completions = StubCompletions()


class StubOpenAIClient:
    def __init__(self) -> None:
        self.chat = StubChat()


@pytest.fixture()
def app():
    stub_client = StubOpenAIClient()
    flask_app = create_app(openai_client=stub_client, resume_text="Sample resume")
    flask_app.config.update({"TESTING": True})
    # Attach the stub for test inspection
    flask_app.config["_stub_client"] = stub_client
    return flask_app


@pytest.fixture()
def client(app):
    return app.test_client()


def test_health_endpoint(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.get_json() == {"status": "ok"}


def test_chat_rejects_empty_message(client):
    response = client.post("/chat", json={"message": "", "session_id": "abc"})
    assert response.status_code == 400
    assert response.get_json()["response"].startswith("Please ask")


def test_chat_returns_stubbed_response(app, client):
    session_id = "session-123"
    response = client.post(
        "/chat",
        json={"message": "Hello", "session_id": session_id},
    )

    assert response.status_code == 200
    payload = response.get_json()
    assert payload["response"] == "Stub response"
    assert payload["session_id"] == session_id

    calls = app.config["_stub_client"].chat.completions.calls
    assert len(calls) == 1
    call_messages = calls[0]
    assert call_messages[0]["role"] == "system"
    assert call_messages[1]["content"] == "Hello"


def test_reset_clears_conversation(app, client):
    session_id = "reset-session"
    client.post("/chat", json={"message": "First", "session_id": session_id})
    client.post("/reset", json={"session_id": session_id})

    # Clear call history to observe the second interaction
    app.config["_stub_client"].chat.completions.calls.clear()

    response = client.post("/chat", json={"message": "Second", "session_id": session_id})
    assert response.status_code == 200

    calls = app.config["_stub_client"].chat.completions.calls
    assert len(calls) == 1
    # Expect only system + user message after reset
    assert len(calls[0]) == 2
    assert calls[0][1]["content"] == "Second"
