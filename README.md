# ⚡ ReviewIQ

**AI-powered Pull Request analytics for engineering teams.**

ReviewIQ ingests GitHub PRs, analyzes engineering productivity, detects merge-time bottlenecks, and classifies issues using ML — all surfaced through a clean, real-time dashboard.

---

## 🔍 Overview

Engineering teams ship PRs every day, but rarely have visibility into *where time goes*. ReviewIQ analyzes your pull request history to surface contributor productivity, merge-time trends, and recurring issue patterns — powered by a TF-IDF + Logistic Regression classifier trained on real PR data.

## ✨ Key Features

- 📊 **Dashboard** — KPIs, merge-time trends, PR size, and issue breakdowns at a glance
- 👥 **Contributors** — Searchable, sortable leaderboard with productivity metrics
- 🐛 **Issues** — ML-classified issues with severity, explanations, and suggested fixes
- ⏱️ **Bottlenecks** — Surface PRs with abnormal merge delays and risk levels
- 🧠 **ML Classifier** — Live prediction playground with confidence + probability breakdown
- 🌙 Dark, glassmorphic UI inspired by Linear, Datadog, and Vercel

## 🛠️ Tech Stack

**Backend:** FastAPI · SQLAlchemy · SQLite/PostgreSQL · GitHub API · TF-IDF · Logistic Regression
**Frontend:** React · TypeScript · Vite · TailwindCSS · Framer Motion · Recharts · Axios

## 🚀 Quick Start

```bash
# Backend
cd reviewiq
python -m venv venv && venv\Scripts\activate   # or source venv/bin/activate
pip install -r requirements.txt
uvicorn api.main:app --reload --port 8000

# Frontend (new terminal)
cd reviewiq-frontend-app
npm install
npm run dev
```

Visit `http://localhost:5173` 🎉 — backend runs at `http://localhost:8000`.

## 📁 Project Structure

```
reviewiq/
├── api/                  # FastAPI app + routes
├── db/                   # Database models & session
├── ingestion/            # GitHub PR ingestion pipeline
├── ml/                   # TF-IDF + classifier model
├── pipeline/             # Analytics processing
└── reviewiq-frontend-app/
    └── src/
        ├── pages/        # Dashboard, Contributors, Issues, Bottlenecks, Classifier
        ├── components/   # UI primitives, charts, layout
        ├── hooks/        # Typed API data hooks
        └── services/     # Axios API client
```

## 💡 Why ReviewIQ

Most teams only *feel* their bottlenecks — slow reviews, stalled PRs, recurring bugs — without data to back it up. ReviewIQ turns raw PR history into actionable engineering insight, built to look and feel like a real production analytics product.

## 🤝 Contributing

Contributions are welcome! Fork the repo, create a feature branch, and open a PR.

## 📄 License

MIT
