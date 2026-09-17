"""Constants for CardioLens CDSS — clinical thresholds, risk tiers, and application defaults."""

from enum import Enum


# ---- Risk Tier Thresholds ----
RISK_TIER_LOW_MAX = 35.0       # < 35% → Low Risk
RISK_TIER_HIGH_MIN = 65.0      # > 65% → High Risk
# 35–65% → Moderate Risk

# ---- Certainty Score Calculation ----
OPTIONAL_FEATURE_CERTAINTY_PENALTY = 5.3   # % deducted per missing secondary field
CERTAINTY_SCORE_MIN = 50.0                 # Floor for certainty score


# ---- Risk Color Tokens (Tailwind) ----
class RiskColor(str, Enum):
    LOW = "emerald"
    MODERATE = "amber"
    HIGH = "rose"


# ---- Optional Feature Labels (for audit display) ----
OPTIONAL_FEATURE_LABELS: dict[str, str] = {
    "cholesterol": "Serum Cholesterol",
    "fasting_bs": "Fasting Blood Sugar",
    "resting_ecg": "Resting ECG",
    "st_depression": "ST Depression (Oldpeak)",
    "st_slope": "ST Slope",
    "num_major_vessels": "Major Fluoroscopy Vessels",
    "thalassemia": "Thallium Stress Test",
}


# ---- Model Keys ----
MODEL_KEY_XGB = "calibrator_xgb"
MODEL_KEY_RF = "calibrator_rf"
MODEL_KEY_LR = "calibrator_lr"
PREPROCESSOR_KEY = "preprocessor"
SHAP_EXPLAINER_KEY = "shap_explainer"
FEATURE_NAMES_KEY = "feature_names"
