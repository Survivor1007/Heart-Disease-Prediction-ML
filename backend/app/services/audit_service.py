"""Audit service for logging predictions and querying diagnostic history."""

from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.models.prediction_log import PredictionLog
from app.schemas.patient import PatientInput
from app.schemas.prediction import PredictionResponse


async def save_prediction_log(
    db: AsyncSession,
    patient: PatientInput,
    prediction: PredictionResponse,
) -> PredictionLog:
    """Persists a full diagnostic assessment, input vitals, and SHAP explainability audit payload."""
    patient_dict = patient.model_dump()
    
    log_entry = PredictionLog(
        id=prediction.id,
        # Mandatory Vitals
        age=patient.age,
        sex=patient.sex,
        resting_bp=patient.resting_bp,
        chest_pain_type=patient.chest_pain_type,
        max_hr=patient.max_hr,
        exercise_angina=str(patient.exercise_angina),
        # Optional Markers
        cholesterol=patient.cholesterol,
        fasting_bs=str(patient.fasting_bs) if patient.fasting_bs is not None else None,
        resting_ecg=patient.resting_ecg,
        st_depression=patient.st_depression,
        st_slope=patient.st_slope,
        num_major_vessels=patient.num_major_vessels,
        thalassemia=patient.thalassemia,
        # Diagnostics
        calibrated_risk_score=prediction.calibrated_risk_score,
        risk_tier=prediction.risk_tier.value,
        certainty_score=prediction.certainty_score,
        imputed_fields=prediction.imputed_fields,
        consensus_summary=[item.model_dump() for item in prediction.models_consensus],
        # Explainability
        shap_positive_drivers=[d.model_dump() for d in prediction.explainability.top_positive_drivers],
        shap_protective_factors=[d.model_dump() for d in prediction.explainability.top_protective_factors],
        raw_shap_attributions=[d.model_dump() for d in prediction.explainability.all_feature_attributions],
    )

    db.add(log_entry)
    await db.commit()
    await db.refresh(log_entry)
    return log_entry


async def get_recent_logs(
    db: AsyncSession,
    limit: int = 50,
    offset: int = 0,
    risk_tier: Optional[str] = None,
) -> List[PredictionLog]:
    """Retrieves paginated historical diagnostic logs with optional risk tier filtering."""
    query = select(PredictionLog).order_by(desc(PredictionLog.created_at)).limit(limit).offset(offset)
    if risk_tier:
        query = query.where(PredictionLog.risk_tier == risk_tier)
    
    result = await db.execute(query)
    return list(result.scalars().all())
