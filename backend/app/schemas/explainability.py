"""Explainability and SHAP attribution schemas."""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class ShapDriverItem(BaseModel):
    feature: str = Field(..., description="Technical feature identifier")
    display_name: str = Field(..., description="Clinically friendly feature label")
    feature_value: Any = Field(..., description="Actual observed patient value")
    shap_value: float = Field(..., description="Raw SHAP contribution to log-odds")
    percentage_impact: float = Field(..., description="Percentage risk shift attribution (e.g. +14.2% or -8.5%)")
    direction: str = Field(..., description="'positive' (risk-increasing) or 'negative' (protective)")
    clinical_note: str = Field(..., description="Actionable clinical explanation")


class CounterfactualSimulation(BaseModel):
    parameter: str = Field(..., description="Modified physiological parameter")
    original_value: Any = Field(..., description="Initial input value")
    simulated_value: Any = Field(..., description="Modified simulation value")
    original_risk_score: float = Field(..., description="Initial calibrated risk percentage")
    simulated_risk_score: float = Field(..., description="Simulated calibrated risk percentage")
    risk_delta: float = Field(..., description="Risk score change (simulated - original)")
    insight: str = Field(..., description="Clinical interpretation of the simulated adjustment")


class ExplainabilityResponse(BaseModel):
    base_value: float = Field(..., description="Model baseline expected log-odds")
    top_positive_drivers: List[ShapDriverItem] = Field(..., description="Top risk-increasing factors")
    top_protective_factors: List[ShapDriverItem] = Field(..., description="Top risk-reducing factors")
    all_feature_attributions: List[ShapDriverItem] = Field(..., description="Full sorted waterfall attributions")
    what_if_simulation: Optional[CounterfactualSimulation] = None
