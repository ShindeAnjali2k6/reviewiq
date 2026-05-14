import os
import sys
import logging
import joblib
import numpy as np
import pandas as pd
from datetime import datetime
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from db.database import init_db, get_session
from db.models import PRIssue

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s"
)
logger = logging.getLogger(__name__)


def load_training_data() -> pd.DataFrame:
    """Load LLM-labelled issues from database."""
    engine = init_db()
    session = get_session(engine)
    issues = session.query(PRIssue).all()
    session.close()

    data = [{
        "text":       f"{i.explanation} {i.suggestion}",
        "issue_type": i.issue_type,
        "severity":   i.severity
    } for i in issues]

    df = pd.DataFrame(data)
    logger.info(f"Loaded {len(df)} training samples")
    logger.info(f"Class distribution:\n{df['issue_type'].value_counts()}")
    return df


def train_issue_type_classifier(df: pd.DataFrame):
    """
    Train a TF-IDF + Logistic Regression classifier.
    Logistic Regression handles imbalanced text classification
    better than Random Forest on small datasets.
    """
    X = df["text"].tolist()
    y = df["issue_type"].tolist()

    le = LabelEncoder()
    y_encoded = le.fit_transform(y)

    logger.info(f"Training on {len(X)} samples | Classes: {list(le.classes_)}")

    # Split with stratification
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_encoded,
        test_size=0.2,
        random_state=42,
        stratify=y_encoded
    )

    # TF-IDF vectorizer
    tfidf = TfidfVectorizer(
        max_features=1000,
        ngram_range=(1, 2),
        min_df=1,
        sublinear_tf=True
    )

    X_train_vec = tfidf.fit_transform(X_train)
    X_test_vec  = tfidf.transform(X_test)

    # Logistic Regression with class_weight=balanced
    # This automatically penalises majority class predictions
    clf = LogisticRegression(
        class_weight="balanced",
        max_iter=1000,
        random_state=42,
        C=1.0,
        solver="lbfgs"
    )
    clf.fit(X_train_vec, y_train)

    # Evaluate on test set
    y_pred = clf.predict(X_test_vec)
    test_score = clf.score(X_test_vec, y_test)
    logger.info(f"Test accuracy: {test_score:.3f}")

    print("\nClassification Report (Test Set):")
    print(classification_report(
        y_test, y_pred,
        target_names=le.classes_,
        zero_division=0
    ))

    # Cross-validation
    X_full_vec = tfidf.fit_transform(X)
    cv = StratifiedKFold(n_splits=3, shuffle=True, random_state=42)
    cv_scores = cross_val_score(
        clf, X_full_vec, y_encoded,
        cv=cv, scoring="f1_weighted"
    )
    logger.info(f"CV F1 scores: {cv_scores.round(3)}")
    logger.info(f"Mean CV F1: {cv_scores.mean():.3f} (+/- {cv_scores.std():.3f})")

    # Save model
    os.makedirs("ml/models", exist_ok=True)
    model_data = {
        "tfidf":         tfidf,
        "classifier":    clf,
        "label_encoder": le,
        "trained_at":    datetime.now().isoformat(),
        "n_samples":     len(X),
        "classes":       list(le.classes_),
        "cv_f1_mean":    round(float(cv_scores.mean()), 3),
        "test_accuracy": round(float(test_score), 3)
    }
    joblib.dump(model_data, "ml/models/issue_type_classifier.joblib")
    logger.info("Model saved to ml/models/issue_type_classifier.joblib")

    return model_data


if __name__ == "__main__":
    df = load_training_data()
    result = train_issue_type_classifier(df)
    print(f"\n✅ Training complete")
    print(f"   Classes:       {result['classes']}")
    print(f"   Test accuracy: {result['test_accuracy']}")
    print(f"   CV F1 (mean):  {result['cv_f1_mean']}")