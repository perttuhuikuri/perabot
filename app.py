from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from openai import OpenAI

# Load environment variables
api_key = os.environ.get("OPENAI_API_KEY")
resume_text = os.environ.get("RESUME_TEXT", "Resume text not available.").replace("\\n", "\n")

# Initialize the OpenAI client
client = OpenAI(api_key=api_key)

app = Flask(__name__)
CORS(app)

# Store conversation history for sessions
user_sessions = {}

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    user_message = data.get("message", "").strip()
    session_id = data.get("session_id", "default")  # Default session ID if not provided

    if not user_message:
        return jsonify({"response": "Please ask a question about the resume!"})

    # Initialize session if it doesn't exist
    if session_id not in user_sessions:
        user_sessions[session_id] = [
            {"role": "system", "content": f"You are a professional and friendly assistant representing the candidate Perttu. Answer questions about Perttu's resume in a conversational and engaging tone. Highlight relevant skills and experiences with enthusiasm. Use the following resume to answer questions:\n\n{resume_text}"}
        ]

    # Append the user's message to the session history
    user_sessions[session_id].append({"role": "user", "content": user_message})

    # Generate a response using OpenAI's client
    try:
        # Use the session history to generate a chat completion
        chat_completion = client.chat.completions.create(
            messages=user_sessions[session_id],
            model="gpt-3.5-turbo",
        )

        # Extract the chatbot's reply from the response
        chatbot_reply = chat_completion.choices[0].message.content.strip()

        # Append the bot's reply to the session history
        user_sessions[session_id].append({"role": "assistant", "content": chatbot_reply})

    except Exception as e:
        print(f"Error: {e}")
        chatbot_reply = "Sorry, I encountered an error while processing your request."

    return jsonify({"response": chatbot_reply})

@app.route('/reset', methods=['POST'])
def reset():
    data = request.json
    session_id = data.get("session_id", "default")  # Use the session ID provided
    user_sessions.pop(session_id, None)  # Remove session history
    return jsonify({"response": "Session has been reset."})

if __name__ == "__main__":
    app.run(debug=True)
