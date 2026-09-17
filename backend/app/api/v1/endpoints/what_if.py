"""Counterfactual 'What-If' simulation endpoint."""

from typing import Any
from pydantic import BaseModel, Field
from fastapi import APIRouter, Request, HTTPException, status
from app.schemas.patient import PatientInput
from app.schemas.explainability import CounterfactualSimulation
from app.services.simulation_service import run_counterfactual_simulation

router = APIRouter()


class WhatIfRequest(BaseModel):
    patient: PatientInput
    parameter: str = Field(..., description="Target parameter to perturb (e.g. 'resting_bp', 'max_hr', 'cholesterol', 'st_depression')")
    simulated_value: Any = Field(..., description="Simulated value to evaluate")


@router.post(
    "/what-if",
    response_model=CounterfactualSimulation,
    status_code=status.HTTP_200_OK,
    summary="Counterfactual 'What-If' Risk Sensitivity Simulation",
    description="Simulates risk score variations when altering modifiable patient vitals or lab values in real time.",
)
def simulate_counterfactual(
    payload: WhatIfRequest,
    request: Request,
) -> CounterfactualSimulation:
    ml_models = getattr(request.app.state, "ml_models", None)
    if not ml_models:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="ML models not initialized.",
        )

    return run_counterfactual_simulation(
        patient=payload.patient,
        parameter=payload.parameter,
        simulated_value=payload.simulated_value,
        models=ml_models,
    )
