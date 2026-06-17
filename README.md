# ⚡ ReviewIQ

AI-powered GitHub Pull Request analytics platform that collects real PR data, analyzes engineering productivity, detects code review issues, and visualizes repository insights through an interactive dashboard.

## ✨ Features

* 📊 **PR Analytics** — Track contributor activity, merge-time trends, and repository health
* 🚨 **Issue Detection** — Identify code quality issues from pull request changes
* ⏱️ **Bottleneck Analysis** — Surface PRs with abnormal merge delays and review bottlenecks
* 🧠 **ML Classifier** — Predict issue categories using a TF-IDF + Logistic Regression model
* 🔌 **REST API** — FastAPI backend with documented endpoints
* 🌙 **Interactive Dashboard** — React-based analytics dashboard with charts and filters

## 📈 Results

* 50 Pull Requests analyzed
* 110 Issues detected
* 15 Contributors tracked
* 72.7% ML classification accuracy

## 🛠️ Tech Stack

**Backend:** FastAPI · SQLAlchemy · SQLite/PostgreSQL · GitHub REST API
**Data & ML:** Pandas · scikit-learn · TF-IDF · Logistic Regression
**Frontend:** React · TypeScript · Vite · TailwindCSS · Recharts · Axios

## 💡 Why ReviewIQ

Software teams generate large volumes of pull requests, but review trends, bottlenecks, and recurring issues often remain hidden. ReviewIQ transforms GitHub PR history into actionable engineering insights through analytics, machine learning, and interactive visualizations.

## 🚀 Quick Start

```bash
# Backend
cd reviewiq
python -m venv venv
pip install -r requirements.txt
uvicorn api.main:app --reload --port 8000

# Frontend
cd reviewiq-frontend-app
npm install
npm run dev
```

Frontend: `http://localhost:5173`
Backend: `http://localhost:8000/docs`

## 📁 Project Structure

```text
reviewiq/
├── api/                  # FastAPI routes and endpoints
├── db/                   # Database models and session management
├── ingestion/            # GitHub PR ingestion pipeline
├── ml/                   # ML classifier and prediction logic
├── pipeline/             # Analytics processing
└── reviewiq-frontend-app/
    ├── pages/
    ├── components/
    ├── hooks/
    └── services/
```
