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

## **Getting Started**

### **Prerequisites**

- Python 3.7 or higher
- Git
- An OpenAI API key

---

### **Installation**

#### **1. Clone the Repository**
```bash
git clone https://github.com/<your-username>/perabot.git
cd perabot
```

#### **2. Set Up Python Environment**
```bash
python -m venv venv
source venv/bin/activate       # On Linux/Mac
venv\Scripts\activate          # On Windows
```

#### **3. Install Dependencies**
```bash
pip install -r requirements.txt
```

---

### **Configuration**

#### **Environment Variables**
Create a `.env` file in the root directory to store your environment variables:
```plaintext
OPENAI_API_KEY=your-openai-api-key
```

#### **Resume File**
Place your resume as a PDF file in the root directory and name it `resume.pdf`. Ensure it contains the latest version of your resume.

---

### **Running the Application**

#### **Start the Flask Server**
```bash
python app.py
```

Visit the application in your browser at:
```
http://127.0.0.1:5000
```

---

## **Deployment**

### **Deploying to Azure**

#### **1. Zip the Project**
Exclude unnecessary files like `venv` and create a ZIP file:
```bash
zip -r perabot.zip . -x "venv/*"
```

#### **2. Deploy to Azure**
Use the Azure CLI to deploy the zipped project:
```bash
az webapp deployment source config-zip --resource-group <resource-group-name> --name <web-app-name> --src ./perabot.zip
```

#### **3. Access Your Deployed App**
Visit your chatbot at:
```
https://<your-app-name>.azurewebsites.net
```

---

## **Usage**

1. Open the chatbot in your browser.
2. Type questions in the input box, such as:
   - "What are your strengths?"
   - "Tell me about your experience with project management."
3. PeraBot will respond with relevant details from your resume.

---

## **Customization**

### **Updating Your Resume**
1. Replace the `resume.pdf` file in the root directory with your updated resume.
2. Restart the application to reload the new resume data.

### **Modifying Rate Limits**
To adjust the rate limits, update the configuration in `app.py`:
```python
limiter = Limiter(
    key_func=lambda: request.json.get("session_id", "default"),
    app=app,
    default_limits=["10 per minute"]
)
```

---

## **Project Structure**

```
perabot/
├── app.py                # Backend logic and API routes
├── requirements.txt      # Python dependencies
├── frontend/             # Frontend files
│   ├── index.html        # Chatbot UI
│   ├── styles.css        # Styles for the UI
│   ├── script.js         # Frontend logic
├── resume.pdf            # Resume data (input for the chatbot)
├── .env                  # Environment variables
└── README.md             # Project documentation
```

---

## **Future Enhancements**

- Support multiple resumes or company-specific customization.
- Integrate with LinkedIn or GitHub for additional candidate details.
- Provide a downloadable PDF of the resume for recruiters.

---

## **Contributing**

Contributions are welcome! To contribute:
1. Fork the repository.
2. Create a new branch (`git checkout -b feature-name`).
3. Commit your changes (`git commit -m "Add new feature"`).
4. Push the branch (`git push origin feature-name`).
5. Open a pull request.

---

## **Acknowledgments**

- [OpenAI](https://openai.com/) for the GPT API.
- [PyPDF2](https://pypi.org/project/PyPDF2/) for PDF text extraction.
- [Flask](https://flask.palletsprojects.com/) for the backend framework.

---

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE.txt) file for details.

---
