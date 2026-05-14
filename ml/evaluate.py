import os
import sys
import logging
import joblib
import pandas as pd
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    ConfusionMatrixDisplay
)
import matplotlib.pyplot as plt

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from db.database import init_db, get_session
from db.models import PRIssue

logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")
logger = logging.getLogger(__name__)

MODEL_PATH = "ml/models/issue_type_classifier.joblib"


def evaluate():
    """
    Full evaluation report of the trained model.
    Shows precision, recall, F1 per class + confusion matrix.
    """
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError("Model not found. Run ml/trainer.py first.")

    model_data = joblib.load(MODEL_PATH)
    tfidf = model_data["tfidf"]
    clf   = model_data["classifier"]
    le    = model_data["label_encoder"]

    # Load all data
    engine  = init_db()
    session = get_session(engine)
    issues  = session.query(PRIssue).all()
    session.close()

    texts  = [f"{i.explanation} {i.suggestion}" for i in issues]
    labels = [i.issue_type for i in issues]

    X = tfidf.transform(texts)
    y_true = le.transform(labels)
    y_pred = clf.predict(X)

    print("\n" + "="*60)
    print("MODEL EVALUATION REPORT")
    print("="*60)
    print(f"Total samples: {len(texts)}")
    print(f"Classes: {list(le.classes_)}")
    print(f"Trained at: {model_data['trained_at']}")
    print(f"Test accuracy: {model_data['test_accuracy']}")
    print(f"CV F1 mean: {model_data['cv_f1_mean']}")
    print("\nClassification Report:")
    print(classification_report(
        y_true, y_pred,
        target_names=le.classes_,
        zero_division=0
    ))

    # Save confusion matrix as image
    cm = confusion_matrix(y_true, y_pred)
    disp = ConfusionMatrixDisplay(
        confusion_matrix=cm,
        display_labels=le.classes_
    )
    fig, ax = plt.subplots(figsize=(8, 6))
    disp.plot(ax=ax, cmap="Blues", colorbar=False)
    plt.title("Issue Type Classifier — Confusion Matrix")
    plt.tight_layout()

    os.makedirs("ml/models", exist_ok=True)
    plt.savefig("ml/models/confusion_matrix.png", dpi=150)
    logger.info("Confusion matrix saved to ml/models/confusion_matrix.png")
    plt.close()


if __name__ == "__main__":
    evaluate()