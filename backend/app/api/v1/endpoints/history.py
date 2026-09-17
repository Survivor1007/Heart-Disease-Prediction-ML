"""Historical diagnostic assessment and audit log endpoints."""

from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.services.audit_service import get_recent_logs

router = APIRouter()


@router.get(
    "/history",
    status_code=status.HTTP_200_OK,
    summary="Diagnostic History & Audit Records",
    description="Fetches paginated historical diagnostic logs, risk classifications, and SHAP feature attributions.",
)
async def get_history(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    risk_tier: Optional[str] = Query(None, description="Optional filter by risk tier"),
    db: AsyncSession = Depends(get_db),
):
    logs = await get_recent_logs(db=db, limit=limit, offset=offset, risk_tier=risk_tier)
    return [
        {
            "id": log.id,
            "created_at": log.created_at.isoformat() if log.created_at else None,
            "age": log.age,
            "sex": log.sex,
            "resting_bp": log.resting_bp,
            "chest_pain_type": log.chest_pain_type,
            "max_hr": log.max_hr,
            "exercise_angina": log.exercise_angina,
            "cholesterol": log.cholesterol,
            "fasting_bs": log.fasting_bs,
            "resting_ecg": log.resting_ecg,
            "st_depression": log.st_depression,
            "st_slope": log.st_slope,
            "num_major_vessels": log.num_major_vessels,
            "thalassemia": log.thalassemia,
            "calibrated_risk_score": log.calibrated_risk_score,
            "risk_tier": log.risk_tier,
            "certainty_score": log.certainty_score,
            "imputed_fields": log.imputed_fields,
            "consensus_summary": log.consensus_summary,
            "shap_positive_drivers": log.shap_positive_drivers,
            "shap_protective_factors": log.shap_protective_factors,
        }
        for log in logs
    ]
