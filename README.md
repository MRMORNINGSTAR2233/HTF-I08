# Auralytics

**Auralytics** is an AI‑driven voice‑to‑visualization platform that transforms simple spoken queries into real‑time, interactive data insights—no coding or SQL knowledge required.

---

## 🚀 Features

- **Voice‑Driven Queries**  
  Speak naturally to query your database (e.g. “Show me last week’s sales by region”).

- **Text‑to‑SQL Agent**  
  Powered by LangChain + Groq AI’s Gemini model: converts natural language into precise SQLite queries.

- **Modular Agent Pipeline**  
  Orchestrated with LangGraph: separate agents handle voice‑to‑text, SQL generation, data retrieval, and chart creation.

- **Real‑Time Visualization**  
  FastAPI backend fetches live data; React/Vite frontend (with TailwindCSS, Shadcn UI & D3) renders dynamic charts.

- **Multilingual Support**  
  Accept queries in multiple languages and dialects, with built‑in translation where needed.

- **Scalable & Secure**  
  Containerized with Docker, deployable on AWS EC2 or similar; Cloudflare R2 for storage; OAuth2/JWT for auth.

---

## 📦 Tech Stack

- **Frontend:** React (Vite), TailwindCSS, Shadcn UI, D3.js  
- **Backend:** FastAPI, SQLite (or cloud database)  
- **Agents & AI:** LangChain, LangGraph, Groq AI interface, Gemini LLM  
- **Deployment:** Docker, Kubernetes (optional), AWS EC2, Cloudflare R2  

---

## 🔧 Installation

1. **Clone the repo**  
   ```bash
   git clone https://github.com/your-org/auralytics.git
   cd auralytics
2.Create & populate the database

bash
Copy
Edit
python database_setup.py
Install dependencies

bash
Copy
Edit
pip install -r requirements.txt
cd frontend
npm install
Run the backend

bash
Copy
Edit
uvicorn app:app --reload
Run the frontend

bash
Copy
Edit
cd frontend
npm run dev

📖 Usage
Open the web UI.

Click the microphone icon or type your query.

Ask something like:

“Show me total sales by product category for the last month.”

Watch as Auralytics fetches, queries, and visualizes your data in seconds.

Drill down further by following up:

“Now break that down by region.”

🤖 Agents Overview

Agent	Responsibility
Voice‑to‑Text Agent	Captures and transcribes user speech
Text‑to‑SQL Agent	Converts natural language to SQL (Gemini via Groq AI)
Data Query Agent	Executes SQL against SQLite & returns a DataFrame
Visualization Agent	Renders charts (D3.js or Plotly) for the frontend
API Agent	FastAPI endpoint gluing all agents together
🤝 Contributing
Fork the repo and create your branch:

bash
Copy
Edit
git checkout -b feature/YourFeature
Commit your changes:

bash
Copy
Edit
git commit -m "Add YourFeature"
Push to your fork:

bash
Copy
Edit
git push origin feature/YourFeature
Open a pull request—our maintainers will review and merge.

