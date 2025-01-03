let sessionId = generateSessionId();

const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const backendUrl = 'https://perachatbot.azurewebsites.net';

// Generate a unique session ID
function generateSessionId() {
    return 'session-' + Math.random().toString(36).substr(2, 9); // Random session ID
}

// Add a message to the chat box
function addMessage(message, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('chat-message'); // Add the base chat-message class
    messageDiv.classList.add(sender === 'bot' ? 'bot' : 'user'); // Add the specific sender class (bot or user)
    messageDiv.innerText = message;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Show typing indicator
function showTypingIndicator() {
    // Create the typing indicator container
    const typingIndicator = document.createElement('div');
    typingIndicator.classList.add('chat-message', 'bot', 'typing-indicator');
    typingIndicator.id = 'typing-indicator';

    // Add three dots for the animation
    for (let i = 0; i < 3; i++) {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        typingIndicator.appendChild(dot);
    }

    chatBox.appendChild(typingIndicator);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Hide typing indicator
function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

async function sendMessage() {
    const message = userInput.value.trim();
    
    if (!message) return;

    // Display the user's message
    addMessage(message, 'user');
    userInput.value = '';

    showTypingIndicator();

    try {
        // Simulate a delay for bot response
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Send message to the Flask backend with session ID
        const response = await fetch(`${backendUrl}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                message: message,
                session_id: sessionId,
             }),
        });

        // Handle the 429 status
        if (response.status === 429) {
            hideTypingIndicator();
            addMessage('Error: Too many requests. Please try again later.', 'bot');
            return;
        }

        // Handle other non-200 responses
        if (!response.ok) {
            hideTypingIndicator();
            addMessage('Error: Something went wrong. Please try again.', 'bot');
            return;
        }

        const data = await response.json();

        hideTypingIndicator();

        // Display the chatbot's response
        addMessage(data.response, 'bot');
    } catch (error) {
        hideTypingIndicator();
        addMessage('Error: Unable to contact the server.', 'bot');
    }
}

// Function to reset the session
async function resetSessionOnReload() {
    try {
        // Call the reset endpoint
        await fetch(`${backendUrl}/reset`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                session_id: sessionId,
            }),
        });

        // Clear the chatbox and generate a new session ID
        chatBox.innerHTML = '';
        sessionId = generateSessionId();
    } catch (error) {
        addMessage('Error: Unable to reset the session.', 'bot');
    }
}

// Add greeting message in two parts with typing indicator
function displayGreeting() {
    const firstMessage = "Hi! I'm PeraBot, your assistant for answering questions about Perttu's resume.";
    const secondMessage = "Keep in mind that I'm currently in beta, so some of my responses might not be complete or fully accurate. Feel free to ask me anything in English or Finnish!";

    // Show typing indicator before first message
    showTypingIndicator();

    setTimeout(() => {
        // Add the first message and remove the typing indicator
        hideTypingIndicator();
        addMessage(firstMessage, 'bot');

        // Show typing indicator before second message
        showTypingIndicator();

        setTimeout(() => {
            // Add the second message and remove the typing indicator
            hideTypingIndicator();
            addMessage(secondMessage, 'bot');
        }, 2500); // Delay for the second message
    }, 1000); // Delay for the first message
}

// Send message on Enter key press
userInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        sendMessage();
    }
});

window.onload = () => {
    resetSessionOnReload();
    displayGreeting();
};
