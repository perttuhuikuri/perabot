"""Flask application powering the PeraBot resume assistant."""

from __future__ import annotations

import logging
import os
import threading
import uuid
from typing import Dict, Iterable, List
def _parse_int(name: str, default: int) -> int:
    raw_value = os.environ.get(name)
    if raw_value is None:
        return default
    try:
        return int(raw_value)
    except ValueError:
        logger.warning("Invalid integer for %s: %s. Using default %s.", name, raw_value, default)
        return default


def _parse_float(name: str, default: float) -> float:
    raw_value = os.environ.get(name)
    if raw_value is None:
        return default
    try:
        return float(raw_value)
    except ValueError:
        logger.warning("Invalid float for %s: %s. Using default %s.", name, raw_value, default)
        return default

from flask import Flask, current_app, jsonify, request, send_from_directory
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.errors import RateLimitExceeded
from flask_limiter.util import get_remote_address
import PyPDF2
from openai import OpenAI

try:
    from dotenv import load_dotenv
except ImportError:  # pragma: no cover - fallback for environments without python-dotenv
    def load_dotenv() -> None:  # type: ignore[override]
        logging.getLogger(__name__).warning(
            "python-dotenv is not installed; skipping .env loading.")


def _configure_logging() -> None:
    level_name = os.environ.get("LOG_LEVEL", "INFO").upper()
    level = logging.getLevelName(level_name)
    if isinstance(level, str):
        level = logging.INFO
    logging.basicConfig(
        level=level,
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    )


_configure_logging()
load_dotenv()
logger = logging.getLogger(__name__)


def _rate_limit_key() -> str:
    payload = request.get_json(silent=True)
    if isinstance(payload, dict) and payload.get("session_id"):
        return str(payload["session_id"])
    return get_remote_address()


limiter = Limiter(key_func=_rate_limit_key)


class InMemorySessionStore:
    """Thread-safe session store that caps historical messages."""

    def __init__(self, max_messages: int) -> None:
        self._max_messages = max(2, max_messages)
        self._sessions: Dict[str, List[dict]] = {}
        self._lock = threading.Lock()

    def add_user_message(self, session_id: str, system_prompt: str, content: str) -> List[dict]:
        with self._lock:
            history = self._sessions.setdefault(
                session_id,
                [{"role": "system", "content": system_prompt}],
            )
            history.append({"role": "user", "content": content})
            self._trim(history)
            return list(history)

    def add_assistant_message(self, session_id: str, content: str) -> None:
        with self._lock:
            history = self._sessions.get(session_id)
            if history is None:
                return
            history.append({"role": "assistant", "content": content})
            self._trim(history)

    def reset(self, session_id: str) -> None:
        with self._lock:
            self._sessions.pop(session_id, None)

    def _trim(self, history: List[dict]) -> None:
        if len(history) <= self._max_messages:
            return
        system_message = history[0]
        tail = history[-(self._max_messages - 1) :]
        history[:] = [system_message, *tail]


def read_resume_from_pdf(pdf_path: str) -> str:
    """Extract text from the provided PDF path."""

    if not os.path.exists(pdf_path):
        logger.warning("Resume PDF not found at '%s'.", pdf_path)
        return ""

    try:
        with open(pdf_path, "rb") as pdf_file:
            reader = PyPDF2.PdfReader(pdf_file)
            text_chunks: List[str] = []
            for page in reader.pages:
                extracted = page.extract_text() or ""
                if extracted:
                    text_chunks.append(extracted.strip())
            return "\n".join(text_chunks).strip()
    except Exception:  # noqa: BLE001
        logger.exception("Error while reading resume PDF.")
        return ""


def build_system_prompt(resume_text: str) -> str:
    resume_section = resume_text or "Resume text is currently unavailable."
    return (
        "You are a professional assistant representing Perttu. "
        "Use the following resume details to answer the user's questions accurately:\n\n"
        f"{resume_section}"
    )


def create_openai_client(api_key: str | None = None) -> OpenAI:
    key = api_key or os.environ.get("OPENAI_API_KEY")
    if not key:
        raise ValueError("OPENAI_API_KEY must be set to start the application.")
    return OpenAI(api_key=key)


def generate_chat_reply(client: OpenAI, messages: Iterable[dict], *, model: str, temperature: float, max_tokens: int) -> str:
    completion = client.chat.completions.create(
        messages=list(messages),
        model=model,
        temperature=temperature,
        max_tokens=max_tokens,
    )
    return completion.choices[0].message.content.strip()


def create_app(*, openai_client: OpenAI | None = None, resume_text: str | None = None) -> Flask:
    app = Flask(__name__, static_folder="frontend", template_folder="frontend")

    limiter.init_app(app)

    max_messages = _parse_int("MAX_SESSION_MESSAGES", 20)
    session_store = InMemorySessionStore(max_messages=max_messages)
    app.extensions["session_store"] = session_store

    resolved_resume_text = (
        resume_text
        if resume_text is not None
        else read_resume_from_pdf(
            os.environ.get("RESUME_PDF_PATH") or os.path.join(app.root_path, "resume.pdf")
        )
    )

    app.config.setdefault("SYSTEM_PROMPT", build_system_prompt(resolved_resume_text))
    app.config.setdefault("OPENAI_MODEL", os.environ.get("OPENAI_CHAT_MODEL", "gpt-4o-mini"))
    app.config.setdefault("OPENAI_TEMPERATURE", _parse_float("OPENAI_TEMPERATURE", 0.3))
    app.config.setdefault("OPENAI_MAX_TOKENS", _parse_int("OPENAI_MAX_TOKENS", 512))
    app.config.setdefault("RATE_LIMIT", os.environ.get("RATE_LIMIT", "10 per minute"))

    cors_origins = os.environ.get("CORS_ORIGINS")
    if cors_origins:
        origins = [origin.strip() for origin in cors_origins.split(",") if origin.strip()]
    else:
        origins = ["*"]
    CORS(app, resources={r"/chat": {"origins": origins}, r"/reset": {"origins": origins}})

    app.config["OPENAI_CLIENT"] = openai_client or create_openai_client()

    @app.errorhandler(RateLimitExceeded)
    def handle_rate_limit_exceeded(_: RateLimitExceeded):  # type: ignore[override]
        return (
            jsonify({"response": "Too many requests. Please wait a moment before trying again."}),
            429,
        )

    @app.route("/")
    @limiter.exempt
    def serve_index():
        return send_from_directory("frontend", "index.html")

    @app.route("/favicon.ico")
    @limiter.exempt
    def favicon():
        return send_from_directory("frontend", "favicon.ico")

    @app.route("/<path:path>")
    @limiter.exempt
    def serve_static_files(path: str):
        try:
            return send_from_directory("frontend", path)
        except Exception:  # noqa: BLE001
            return "File not found", 404

    @app.route("/health", methods=["GET"])
    @limiter.exempt
    def health_check():
        return jsonify({"status": "ok"})

    @app.route("/chat", methods=["POST"])
    @limiter.limit(lambda: current_app.config["RATE_LIMIT"])
    def chat():
        payload = request.get_json(silent=True)
        if not isinstance(payload, dict):
            return jsonify({"response": "Invalid request payload."}), 400

        user_message = payload.get("message", "").strip()
        if not user_message:
            return jsonify({"response": "Please ask a question about the resume!"}), 400

        session_id = str(payload.get("session_id") or uuid.uuid4())

        session_snapshot = session_store.add_user_message(
            session_id,
            current_app.config["SYSTEM_PROMPT"],
            user_message,
        )

        try:
            reply = generate_chat_reply(
                current_app.config["OPENAI_CLIENT"],
                session_snapshot,
                model=current_app.config["OPENAI_MODEL"],
                temperature=current_app.config["OPENAI_TEMPERATURE"],
                max_tokens=current_app.config["OPENAI_MAX_TOKENS"],
            )
        except Exception:  # noqa: BLE001
            logger.exception("Error generating response from OpenAI.")
            session_store.reset(session_id)
            return (
                jsonify(
                    {
                        "response": (
                            "I encountered an issue while processing your request. "
                            "Please try again later."
                        )
                    }
                ),
                502,
            )

        session_store.add_assistant_message(session_id, reply)
        return jsonify({"response": reply, "session_id": session_id})

    @app.route("/reset", methods=["POST"])
    def reset():
        payload = request.get_json(silent=True) or {}
        session_id = str(payload.get("session_id") or "default")
        session_store.reset(session_id)
        return jsonify({"response": "Session has been reset."})

    return app


app = create_app()


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "5000"))
    app.run(debug=False, host="0.0.0.0", port=port)
