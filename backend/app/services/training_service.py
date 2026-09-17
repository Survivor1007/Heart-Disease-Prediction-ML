"""Training service: accepts user-uploaded JSON data, trains/calibrates all models,
generates SHAP explainer, computes benchmark metrics, and persists artifacts."""

import time
import json
import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from typing import Dict, Any, List

from sklearn.model_selection import train_test_split
from sklearn.calibration import CalibratedClassifierCV
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
import xgboost as xgb
import shap

from app.config import settings
from app.utils.logger import get_logger
from ml.pipeline import build_preprocessor, get_feature_names_out
from ml.evaluate import compute_model_metrics
from ml.dataset import FEATURE_COLUMNS

logger = get_logger("cardiolens.training")


def train_from_dataframe(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Trains all models from the provided DataFrame and returns full benchmark metrics.

    The DataFrame must contain all FEATURE_COLUMNS plus a 'target' column (0/1).
    """
    start_time = time.perf_counter()

    logger.info(f"Training pipeline started. Dataset shape: {df.shape}")

    # Validate required columns
    required_cols = FEATURE_COLUMNS + ["target"]
    missing = [c for c in required_cols if c not in df.columns]
    if missing:
        raise ValueError(f"Uploaded dataset is missing required columns: {missing}")

    X = df[FEATURE_COLUMNS].copy()
    y = df["target"].astype(int)

    total_samples = len(X)
    pos_rate = round(float(y.mean() * 100), 2)
    neg_rate = round(100.0 - pos_rate, 2)

    if total_samples < 50:
        raise ValueError(f"Dataset too small ({total_samples} rows). Minimum 50 rows required.")

    # ── Split: 70% Train / 30% temp → 15% Calib / 15% Test ──
    X_train, X_temp, y_train, y_temp = train_test_split(
        X, y, test_size=0.30, stratify=y, random_state=42
    )
    X_calib, X_test, y_calib, y_test = train_test_split(
        X_temp, y_temp, test_size=0.50, stratify=y_temp, random_state=42
    )

    logger.info(f"Split → Train:{len(X_train)}  Calib:{len(X_calib)}  Test:{len(X_test)}")

    # ── Build & fit preprocessing pipeline ──
    pipeline = build_preprocessor()
    X_train_proc = pipeline.fit_transform(X_train)
    X_calib_proc = pipeline.transform(X_calib)
    X_test_proc = pipeline.transform(X_test)
    feature_names = get_feature_names_out(pipeline)

    logger.info(f"Preprocessor fitted. Transformed feature dimension: {len(feature_names)}")

    # ── Train base models ──
    logger.info("Training Logistic Regression...")
    model_lr = LogisticRegression(C=0.8, max_iter=1000, random_state=42)
    model_lr.fit(X_train_proc, y_train)

    logger.info("Training XGBoost Classifier...")
    model_xgb = xgb.XGBClassifier(
        n_estimators=120,
        max_depth=3,
        learning_rate=0.08,
        subsample=0.8,
        colsample_bytree=0.8,
        eval_metric="logloss",
        random_state=42,
    )
    model_xgb.fit(X_train_proc, y_train)

    logger.info("Training Random Forest Classifier...")
    model_rf = RandomForestClassifier(
        n_estimators=150,
        max_depth=6,
        min_samples_split=4,
        random_state=42,
    )
    model_rf.fit(X_train_proc, y_train)

    # ── Calibrate probabilities (5-fold Platt Scaling) ──
    logger.info("Calibrating probabilities with Platt Scaling (5-fold CV)...")
    calibrator_lr = CalibratedClassifierCV(estimator=model_lr, method="sigmoid", cv=5)
    calibrator_lr.fit(X_train_proc, y_train)

    calibrator_xgb = CalibratedClassifierCV(estimator=model_xgb, method="sigmoid", cv=5)
    calibrator_xgb.fit(X_train_proc, y_train)

    calibrator_rf = CalibratedClassifierCV(estimator=model_rf, method="sigmoid", cv=5)
    calibrator_rf.fit(X_train_proc, y_train)

    # ── SHAP TreeExplainer ──
    logger.info("Building SHAP TreeExplainer on XGBoost primary model...")
    explainer = shap.TreeExplainer(model_xgb)

    # ── Compute benchmark metrics ──
    logger.info("Computing benchmark judgment metrics on held-out test set...")
    metrics_lr = compute_model_metrics(
        "Logistic Regression", model_lr, calibrator_lr, X_test_proc, y_test.values
    )
    metrics_xgb = compute_model_metrics(
        "XGBoost (Primary)", model_xgb, calibrator_xgb, X_test_proc, y_test.values
    )
    metrics_rf = compute_model_metrics(
        "Random Forest", model_rf, calibrator_rf, X_test_proc, y_test.values
    )

    # ── Persist artifacts ──
    artifacts_dir = Path(settings.MODEL_ARTIFACTS_DIR)
    if not artifacts_dir.exists():
        backend_root = Path(__file__).resolve().parent.parent.parent
        artifacts_dir = backend_root / settings.MODEL_ARTIFACTS_DIR
    artifacts_dir.mkdir(parents=True, exist_ok=True)

    joblib.dump(pipeline,        artifacts_dir / "preprocessor.joblib")
    joblib.dump(model_lr,        artifacts_dir / "model_lr.joblib")
    joblib.dump(model_xgb,       artifacts_dir / "model_xgb.joblib")
    joblib.dump(model_rf,        artifacts_dir / "model_rf.joblib")
    joblib.dump(calibrator_lr,   artifacts_dir / "calibrator_lr.joblib")
    joblib.dump(calibrator_xgb,  artifacts_dir / "calibrator_xgb.joblib")
    joblib.dump(calibrator_rf,   artifacts_dir / "calibrator_rf.joblib")
    joblib.dump(explainer,       artifacts_dir / "shap_explainer.joblib")
    joblib.dump(feature_names,   artifacts_dir / "feature_names.joblib")

    benchmark_payload = {
        "dataset_summary": {
            "total_samples": total_samples,
            "train_samples": len(X_train),
            "calibration_samples": len(X_calib),
            "test_samples": len(X_test),
            "n_features_raw": len(FEATURE_COLUMNS),
            "n_features_transformed": len(feature_names),
            "positive_class_rate": pos_rate,
            "negative_class_rate": neg_rate,
        },
        "models": {
            "xgboost": metrics_xgb,
            "random_forest": metrics_rf,
            "logistic_regression": metrics_lr,
        },
    }

    with open(artifacts_dir / "benchmark_metrics.json", "w", encoding="utf-8") as f:
        json.dump(benchmark_payload, f, indent=2)

    elapsed = round(time.perf_counter() - start_time, 2)
    logger.info(
        f"Training complete in {elapsed}s. "
        f"XGBoost ROC-AUC={metrics_xgb['roc_auc']}, "
        f"RF ROC-AUC={metrics_rf['roc_auc']}, "
        f"LR ROC-AUC={metrics_lr['roc_auc']}"
    )

    return {
        "status": "success",
        "message": (
            f"Training completed in {elapsed}s on {total_samples} samples. "
            f"Primary model XGBoost ROC-AUC: {metrics_xgb['roc_auc']}. "
            f"All artifacts saved and hot-reloaded."
        ),
        "training_duration_seconds": elapsed,
        "artifacts_path": str(artifacts_dir.resolve()),
        "dataset_summary": benchmark_payload["dataset_summary"],
        "models": benchmark_payload["models"],
    }
