"""Prediction output schemas, risk tiers, and model consensus schemas."""

from enum import Enum
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from app.schemas.patient import PatientInput
from app.schemas.explainability import ExplainabilityResponse


class RiskTierEnum(str, Enum):
    LOW = "Low Risk"
    MODERATE = "Moderate Risk"
    HIGH = "High Risk"


class ModelConsensusItem(BaseModel):
    model_name: str
    predicted_probability: float
    raw_probability: float
    risk_tier: RiskTierEnum
    agrees_with_primary: bool


class PredictionResponse(BaseModel):
    id: Optional[str] = None
    timestamp: str
    
    # Primary Risk Outcome
    calibrated_risk_score: float = Field(..., description="Calibrated risk percentage (0.0% - 100.0%)")
    risk_tier: RiskTierEnum = Field(..., description="Clinical risk classification: Low (<35%), Moderate (35-65%), High (>65%)")
    risk_color: str = Field(..., description="Tailwind / UI color token ('emerald', 'amber', 'rose')")
    
    # Imputation & Certainty Indicator
    imputed_fields: List[str] = Field(default_factory=list, description="List of optional secondary fields dynamically imputed")
    imputed_count: int = Field(0, description="Count of imputed secondary fields")
    certainty_score: float = Field(..., description="Certainty score reflecting data completeness (e.g. 84.1%)")
    confidence_message: str = Field(..., description="User-facing summary of data completeness")
    
    # Multi-Model Consensus & Agreement
    consensus_agreement_rate: float = Field(..., description="Percentage of models agreeing on risk tier (e.g. 100% or 66.7%)")
    models_consensus: List[ModelConsensusItem] = Field(..., description="Individual model predictions")
    
    # Explainability
    explainability: ExplainabilityResponse
    
    # Sanitized Input Echo
    input_vitals: PatientInput
