# **PeraBot: Interactive Resume Chatbot**

PeraBot is an AI-powered chatbot that provides an interactive way for recruiters to explore your resume. It uses OpenAI's GPT model to intelligently answer questions about your skills, experiences, and qualifications. Built with Python (Flask) for the backend and vanilla JavaScript for the frontend, PeraBot offers a professional and engaging candidate experience.

---

## **Features**

- **Interactive Resume Q&A**: Recruiters can query your resume in real-time.
- **Session Management**: Keeps track of ongoing conversations for personalized responses.
- **Rate Limiting**: Prevents excessive API usage with user-specific rate limits.
- **PDF Resume Support**: Reads resume content directly from a PDF file.
- **Responsive Design**: Fully optimized for desktop and mobile devices.
- **Configurable Deployment**: Environment variables control models, limits, and resume source.
- **Health Monitoring**: Includes a `/health` endpoint for uptime checks.

---

## **Getting Started**

### Prerequisites

- Python 3.11+
- An [OpenAI API key](https://platform.openai.com/)

### Installation

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file (or configure environment variables in your hosting platform):

```env
OPENAI_API_KEY=your-key
RESUME_PDF_PATH=resume.pdf  # optional override
OPENAI_CHAT_MODEL=gpt-4o-mini  # optional override
```

### Running Locally

```bash
python app.py
```

Open your browser at `http://127.0.0.1:5000`.

### Frontend development

The modern React + Vite frontend lives in `frontend/`.

```bash
cd frontend
npm install
npm run dev
```

The dev server defaults to `http://127.0.0.1:5173` and proxies API calls to the Flask backend. To build for production, run `npm run build`; artifacts land in `frontend/dist/`.

### Testing

```bash
pytest
```

---

## **Configuration**

Environment variable | Description | Default
--- | --- | ---
`OPENAI_CHAT_MODEL` | Chat completion model | `gpt-4o-mini`
`OPENAI_TEMPERATURE` | Sampling temperature | `0.3`
`OPENAI_MAX_TOKENS` | Max tokens per reply | `512`
`RATE_LIMIT` | Requests allowed per minute | `10 per minute`
`MAX_SESSION_MESSAGES` | Messages retained per session | `20`
`CORS_ORIGINS` | Comma-separated list of allowed origins for API calls | `*`
`RESUME_PDF_PATH` | Override path to resume PDF | `resume.pdf`
`VITE_API_BASE_URL` | (Frontend) Override API base URL when serving the React app | window origin

Set `data-backend-url` on the `<body>` element in `frontend/index.html` if the frontend is hosted separately from the backend.

---

## **Technologies Used**

- **Backend**: Flask, OpenAI API, Flask-Limiter for rate limiting.
- **Frontend**: HTML, CSS, JavaScript.
- **PDF Handling**: PyPDF2 for extracting text from the resume.
- **Deployment**: Hosted on Azure App Services.

---

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE.txt) file for details.

---
