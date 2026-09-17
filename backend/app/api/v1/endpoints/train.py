"""Training endpoint: accepts a JSON file upload, trains models, returns full benchmark metrics."""

import json
import io
import joblib
from pathlib import Path

import pandas as pd
from fastapi import APIRouter, UploadFile, File, Request, HTTPException, status

from app.config import settings
from app.utils.logger import get_logger
from app.schemas.training import TrainingResponseSchema
from app.services.training_service import train_from_dataframe
from ml.dataset import FEATURE_COLUMNS

router = APIRouter()
logger = get_logger("cardiolens.api.train")


@router.post(
    "/train",
    response_model=TrainingResponseSchema,
    status_code=status.HTTP_200_OK,
    summary="Upload JSON Dataset & Retrain All Models",
    description=(
        "Accepts a JSON file containing patient records with ground truth labels. "
        "Trains XGBoost, Random Forest, and Logistic Regression models with Platt Scaling calibration, "
        "generates SHAP explainer, serializes artifacts, and returns complete judgment metrics. "
        "\n\n**JSON format:** `{\"data\": [{\"age\": ..., \"target\": 0|1, ...}, ...]}`"
    ),
)
def train_models(
    request: Request,
    file: UploadFile = File(..., description="JSON file with a 'data' key containing patient rows"),
) -> TrainingResponseSchema:
    """CPU-bound route — FastAPI dispatches to worker thread automatically."""
    logger.info(f"Training upload received. Filename: {file.filename}, Content-Type: {file.content_type}")

    # ── Validate file type ──
    if not (file.filename or "").endswith(".json") and file.content_type not in (
        "application/json",
        "text/plain",
        "text/json",
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only JSON files are accepted. Please upload a .json file.",
        )

    # ── Read and parse JSON ──
    try:
        raw_bytes = file.file.read()
        payload = json.loads(raw_bytes.decode("utf-8"))
    except Exception as exc:
        logger.warning(f"Failed to parse uploaded JSON file: {exc}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Could not parse JSON file: {exc}",
        )

    # ── Extract rows ──
    if isinstance(payload, list):
        rows = payload
    elif isinstance(payload, dict) and "data" in payload:
        rows = payload["data"]
    else:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                "JSON file must either be a list of records OR an object with a 'data' key. "
                'Example: {"data": [{"age": 50, "sex": "male", ..., "target": 1}]}'
            ),
        )

    if len(rows) < 50:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Dataset too small: {len(rows)} rows. Minimum 50 rows are required for training.",
        )

    # ── Convert to DataFrame ──
    try:
        df = pd.DataFrame(rows)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Could not convert JSON rows to DataFrame: {exc}",
        )

    # ── Validate required columns ──
    required_cols = FEATURE_COLUMNS + ["target"]
    missing_cols = [c for c in required_cols if c not in df.columns]
    if missing_cols:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Dataset is missing required columns: {missing_cols}. Required: {required_cols}",
        )

    # ── Validate target column ──
    if not set(df["target"].dropna().unique()).issubset({0, 1}):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="The 'target' column must only contain binary values: 0 (no disease) or 1 (heart disease).",
        )

    logger.info(f"Training dataset validated: {len(df)} rows, target distribution: {df['target'].value_counts().to_dict()}")

    # ── Run training pipeline ──
    try:
        result = train_from_dataframe(df)
    except ValueError as exc:
        logger.error(f"Training validation error: {exc}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    except Exception as exc:
        logger.error(f"Unexpected training failure: {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Training pipeline failed: {exc}",
        )

    # ── Hot-reload trained artifacts into app state ──
    try:
        artifacts_dir = Path(result["artifacts_path"])
        request.app.state.ml_models = {
            "preprocessor": joblib.load(artifacts_dir / "preprocessor.joblib"),
            "model_lr":      joblib.load(artifacts_dir / "model_lr.joblib"),
            "model_xgb":     joblib.load(artifacts_dir / "model_xgb.joblib"),
            "model_rf":      joblib.load(artifacts_dir / "model_rf.joblib"),
            "calibrator_lr":  joblib.load(artifacts_dir / "calibrator_lr.joblib"),
            "calibrator_xgb": joblib.load(artifacts_dir / "calibrator_xgb.joblib"),
            "calibrator_rf":  joblib.load(artifacts_dir / "calibrator_rf.joblib"),
            "shap_explainer": joblib.load(artifacts_dir / "shap_explainer.joblib"),
            "feature_names":  joblib.load(artifacts_dir / "feature_names.joblib"),
        }
        logger.info("New model artifacts hot-reloaded into application state.")
    except Exception as exc:
        logger.warning(f"Model hot-reload failed (models still trained & saved): {exc}")

    return TrainingResponseSchema(**result)
