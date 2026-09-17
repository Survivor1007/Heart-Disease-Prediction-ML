"""SHAP explainability service for patient-level feature attribution and clinical notes generation."""

from typing import Dict, Any, List, Tuple
import numpy as np
from app.schemas.patient import PatientInput
from app.schemas.explainability import ShapDriverItem, ExplainabilityResponse


FEATURE_DISPLAY_MAPPINGS = {
    "age": "Age",
    "resting_bp": "Resting Systolic Blood Pressure",
    "max_hr": "Maximum Heart Rate Achieved",
    "cholesterol": "Serum Cholesterol",
    "st_depression": "ST Depression (Oldpeak)",
    "num_major_vessels": "Major Fluoroscopy Vessels",
    "sex_male": "Biological Sex: Male",
    "sex_female": "Biological Sex: Female",
    "chest_pain_type_typical_angina": "Chest Pain: Typical Angina",
    "chest_pain_type_atypical_angina": "Chest Pain: Atypical Angina",
    "chest_pain_type_non_anginal": "Chest Pain: Non-Anginal",
    "chest_pain_type_asymptomatic": "Chest Pain: Asymptomatic Ischemia",
    "exercise_angina_yes": "Exercise-Induced Angina: Present",
    "exercise_angina_no": "Exercise-Induced Angina: None",
    "fasting_bs_true": "Fasting Blood Sugar > 120 mg/dL",
    "fasting_bs_false": "Fasting Blood Sugar Normal (<= 120 mg/dL)",
    "resting_ecg_normal": "Resting ECG: Normal",
    "resting_ecg_st_t_wave_abnormality": "Resting ECG: ST-T Wave Abnormality",
    "resting_ecg_left_ventricular_hypertrophy": "Resting ECG: LV Hypertrophy",
    "st_slope_upsloping": "ST Segment Slope: Upsloping (Normal)",
    "st_slope_flat": "ST Segment Slope: Flat (Ischemic)",
    "st_slope_downsloping": "ST Segment Slope: Downsloping (High Risk)",
    "thalassemia_normal": "Thallium Scan: Normal Blood Flow",
    "thalassemia_fixed_defect": "Thallium Scan: Fixed Defect (Previous Infarct)",
    "thalassemia_reversible_defect": "Thallium Scan: Reversible Defect (Ischemia)",
}


def generate_clinical_note(feat_name: str, shap_val: float, raw_val: Any) -> str:
    """Generates an intuitive clinical interpretation for a specific feature contribution."""
    is_pos = shap_val > 0
    if "exercise_angina_yes" in feat_name:
        return "Ischemia provoked under cardiac exertion significantly elevates risk."
    elif "chest_pain_type_asymptomatic" in feat_name:
        return "Silent/asymptomatic ischemia presentation is associated with adverse cardiac events."
    elif "st_depression" in feat_name:
        return f"ST segment depression of {raw_val} mm relative to baseline indicates myocardial strain." if is_pos else "Minimal ST segment depression indicates adequate coronary perfusion."
    elif "resting_bp" in feat_name:
        return f"Elevated systolic blood pressure ({raw_val} mm Hg) increases cardiovascular workload." if is_pos else "Optimal resting blood pressure acts protectively on vascular health."
    elif "max_hr" in feat_name:
        return f"High peak exercise heart rate ({raw_val} bpm) indicates robust chronotropic reserve." if not is_pos else "Impaired peak chronotropic response during stress testing."
    elif "cholesterol" in feat_name:
        return f"Serum cholesterol level ({raw_val} mg/dL) contributes to atherogenic plaque risk." if is_pos else "Favorable lipid profile lowers atherogenic burden."
    elif "thalassemia_reversible_defect" in feat_name:
        return "Reversible perfusion defect on stress imaging demonstrates transient regional ischemia."
    elif "num_major_vessels" in feat_name:
        return f"Fluoroscopy highlights {int(raw_val or 0)} obstructed major coronary vessels." if is_pos else "Clear coronary vessels with no significant fluoroscopic narrowing."
    elif "age" in feat_name:
        return f"Patient age ({raw_val} yrs) increases cumulative cardiovascular risk baseline." if is_pos else "Younger vascular age provides a protective baseline."
    else:
        return "Contributes to the overall predictive assessment based on clinical guidelines."


def compute_shap_explainability(
    X_proc: np.ndarray,
    patient: PatientInput,
    models: Dict[str, Any],
) -> ExplainabilityResponse:
    """Computes exact local SHAP values using TreeExplainer on the transformed patient features."""
    explainer = models["shap_explainer"]
    feature_names = models["feature_names"]

    # Compute SHAP values for single instance
    shap_vals_raw = explainer.shap_values(X_proc)
    
    # Handle array shapes for binary classification
    if isinstance(shap_vals_raw, list):
        # Multi-output list [class_0, class_1]
        shap_vector = shap_vals_raw[1][0]
    elif len(shap_vals_raw.shape) == 2:
        shap_vector = shap_vals_raw[0]
    elif len(shap_vals_raw.shape) == 3:
        shap_vector = shap_vals_raw[0, :, 1]
    else:
        shap_vector = shap_vals_raw[0]

    base_val = float(explainer.expected_value[1] if isinstance(explainer.expected_value, (list, np.ndarray)) else explainer.expected_value)

    total_abs_shap = float(np.sum(np.abs(shap_vector))) or 1.0

    patient_dict = patient.model_dump()
    all_drivers: List[ShapDriverItem] = []

    for idx, (f_name, s_val) in enumerate(zip(feature_names, shap_vector)):
        s_val_float = float(s_val)
        # Calculate percentage shift attribution
        pct_impact = round((s_val_float / total_abs_shap) * 100.0, 1)
        direction = "positive" if s_val_float >= 0 else "negative"

        # Determine original observed value if available
        base_feature = f_name.split("_")[0]
        raw_val = patient_dict.get(base_feature, "N/A")
        if f_name in patient_dict:
            raw_val = patient_dict[f_name]

        display_name = FEATURE_DISPLAY_MAPPINGS.get(f_name, f_name.replace("_", " ").title())
        clinical_note = generate_clinical_note(f_name, s_val_float, raw_val)

        all_drivers.append(
            ShapDriverItem(
                feature=f_name,
                display_name=display_name,
                feature_value=raw_val,
                shap_value=round(s_val_float, 4),
                percentage_impact=pct_impact,
                direction=direction,
                clinical_note=clinical_note,
            )
        )

    # Sort drivers
    positive_drivers = sorted([d for d in all_drivers if d.direction == "positive"], key=lambda x: x.shap_value, reverse=True)
    protective_factors = sorted([d for d in all_drivers if d.direction == "negative"], key=lambda x: x.shap_value)

    top_positive = positive_drivers[:3]
    top_protective = protective_factors[:3]

    # Full waterfall sorted by absolute impact
    all_sorted = sorted(all_drivers, key=lambda x: abs(x.shap_value), reverse=True)

    return ExplainabilityResponse(
        base_value=round(base_val, 4),
        top_positive_drivers=top_positive,
        top_protective_factors=top_protective,
        all_feature_attributions=all_sorted[:10],
    )
