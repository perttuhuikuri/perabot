from flask import Flask, send_from_directory, request, jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_limiter.errors import RateLimitExceeded
import os
import uuid
from openai import OpenAI
import PyPDF2

# Load environment variables
api_key = os.environ.get("OPENAI_API_KEY")
if not api_key:
    raise ValueError("OPENAI_API_KEY is not set in the environment variables.")

# Function to read resume data from a PDF file
def read_resume_from_pdf(pdf_path):
    try:
        with open(pdf_path, "rb") as pdf_file:
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text()
            return text.strip()
    except Exception as e:
        print(f"Error reading PDF: {e}")
        return "Resume text not available."

pdf_resume_path = "resume.pdf"

# Extract resume text
resume_text = read_resume_from_pdf(pdf_resume_path)
if not resume_text:
    raise ValueError("Failed to load resume from PDF file.")

# Initialize the OpenAI client
client = OpenAI(api_key=api_key)

app = Flask(__name__, static_folder="frontend", template_folder="frontend")

CORS(app, resources={r"/*": {"origins": "https://perachatbot.azurewebsites.net"}})

# Initialize Flask-Limiter
limiter = Limiter(
    key_func=lambda: request.json.get("session_id", "default"),  # Use session_id for rate limiting
    app=app,
    default_limits=["10 per minute"],  # Default rate limit
)

# Store conversation history for sessions
user_sessions = {}

# Custom handler for rate limit exceeded
@app.errorhandler(RateLimitExceeded)
def handle_rate_limit_exceeded(e):
    return jsonify({"response": "Too many requests. Please wait a moment before trying again."}), 429

@app.route('/')
@limiter.exempt
def serve_index():
    return send_from_directory('frontend', 'index.html')

@app.route('/favicon.ico')
@limiter.exempt
def favicon():
    return send_from_directory('frontend', 'favicon.ico')

@app.route('/<path:path>')
@limiter.exempt
def serve_static_files(path):
    try:
        return send_from_directory('frontend', path)
    except Exception:
        return "File not found", 404

@app.route('/chat', methods=['POST'])
@limiter.limit("10 per minute")  # Apply rate limit to /chat endpoint
def chat():
    data = request.json
    user_message = data.get("message", "").strip()
    session_id = data.get("session_id", str(uuid.uuid4()))

    if not user_message:
        return jsonify({"response": "Please ask a question about the resume!"})

    # Initialize session if it doesn't exist
    if session_id not in user_sessions:
        user_sessions[session_id] = [
            {"role": "system", "content": f"You are a professional assistant representing Perttu. Use this resume:\n\n{resume_text}"}
        ]

    # Append user message
    user_sessions[session_id].append({"role": "user", "content": user_message})

    try:
        chat_completion = client.chat.completions.create(
            messages=user_sessions[session_id],
            model="gpt-3.5-turbo",
        )
        chatbot_reply = chat_completion.choices[0].message.content.strip()
        user_sessions[session_id].append({"role": "assistant", "content": chatbot_reply})

    except Exception as e:
        print(f"Error generating response: {e}")
        chatbot_reply = "I encountered an issue while processing your request. Please try again later."

    return jsonify({"response": chatbot_reply})

@app.route('/reset', methods=['POST'])
def reset():
    data = request.json
    session_id = data.get("session_id", "default")
    user_sessions.pop(session_id, None)
    return jsonify({"response": "Session has been reset."})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=False, host="0.0.0.0", port=port)
