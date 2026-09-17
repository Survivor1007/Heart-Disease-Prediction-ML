"""Prediction endpoint executing multi-model inference, probability calibration, and SHAP explainability."""

import uuid
import asyncio
from fastapi import APIRouter, Request, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.patient import PatientInput
from app.schemas.prediction import PredictionResponse
from app.services.inference_service import run_multi_model_inference
from app.services.explainability_service import compute_shap_explainability
from app.services.audit_service import save_prediction_log

router = APIRouter()


@router.post(
    "/predict",
    response_model=PredictionResponse,
    status_code=status.HTTP_200_OK,
    summary="Multi-Model Heart Disease Diagnostic & Explainability Assessment",
    description="Submits core vitals and optional lab markers for calibrated multi-model risk assessment and SHAP feature attribution.",
)
def predict_heart_disease(
    patient: PatientInput,
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> PredictionResponse:
    """Synchronous route dispatched automatically to worker threadpool by FastAPI for non-blocking CPU ML execution."""
    ml_models = getattr(request.app.state, "ml_models", None)
    if not ml_models or "preprocessor" not in ml_models:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="ML models are initializing or artifact pipeline is not loaded.",
        )

    # 1. Multi-model inference & calibration
    inference_result = run_multi_model_inference(patient, ml_models)

    # 2. Local SHAP explainability
    explainability_result = compute_shap_explainability(
        X_proc=inference_result["X_proc"],
        patient=patient,
        models=ml_models,
    )

    pred_id = str(uuid.uuid4())
    response = PredictionResponse(
        id=pred_id,
        timestamp=inference_result["timestamp"],
        calibrated_risk_score=inference_result["calibrated_risk_score"],
        risk_tier=inference_result["risk_tier"],
        risk_color=inference_result["risk_color"],
        imputed_fields=inference_result["imputed_fields"],
        imputed_count=inference_result["imputed_count"],
        certainty_score=inference_result["certainty_score"],
        confidence_message=inference_result["confidence_message"],
        consensus_agreement_rate=inference_result["consensus_agreement_rate"],
        models_consensus=inference_result["models_consensus"],
        explainability=explainability_result,
        input_vitals=patient,
    )

    # 3. Asynchronously persist diagnostic audit record
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            asyncio.create_task(save_prediction_log(db, patient, response))
    except Exception:
        # Non-blocking log persistence failure should not fail clinical response
        pass

    return response
