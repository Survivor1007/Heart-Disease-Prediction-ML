"""Inference service orchestrating dynamic imputation, multi-model scoring, calibration, and consensus."""

from datetime import datetime, timezone
from typing import Dict, Any, List, Tuple
import pandas as pd
import numpy as np

from app.schemas.patient import PatientInput
from app.schemas.prediction import PredictionResponse, ModelConsensusItem, RiskTierEnum
from ml.dataset import OPTIONAL_FEATURES, FEATURE_COLUMNS


def determine_risk_tier(probability: float) -> Tuple[RiskTierEnum, str]:
    """Classifies risk probability into clinical tiers and color tokens."""
    pct = probability * 100.0
    if pct < 35.0:
        return RiskTierEnum.LOW, "emerald"
    elif pct <= 65.0:
        return RiskTierEnum.MODERATE, "amber"
    else:
        return RiskTierEnum.HIGH, "rose"


def compute_certainty_and_imputed(patient_dict: Dict[str, Any]) -> Tuple[List[str], float, str]:
    """Identifies skipped optional features and calculates data certainty score."""
    imputed_fields = []
    for feat in OPTIONAL_FEATURES:
        val = patient_dict.get(feat)
        if val is None or val == "" or val == "null":
            imputed_fields.append(feat)

    count = len(imputed_fields)
    # Deduct ~5.3% for each missing secondary marker from 100% baseline
    certainty = max(50.0, round(100.0 - (count * 5.3), 1))
    
    if count == 0:
        confidence_msg = "Complete clinical profile provided. Maximum predictive confidence (100%)."
    else:
        confidence_msg = (
            f"Prediction calculated with {count} dynamically imputed secondary marker(s) "
            f"({', '.join(imputed_fields)}). Data certainty score: {certainty}%."
        )

    return imputed_fields, certainty, confidence_msg


def patient_to_dataframe(patient: PatientInput) -> pd.DataFrame:
    """Converts a PatientInput Pydantic object into a single-row pandas DataFrame matching ML pipeline."""
    data = patient.model_dump()
    # Align dictionary to ensure all FEATURE_COLUMNS exist
    row = {col: data.get(col, None) for col in FEATURE_COLUMNS}
    return pd.DataFrame([row])


def run_multi_model_inference(
    patient: PatientInput,
    models: Dict[str, Any],
) -> Dict[str, Any]:
    """Executes multi-model inference across calibrated XGBoost, Random Forest, and Logistic Regression."""
    pipeline = models["preprocessor"]
    calibrator_xgb = models["calibrator_xgb"]
    calibrator_rf = models["calibrator_rf"]
    calibrator_lr = models["calibrator_lr"]

    patient_dict = patient.model_dump()
    imputed_fields, certainty_score, confidence_msg = compute_certainty_and_imputed(patient_dict)
    
    df_raw = patient_to_dataframe(patient)
    X_proc = pipeline.transform(df_raw)

    # 1. Primary Model: Calibrated XGBoost
    prob_xgb = float(calibrator_xgb.predict_proba(X_proc)[0, 1])
    tier_xgb, color_xgb = determine_risk_tier(prob_xgb)

    # 2. Ensemble Check: Calibrated Random Forest
    prob_rf = float(calibrator_rf.predict_proba(X_proc)[0, 1])
    tier_rf, _ = determine_risk_tier(prob_rf)

    # 3. Baseline: Calibrated Logistic Regression
    prob_lr = float(calibrator_lr.predict_proba(X_proc)[0, 1])
    tier_lr, _ = determine_risk_tier(prob_lr)

    # Model Consensus Evaluation
    consensus_items = [
        ModelConsensusItem(
            model_name="XGBoost (Primary)",
            predicted_probability=round(prob_xgb * 100.0, 1),
            raw_probability=round(prob_xgb, 4),
            risk_tier=tier_xgb,
            agrees_with_primary=True,
        ),
        ModelConsensusItem(
            model_name="Random Forest (Ensemble Check)",
            predicted_probability=round(prob_rf * 100.0, 1),
            raw_probability=round(prob_rf, 4),
            risk_tier=tier_rf,
            agrees_with_primary=(tier_rf == tier_xgb),
        ),
        ModelConsensusItem(
            model_name="Logistic Regression (Clinical Baseline)",
            predicted_probability=round(prob_lr * 100.0, 1),
            raw_probability=round(prob_lr, 4),
            risk_tier=tier_lr,
            agrees_with_primary=(tier_lr == tier_xgb),
        ),
    ]

    agreeing_models = sum(1 for item in consensus_items if item.agrees_with_primary)
    consensus_agreement_rate = round((agreeing_models / len(consensus_items)) * 100.0, 1)

    return {
        "X_proc": X_proc,
        "calibrated_risk_score": round(prob_xgb * 100.0, 1),
        "raw_prob_xgb": prob_xgb,
        "risk_tier": tier_xgb,
        "risk_color": color_xgb,
        "imputed_fields": imputed_fields,
        "imputed_count": len(imputed_fields),
        "certainty_score": certainty_score,
        "confidence_message": confidence_msg,
        "consensus_agreement_rate": consensus_agreement_rate,
        "models_consensus": consensus_items,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
