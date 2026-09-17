"""Evaluation & benchmark metrics calculation for heart disease models."""

import time
import numpy as np
import pandas as pd
from typing import Dict, Any, List
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    brier_score_loss,
    roc_curve,
    confusion_matrix,
)
from sklearn.calibration import calibration_curve


def compute_model_metrics(
    model_name: str,
    model: Any,
    calibrator: Any,
    X_test_proc: np.ndarray,
    y_test: np.ndarray,
    n_latency_runs: int = 100,
) -> Dict[str, Any]:
    """Computes clinical judgement metrics: accuracy, precision, recall, f1, ROC-AUC, Brier score, and latency."""
    
    # Measure latency for single-sample inference (P50, P95, P99)
    single_sample = X_test_proc[0:1]
    latencies_ms = []
    for _ in range(n_latency_runs):
        t0 = time.perf_counter()
        if calibrator is not None:
            _ = calibrator.predict_proba(single_sample)[:, 1]
        else:
            _ = model.predict_proba(single_sample)[:, 1]
        t1 = time.perf_counter()
        latencies_ms.append((t1 - t0) * 1000.0)

    # Probabilities & Binary Predictions
    if calibrator is not None:
        y_probs = calibrator.predict_proba(X_test_proc)[:, 1]
    else:
        y_probs = model.predict_proba(X_test_proc)[:, 1]

    y_preds = (y_probs >= 0.5).astype(int)

    acc = float(accuracy_score(y_test, y_preds))
    prec = float(precision_score(y_test, y_preds, zero_division=0))
    rec = float(recall_score(y_test, y_preds, zero_division=0))
    f1 = float(f1_score(y_test, y_preds, zero_division=0))
    roc_auc = float(roc_auc_score(y_test, y_probs))
    brier = float(brier_score_loss(y_test, y_probs))

    cm = confusion_matrix(y_test, y_preds).tolist()

    # ROC curve points (sampled for smooth charts)
    fpr, tpr, _ = roc_curve(y_test, y_probs)
    # Downsample points for efficient frontend rendering
    idx_sample = np.linspace(0, len(fpr) - 1, min(30, len(fpr))).astype(int)
    roc_points = [
        {"fpr": round(float(fpr[i]), 3), "tpr": round(float(tpr[i]), 3)}
        for i in idx_sample
    ]

    # Calibration / Reliability curve
    prob_true, prob_pred = calibration_curve(y_test, y_probs, n_bins=8, strategy="uniform")
    calib_points = [
        {"predicted_prob": round(float(p), 3), "true_fraction": round(float(t), 3)}
        for p, t in zip(prob_pred, prob_true)
    ]

    return {
        "model_name": model_name,
        "accuracy": round(acc, 4),
        "precision": round(prec, 4),
        "recall": round(rec, 4),
        "f1_score": round(f1, 4),
        "roc_auc": round(roc_auc, 4),
        "brier_score": round(brier, 4),
        "confusion_matrix": cm,
        "latency_ms": {
            "p50": round(float(np.percentile(latencies_ms, 50)), 3),
            "p95": round(float(np.percentile(latencies_ms, 95)), 3),
            "p99": round(float(np.percentile(latencies_ms, 99)), 3),
            "mean": round(float(np.mean(latencies_ms)), 3),
        },
        "roc_curve": roc_points,
        "calibration_curve": calib_points,
    }
