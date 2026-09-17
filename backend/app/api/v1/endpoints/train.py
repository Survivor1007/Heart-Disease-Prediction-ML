"""Training endpoint: upload labeled JSON/CSV, continuously retrain, return live metrics."""

import joblib
from pathlib import Path

from fastapi import APIRouter, File, Form, HTTPException, Request, UploadFile, status

from app.schemas.training import TrainingResponseSchema
from app.services.training_service import (
    ACCEPTED_EXTENSIONS,
    parse_uploaded_bytes,
    train_from_dataframe,
    training_schema_payload,
)
from app.utils.logger import get_logger

router = APIRouter()
logger = get_logger("cardiolens.api.train", extra_file="training.log")


def _hot_reload(request: Request, artifacts_dir: Path) -> None:
    request.app.state.ml_models = {
        "preprocessor": joblib.load(artifacts_dir / "preprocessor.joblib"),
        "model_lr": joblib.load(artifacts_dir / "model_lr.joblib"),
        "model_xgb": joblib.load(artifacts_dir / "model_xgb.joblib"),
        "model_rf": joblib.load(artifacts_dir / "model_rf.joblib"),
        "calibrator_lr": joblib.load(artifacts_dir / "calibrator_lr.joblib"),
        "calibrator_xgb": joblib.load(artifacts_dir / "calibrator_xgb.joblib"),
        "calibrator_rf": joblib.load(artifacts_dir / "calibrator_rf.joblib"),
        "shap_explainer": joblib.load(artifacts_dir / "shap_explainer.joblib"),
        "feature_names": joblib.load(artifacts_dir / "feature_names.joblib"),
    }
    logger.info("New model artifacts hot-reloaded into application state.")


@router.get(
    "/train/schema",
    status_code=status.HTTP_200_OK,
    summary="Training file contract",
)
def get_training_schema() -> dict:
    return training_schema_payload()


@router.post(
    "/train",
    response_model=TrainingResponseSchema,
    status_code=status.HTTP_200_OK,
    summary="Upload labeled data and retrain models",
    description=(
        "Accepts JSON, JSONL, or CSV with the same columns used by this system, including a binary `target`. "
        "Default mode `append` merges the file into the stored training corpus and retrains. "
        "Mode `replace` trains only on the uploaded file. "
        "Returns the full held-out test metrics computed from this run."
    ),
)
def train_models(
    request: Request,
    file: UploadFile = File(..., description="JSON, JSONL, or CSV of labeled patient rows"),
    mode: str = Form("append"),
) -> TrainingResponseSchema:
    filename = file.filename or "upload"
    suffix = Path(filename).suffix.lower()
    logger.info(
        "Training upload received. Filename: %s, Content-Type: %s, mode: %s",
        filename,
        file.content_type,
        mode,
    )

    if suffix and suffix not in ACCEPTED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type '{suffix}'. Upload .json, .jsonl, or .csv.",
        )

    raw_bytes = file.file.read()
    if not raw_bytes:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file is empty.")

    try:
        df = parse_uploaded_bytes(raw_bytes, filename, file.content_type)
    except ValueError as exc:
        logger.warning("Failed to parse training upload: %s", exc)
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)) from exc

    try:
        result = train_from_dataframe(df, merge_mode=mode)
    except ValueError as exc:
        logger.error("Training validation error: %s", exc)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    except Exception as exc:
        logger.error("Unexpected training failure: %s", exc, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Training pipeline failed: {exc}",
        ) from exc

    try:
        _hot_reload(request, Path(result["artifacts_path"]))
    except Exception as exc:
        logger.warning("Model hot-reload failed (models still trained and saved): %s", exc)

    return TrainingResponseSchema(**result)
