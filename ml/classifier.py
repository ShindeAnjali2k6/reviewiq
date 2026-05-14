import os
import sys
import logging
import joblib

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

logger = logging.getLogger(__name__)

MODEL_PATH = "ml/models/issue_type_classifier.joblib"

# Load model once at module level — not on every call
_model_data = None


def load_model():
    """Load the trained model from disk. Cached after first load."""
    global _model_data
    if _model_data is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(
                f"Model not found at {MODEL_PATH}. Run ml/trainer.py first."
            )
        _model_data = joblib.load(MODEL_PATH)
        logger.info(f"Model loaded — trained on {_model_data['n_samples']} samples")
    return _model_data


def predict_issue_type(explanation: str, suggestion: str) -> dict:
    """
    Predict the issue type for a given explanation and suggestion.

    Args:
        explanation: one sentence describing the problem
        suggestion:  one sentence describing the fix

    Returns:
        dict with predicted_class, confidence, and all class probabilities
    """
    model_data = load_model()

    tfidf   = model_data["tfidf"]
    clf     = model_data["classifier"]
    le      = model_data["label_encoder"]

    text = f"{explanation} {suggestion}"
    vec  = tfidf.transform([text])

    predicted_encoded = clf.predict(vec)[0]
    probabilities     = clf.predict_proba(vec)[0]

    predicted_class = le.inverse_transform([predicted_encoded])[0]
    confidence      = round(float(probabilities.max()), 3)

    class_probs = {
        le.inverse_transform([i])[0]: round(float(p), 3)
        for i, p in enumerate(probabilities)
    }

    return {
        "predicted_class": predicted_class,
        "confidence":      confidence,
        "class_probs":     class_probs
    }


def batch_predict(issues: list[dict]) -> list[dict]:
    """
    Predict issue types for a list of issues.
    Each issue dict must have 'explanation' and 'suggestion' keys.
    """
    results = []
    for issue in issues:
        prediction = predict_issue_type(
            issue.get("explanation", ""),
            issue.get("suggestion",  "")
        )
        results.append({**issue, **prediction})
    return results