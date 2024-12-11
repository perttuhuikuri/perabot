from flask import Flask, send_from_directory, request, jsonify
from flask_cors import CORS
import os
import uuid
from openai import OpenAI

# Load environment variables
api_key = os.environ.get("OPENAI_API_KEY")
if not api_key:
    raise ValueError("OPENAI_API_KEY is not set in the environment variables.")

resume_text = os.environ.get("RESUME_TEXT", "Resume text not available.").replace("\\n", "\n")

# Initialize the OpenAI client
client = OpenAI(api_key=api_key)

app = Flask(__name__, static_folder="frontend", template_folder="frontend")
CORS(app, resources={r"/chat": {"origins": "*"}})

# Store conversation history for sessions
user_sessions = {}

@app.route('/')
def serve_index():
    return send_from_directory('frontend', 'index.html')

@app.route('/<path:path>')
def serve_static_files(path):
    try:
        return send_from_directory('frontend', path)
    except Exception:
        return "File not found", 404

@app.route('/chat', methods=['POST'])
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
