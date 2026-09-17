"""Model training, calibration, SHAP explainer initialization, and artifact serialization pipeline."""

import os
import json
import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.calibration import CalibratedClassifierCV
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
import xgboost as xgb
import shap

from ml.dataset import load_dataset, FEATURE_COLUMNS
from ml.pipeline import build_preprocessor, get_feature_names_out
from ml.evaluate import compute_model_metrics


def train_and_export_artifacts(output_dir: str = "ml/artifacts") -> None:
    """Trains multi-model architecture, calibrates probabilities, fits SHAP explainer, and exports artifacts."""
    
    # Ensure artifacts directory exists
    artifact_path = Path(output_dir)
    artifact_path.mkdir(parents=True, exist_ok=True)

    print("[1/6] Loading curated clinical dataset...")
    X, y = load_dataset()

    # Split dataset: 70% Train, 15% Calib, 15% Test
    X_train, X_temp, y_train, y_temp = train_test_split(
        X, y, test_size=0.30, stratify=y, random_state=42
    )
    X_calib, X_test, y_calib, y_test = train_test_split(
        X_temp, y_temp, test_size=0.50, stratify=y_temp, random_state=42
    )

    print(f"Dataset split: Train={len(X_train)}, Calib={len(X_calib)}, Test={len(X_test)}")

    print("[2/6] Fitting dynamic imputation and preprocessing pipeline...")
    pipeline = build_preprocessor()
    X_train_proc = pipeline.fit_transform(X_train)
    X_calib_proc = pipeline.transform(X_calib)
    X_test_proc = pipeline.transform(X_test)
    
    feature_names = get_feature_names_out(pipeline)
    print(f"Transformed feature dimension: {len(feature_names)} features -> {feature_names}")

    print("[3/6] Training Candidate Models...")
    
    # 1. Baseline Benchmark: Logistic Regression
    print(" - Training Baseline: Logistic Regression...")
    model_lr = LogisticRegression(C=0.8, max_iter=1000, random_state=42)
    model_lr.fit(X_train_proc, y_train)

    # 2. Primary Tabular Model: XGBoost
    print(" - Training Primary Model: XGBoost Classifier...")
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

    # 3. Ensemble Robustness Check: Random Forest
    print(" - Training Ensemble Check: Random Forest Classifier...")
    model_rf = RandomForestClassifier(
        n_estimators=150,
        max_depth=6,
        min_samples_split=4,
        random_state=42,
    )
    model_rf.fit(X_train_proc, y_train)

    print("[4/6] Calibrating Probabilities with Platt Scaling (Sigmoid 5-Fold CV)...")
    calibrator_lr = CalibratedClassifierCV(estimator=model_lr, method="sigmoid", cv=5)
    calibrator_lr.fit(X_train_proc, y_train)

    calibrator_xgb = CalibratedClassifierCV(estimator=model_xgb, method="sigmoid", cv=5)
    calibrator_xgb.fit(X_train_proc, y_train)

    calibrator_rf = CalibratedClassifierCV(estimator=model_rf, method="sigmoid", cv=5)
    calibrator_rf.fit(X_train_proc, y_train)

    print("[5/6] Initializing SHAP TreeExplainer & Background Summary...")
    # Use TreeExplainer on primary model (XGBoost)
    explainer = shap.TreeExplainer(model_xgb)

    print("[6/6] Computing Model Judgment Metrics & Serialization...")
    metrics_lr = compute_model_metrics("Logistic Regression", model_lr, calibrator_lr, X_test_proc, y_test.values)
    metrics_xgb = compute_model_metrics("XGBoost (Primary)", model_xgb, calibrator_xgb, X_test_proc, y_test.values)
    metrics_rf = compute_model_metrics("Random Forest", model_rf, calibrator_rf, X_test_proc, y_test.values)

    all_metrics = {
        "dataset_summary": {
            "total_samples": len(X),
            "test_samples": len(X_test),
            "n_features_raw": len(FEATURE_COLUMNS),
            "n_features_transformed": len(feature_names),
        },
        "models": {
            "xgboost": metrics_xgb,
            "random_forest": metrics_rf,
            "logistic_regression": metrics_lr,
        },
    }

    # Save artifacts
    joblib.dump(pipeline, artifact_path / "preprocessor.joblib")
    joblib.dump(model_lr, artifact_path / "model_lr.joblib")
    joblib.dump(model_xgb, artifact_path / "model_xgb.joblib")
    joblib.dump(model_rf, artifact_path / "model_rf.joblib")
    joblib.dump(calibrator_lr, artifact_path / "calibrator_lr.joblib")
    joblib.dump(calibrator_xgb, artifact_path / "calibrator_xgb.joblib")
    joblib.dump(calibrator_rf, artifact_path / "calibrator_rf.joblib")
    joblib.dump(explainer, artifact_path / "shap_explainer.joblib")
    joblib.dump(feature_names, artifact_path / "feature_names.joblib")

    with open(artifact_path / "benchmark_metrics.json", "w", encoding="utf-8") as f:
        json.dump(all_metrics, f, indent=2)

    print("==========================================================")
    print(f"Artifacts successfully saved to {artifact_path.resolve()}")
    print(f"XGBoost ROC-AUC: {metrics_xgb['roc_auc']}, Accuracy: {metrics_xgb['accuracy']}")
    print(f"Random Forest ROC-AUC: {metrics_rf['roc_auc']}, Accuracy: {metrics_rf['accuracy']}")
    print(f"Logistic Regression ROC-AUC: {metrics_lr['roc_auc']}, Accuracy: {metrics_lr['accuracy']}")
    print("==========================================================")


if __name__ == "__main__":
    train_and_export_artifacts()
