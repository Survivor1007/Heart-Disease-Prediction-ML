"""Training service: parse uploaded datasets, optionally merge with the stored corpus,
train/calibrate all models, compute live metrics, and persist artifacts."""

import io
import json
import time
from pathlib import Path
from typing import Any, Dict, Optional, Tuple

import joblib
import pandas as pd
from sklearn.calibration import CalibratedClassifierCV
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
import shap
import xgboost as xgb

from app.services.benchmark_service import invalidate_benchmark_cache, resolve_artifacts_dir
from app.utils.logger import get_logger
from ml.dataset import FEATURE_COLUMNS
from ml.evaluate import compute_model_metrics
from ml.pipeline import build_preprocessor, get_feature_names_out

logger = get_logger("cardiolens.training", extra_file="training.log")

CORPUS_FILENAME = "training_corpus.csv"
MIN_TRAINING_ROWS = 50
ACCEPTED_EXTENSIONS = {".json", ".jsonl", ".ndjson", ".csv"}


def parse_uploaded_bytes(raw_bytes: bytes, filename: Optional[str], content_type: Optional[str]) -> pd.DataFrame:
    """Parse JSON, JSON-lines, or CSV bytes into a DataFrame."""
    name = (filename or "").lower()
    ctype = (content_type or "").lower()

    is_csv = name.endswith(".csv") or "csv" in ctype
    is_jsonl = name.endswith(".jsonl") or name.endswith(".ndjson")

    if is_csv:
        try:
            return pd.read_csv(io.BytesIO(raw_bytes))
        except Exception as exc:
            raise ValueError(f"Could not parse CSV file: {exc}") from exc

    text = raw_bytes.decode("utf-8-sig")
    if is_jsonl:
        try:
            return pd.read_json(io.StringIO(text), lines=True)
        except Exception as exc:
            raise ValueError(f"Could not parse JSONL file: {exc}") from exc

    try:
        payload = json.loads(text)
    except Exception as exc:
        raise ValueError(f"Could not parse JSON file: {exc}") from exc

    if isinstance(payload, list):
        rows = payload
    elif isinstance(payload, dict):
        if "data" in payload and isinstance(payload["data"], list):
            rows = payload["data"]
        elif "records" in payload and isinstance(payload["records"], list):
            rows = payload["records"]
        else:
            raise ValueError(
                'JSON must be a list of records, or an object with a "data" (or "records") array. '
                'Example: {"data": [{"age": 50, "sex": "male", ..., "target": 1}]}'
            )
    else:
        raise ValueError("JSON root must be an array of patient records or an object wrapping that array.")

    try:
        return pd.DataFrame(rows)
    except Exception as exc:
        raise ValueError(f"Could not convert uploaded rows to a table: {exc}") from exc


def validate_training_frame(df: pd.DataFrame) -> pd.DataFrame:
    required_cols = FEATURE_COLUMNS + ["target"]
    missing_cols = [c for c in required_cols if c not in df.columns]
    if missing_cols:
        raise ValueError(
            f"Dataset is missing required columns: {missing_cols}. Required: {required_cols}"
        )

    frame = df[required_cols].copy()
    frame["target"] = pd.to_numeric(frame["target"], errors="coerce")
    frame = frame.dropna(subset=["target"])
    frame["target"] = frame["target"].astype(int)

    if not set(frame["target"].unique()).issubset({0, 1}):
        raise ValueError("The 'target' column must only contain binary values: 0 (no disease) or 1 (heart disease).")

    return frame


def load_training_corpus() -> Optional[pd.DataFrame]:
    path = resolve_artifacts_dir() / CORPUS_FILENAME
    if not path.exists():
        return None
    return pd.read_csv(path)


def persist_training_corpus(df: pd.DataFrame) -> Path:
    path = resolve_artifacts_dir() / CORPUS_FILENAME
    df.to_csv(path, index=False)
    logger.info("Training corpus saved (%s rows) -> %s", len(df), path)
    return path


def merge_with_corpus(new_df: pd.DataFrame, mode: str) -> Tuple[pd.DataFrame, int, int]:
    """Return (combined_frame, uploaded_rows, corpus_rows_after_merge)."""
    uploaded = len(new_df)
    mode = (mode or "append").lower().strip()
    if mode not in {"append", "replace"}:
        raise ValueError("Training mode must be 'append' (keep learning on new data) or 'replace' (train only on this file).")

    if mode == "append":
        existing = load_training_corpus()
        if existing is not None and len(existing) > 0:
            combined = pd.concat([existing, new_df], ignore_index=True)
            combined = combined.drop_duplicates()
            logger.info(
                "Appended %s new rows to existing corpus of %s (deduped to %s).",
                uploaded,
                len(existing),
                len(combined),
            )
        else:
            combined = new_df
    else:
        combined = new_df
        logger.info("Replace mode: training only on the uploaded %s rows.", uploaded)

    return combined, uploaded, len(combined)


def train_from_dataframe(df: pd.DataFrame, merge_mode: str = "append") -> Dict[str, Any]:
    """Train all models from labeled rows and return the metrics computed on the held-out test set."""
    start_time = time.perf_counter()
    labeled = validate_training_frame(df)
    combined, uploaded_rows, corpus_rows = merge_with_corpus(labeled, merge_mode)

    if corpus_rows < MIN_TRAINING_ROWS:
        raise ValueError(
            f"Combined training set is too small ({corpus_rows} rows). "
            f"Need at least {MIN_TRAINING_ROWS} labeled rows (upload more, or append to the existing corpus)."
        )

    persist_training_corpus(combined)

    logger.info("Training pipeline started. Dataset shape: %s (mode=%s)", combined.shape, merge_mode)

    X = combined[FEATURE_COLUMNS].copy()
    y = combined["target"].astype(int)

    total_samples = len(X)
    pos_rate = round(float(y.mean() * 100), 2)
    neg_rate = round(100.0 - pos_rate, 2)

    X_train, X_temp, y_train, y_temp = train_test_split(
        X, y, test_size=0.30, stratify=y, random_state=42
    )
    X_calib, X_test, y_calib, y_test = train_test_split(
        X_temp, y_temp, test_size=0.50, stratify=y_temp, random_state=42
    )

    logger.info("Split -> Train:%s  Calib:%s  Test:%s", len(X_train), len(X_calib), len(X_test))

    pipeline = build_preprocessor()
    X_train_proc = pipeline.fit_transform(X_train)
    X_calib_proc = pipeline.transform(X_calib)
    X_test_proc = pipeline.transform(X_test)
    feature_names = get_feature_names_out(pipeline)

    logger.info("Preprocessor fitted. Transformed feature dimension: %s", len(feature_names))

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

    logger.info("Calibrating probabilities with Platt Scaling (5-fold CV)...")
    calibrator_lr = CalibratedClassifierCV(estimator=model_lr, method="sigmoid", cv=5)
    calibrator_lr.fit(X_train_proc, y_train)

    calibrator_xgb = CalibratedClassifierCV(estimator=model_xgb, method="sigmoid", cv=5)
    calibrator_xgb.fit(X_train_proc, y_train)

    calibrator_rf = CalibratedClassifierCV(estimator=model_rf, method="sigmoid", cv=5)
    calibrator_rf.fit(X_train_proc, y_train)

    logger.info("Building SHAP TreeExplainer on XGBoost primary model...")
    explainer = shap.TreeExplainer(model_xgb)

    logger.info("Computing benchmark metrics on held-out test set...")
    metrics_lr = compute_model_metrics(
        "Logistic Regression", model_lr, calibrator_lr, X_test_proc, y_test.values
    )
    metrics_xgb = compute_model_metrics(
        "XGBoost (Primary)", model_xgb, calibrator_xgb, X_test_proc, y_test.values
    )
    metrics_rf = compute_model_metrics(
        "Random Forest", model_rf, calibrator_rf, X_test_proc, y_test.values
    )

    artifacts_dir = resolve_artifacts_dir()

    joblib.dump(pipeline, artifacts_dir / "preprocessor.joblib")
    joblib.dump(model_lr, artifacts_dir / "model_lr.joblib")
    joblib.dump(model_xgb, artifacts_dir / "model_xgb.joblib")
    joblib.dump(model_rf, artifacts_dir / "model_rf.joblib")
    joblib.dump(calibrator_lr, artifacts_dir / "calibrator_lr.joblib")
    joblib.dump(calibrator_xgb, artifacts_dir / "calibrator_xgb.joblib")
    joblib.dump(calibrator_rf, artifacts_dir / "calibrator_rf.joblib")
    joblib.dump(explainer, artifacts_dir / "shap_explainer.joblib")
    joblib.dump(feature_names, artifacts_dir / "feature_names.joblib")

    dataset_summary = {
        "total_samples": total_samples,
        "train_samples": len(X_train),
        "calibration_samples": len(X_calib),
        "test_samples": len(X_test),
        "n_features_raw": len(FEATURE_COLUMNS),
        "n_features_transformed": len(feature_names),
        "positive_class_rate": pos_rate,
        "negative_class_rate": neg_rate,
        "uploaded_rows": uploaded_rows,
        "corpus_rows": corpus_rows,
        "merge_mode": merge_mode,
    }

    benchmark_payload = {
        "dataset_summary": dataset_summary,
        "models": {
            "xgboost": metrics_xgb,
            "random_forest": metrics_rf,
            "logistic_regression": metrics_lr,
        },
    }

    with open(artifacts_dir / "benchmark_metrics.json", "w", encoding="utf-8") as f:
        json.dump(benchmark_payload, f, indent=2)

    invalidate_benchmark_cache()

    elapsed = round(time.perf_counter() - start_time, 2)
    logger.info(
        "Training complete in %ss. XGBoost ROC-AUC=%s, RF ROC-AUC=%s, LR ROC-AUC=%s",
        elapsed,
        metrics_xgb["roc_auc"],
        metrics_rf["roc_auc"],
        metrics_lr["roc_auc"],
    )

    return {
        "status": "success",
        "message": (
            f"Training completed in {elapsed}s on {total_samples} samples "
            f"(uploaded {uploaded_rows}, corpus {corpus_rows}, mode={merge_mode}). "
            f"Primary model XGBoost ROC-AUC: {metrics_xgb['roc_auc']}."
        ),
        "training_duration_seconds": elapsed,
        "artifacts_path": str(artifacts_dir.resolve()),
        "dataset_summary": dataset_summary,
        "models": benchmark_payload["models"],
    }


def training_schema_payload() -> Dict[str, Any]:
    return {
        "accepted_formats": ["json", "jsonl", "csv"],
        "json_shapes": [
            '[{"age": 54, "...": "...", "target": 1}]',
            '{"data": [{"age": 54, "...": "...", "target": 1}]}',
        ],
        "required_columns": FEATURE_COLUMNS + ["target"],
        "target_values": {"0": "no heart disease", "1": "heart disease present"},
        "minimum_rows": MIN_TRAINING_ROWS,
        "modes": {
            "append": "Merge this file with all previously uploaded training rows, then retrain.",
            "replace": "Discard the stored corpus and train only on this file.",
        },
        "corpus_rows": len(load_training_corpus()) if load_training_corpus() is not None else 0,
    }
