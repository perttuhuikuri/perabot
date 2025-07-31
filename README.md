# **PeraBot: Interactive Resume Chatbot**

PeraBot is an AI-powered chatbot that provides an interactive way for recruiters to explore your resume. It uses OpenAI's GPT model to intelligently answer questions about your skills, experiences, and qualifications. Built with Python (Flask) for the backend and vanilla JavaScript for the frontend, PeraBot offers a professional and engaging candidate experience.

---

## **Features**

- **Interactive Resume Q&A**: Recruiters can query your resume in real-time.
- **Session Management**: Keeps track of ongoing conversations for personalized responses.
- **Rate Limiting**: Prevents excessive API usage with user-specific rate limits.
- **PDF Resume Support**: Reads resume content directly from a PDF file.
- **Responsive Design**: Fully optimized for desktop and mobile devices.
- **Error Handling**: Displays user-friendly messages for errors like rate limits or server issues.

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
