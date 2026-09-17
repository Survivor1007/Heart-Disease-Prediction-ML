"""Simulation service for real-time counterfactual 'What-If' sensitivity analysis."""

from typing import Dict, Any
import copy
from app.schemas.patient import PatientInput
from app.schemas.explainability import CounterfactualSimulation
from app.services.inference_service import patient_to_dataframe


def run_counterfactual_simulation(
    patient: PatientInput,
    parameter: str,
    simulated_value: Any,
    models: Dict[str, Any],
) -> CounterfactualSimulation:
    """Simulates the clinical risk delta when a patient's modifiable vital or lab marker is adjusted."""
    pipeline = models["preprocessor"]
    calibrator_xgb = models["calibrator_xgb"]

    # Compute baseline risk
    df_original = patient_to_dataframe(patient)
    X_orig = pipeline.transform(df_original)
    orig_prob = float(calibrator_xgb.predict_proba(X_orig)[0, 1])
    orig_risk_pct = round(orig_prob * 100.0, 1)

    # Clone patient and modify specified parameter
    patient_dict = patient.model_dump()
    orig_val = patient_dict.get(parameter, "N/A")
    
    # Cast types appropriately
    if parameter in ["resting_bp", "max_hr", "age", "num_major_vessels"]:
        patient_dict[parameter] = int(simulated_value)
    elif parameter in ["cholesterol", "st_depression"]:
        patient_dict[parameter] = float(simulated_value)
    else:
        patient_dict[parameter] = simulated_value

    simulated_patient = PatientInput(**patient_dict)
    df_sim = patient_to_dataframe(simulated_patient)
    X_sim = pipeline.transform(df_sim)
    sim_prob = float(calibrator_xgb.predict_proba(X_sim)[0, 1])
    sim_risk_pct = round(sim_prob * 100.0, 1)

    risk_delta = round(sim_risk_pct - orig_risk_pct, 1)

    # Generate clinical interpretation
    if risk_delta < -2.0:
        insight = f"Adjusting {parameter.replace('_', ' ')} from {orig_val} to {simulated_value} achieves a favorable risk reduction of {abs(risk_delta)}%."
    elif risk_delta > 2.0:
        insight = f"Elevating {parameter.replace('_', ' ')} to {simulated_value} increases cardiovascular risk by +{risk_delta}%."
    else:
        insight = f"Adjusting {parameter.replace('_', ' ')} to {simulated_value} yields a marginal risk adjustment ({risk_delta}%)."

    return CounterfactualSimulation(
        parameter=parameter,
        original_value=orig_val,
        simulated_value=simulated_value,
        original_risk_score=orig_risk_pct,
        simulated_risk_score=sim_risk_pct,
        risk_delta=risk_delta,
        insight=insight,
    )
