import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import logging

from db.database import init_db, get_session
from db.models import PullRequest, PRIssue
from pipeline.analytics import (
    load_prs_as_dataframe,
    get_contributor_stats,
    get_pr_size_distribution,
    get_daily_activity,
    get_review_bottlenecks,
    get_summary_metrics
)
from ml.classifier import predict_issue_type

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="ReviewIQ API",
    description="AI-powered Pull Request Analytics Platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Models ────────────────────────────────────────────────────

class PredictRequest(BaseModel):
    explanation: str
    suggestion:  str

class PredictResponse(BaseModel):
    predicted_class: str
    confidence:      float
    class_probs:     dict


# ── Core routes ───────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.get("/api/summary")
def get_summary():
    try:
        df = load_prs_as_dataframe()
        return get_summary_metrics(df)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/contributors")
def get_contributors():
    try:
        df = load_prs_as_dataframe()
        stats = get_contributor_stats(df)
        return stats.to_dict(orient="records")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/bottlenecks")
def get_bottlenecks():
    try:
        df = load_prs_as_dataframe()
        bn = get_review_bottlenecks(df)
        return bn.to_dict(orient="records")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/issues")
def get_issues():
    try:
        engine = init_db()
        session = get_session(engine)
        issues = session.query(PRIssue).all()
        session.close()
        return [{
            "pr_id":       i.github_pr_id,
            "issue_type":  i.issue_type,
            "severity":    i.severity,
            "explanation": i.explanation,
            "suggestion":  i.suggestion
        } for i in issues]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/issues/summary")
def get_issues_summary():
    try:
        engine = init_db()
        session = get_session(engine)
        issues = session.query(PRIssue).all()
        session.close()
        by_type = {}
        by_severity = {}
        for i in issues:
            by_type[i.issue_type]   = by_type.get(i.issue_type, 0) + 1
            by_severity[i.severity] = by_severity.get(i.severity, 0) + 1
        return {
            "total":       len(issues),
            "by_type":     by_type,
            "by_severity": by_severity
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/predict", response_model=PredictResponse)
def predict(request: PredictRequest):
    try:
        result = predict_issue_type(request.explanation, request.suggestion)
        return result
    except FileNotFoundError:
        raise HTTPException(status_code=503, detail="ML model not trained yet.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))