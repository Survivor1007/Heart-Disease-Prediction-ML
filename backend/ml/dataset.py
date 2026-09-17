"""Dataset definition, loading, and synthesis for Heart Disease prediction."""

import numpy as np
import pandas as pd
from typing import Tuple, Dict, Any, List

FEATURE_COLUMNS = [
    # Mandatory Core
    "age",
    "sex",
    "resting_bp",
    "chest_pain_type",
    "max_hr",
    "exercise_angina",
    # Optional Secondary
    "cholesterol",
    "fasting_bs",
    "resting_ecg",
    "st_depression",
    "st_slope",
    "num_major_vessels",
    "thalassemia",
]

MANDATORY_FEATURES = [
    "age",
    "sex",
    "resting_bp",
    "chest_pain_type",
    "max_hr",
    "exercise_angina",
]

OPTIONAL_FEATURES = [
    "cholesterol",
    "fasting_bs",
    "resting_ecg",
    "st_depression",
    "st_slope",
    "num_major_vessels",
    "thalassemia",
]

NUMERICAL_FEATURES = [
    "age",
    "resting_bp",
    "max_hr",
    "cholesterol",
    "st_depression",
    "num_major_vessels",
]

CATEGORICAL_FEATURES = [
    "sex",
    "chest_pain_type",
    "exercise_angina",
    "fasting_bs",
    "resting_ecg",
    "st_slope",
    "thalassemia",
]

CATEGORICAL_VALUES: Dict[str, List[str]] = {
    "sex": ["male", "female"],
    "chest_pain_type": [
        "typical_angina",
        "atypical_angina",
        "non_anginal",
        "asymptomatic",
    ],
    "exercise_angina": ["yes", "no"],
    "fasting_bs": ["true", "false"],
    "resting_ecg": [
        "normal",
        "st_t_wave_abnormality",
        "left_ventricular_hypertrophy",
    ],
    "st_slope": ["upsloping", "flat", "downsloping"],
    "thalassemia": ["normal", "fixed_defect", "reversible_defect"],
}


def generate_curated_heart_dataset(n_samples: int = 1200, random_state: int = 42) -> pd.DataFrame:
    """Generate a realistic, clinically calibrated heart disease dataset modeled after UCI Cleveland & Statlog distributions."""
    rng = np.random.default_rng(random_state)

    # Core demographic & vitals
    age = rng.integers(29, 78, size=n_samples)
    sex = rng.choice(["male", "female"], size=n_samples, p=[0.68, 0.32])
    
    # Blood pressure: correlated with age
    resting_bp = (100 + (age - 30) * 0.5 + rng.normal(15, 12, size=n_samples)).clip(90, 200).astype(int)
    
    # Chest pain: asymptomatic and typical angina carry higher clinical risk
    chest_pain_type = rng.choice(
        ["typical_angina", "atypical_angina", "non_anginal", "asymptomatic"],
        size=n_samples,
        p=[0.15, 0.20, 0.28, 0.37],
    )
    
    # Max HR: negatively correlated with age: 220 - age with variation
    max_hr = (220 - age * 0.85 + rng.normal(-10, 16, size=n_samples)).clip(70, 210).astype(int)
    
    # Exercise-induced angina
    angina_prob = np.where(chest_pain_type == "asymptomatic", 0.45, 0.25)
    exercise_angina = ["yes" if rng.random() < p else "no" for p in angina_prob]
    
    # Cholesterol: slight age correlation
    cholesterol = (180 + (age - 30) * 0.8 + rng.normal(30, 35, size=n_samples)).clip(120, 560).astype(float)
    
    # Fasting blood sugar > 120 mg/dl (~15% prevalence)
    fasting_bs = ["true" if rng.random() < 0.15 else "false" for _ in range(n_samples)]
    
    # Resting ECG
    resting_ecg = rng.choice(
        ["normal", "st_t_wave_abnormality", "left_ventricular_hypertrophy"],
        size=n_samples,
        p=[0.49, 0.46, 0.05],
    )
    
    # ST depression (Oldpeak)
    st_depression = np.abs(rng.exponential(scale=1.0, size=n_samples) + np.where(np.array(exercise_angina) == "yes", 1.2, 0.0)).clip(0.0, 6.2).round(1)
    
    # ST Slope
    st_slope = rng.choice(
        ["upsloping", "flat", "downsloping"],
        size=n_samples,
        p=[0.47, 0.46, 0.07],
    )
    
    num_major_vessels = [
        rng.choice([0, 1, 2, 3], p=[0.35, 0.30, 0.22, 0.13] if a > 55 else [0.65, 0.20, 0.10, 0.05])
        for a in age
    ]
    
    # Thalassemia
    thalassemia = rng.choice(
        ["normal", "fixed_defect", "reversible_defect"],
        size=n_samples,
        p=[0.55, 0.06, 0.39],
    )
    
    # Ground truth risk scoring based on clinical Framingham/Cleveland log-odds function
    log_odds = (
        -4.2
        + 0.045 * (age - 50)
        + 0.75 * (sex == "male")
        + 0.02 * (resting_bp - 120)
        + 0.005 * (cholesterol - 200)
        + 1.10 * (np.array(chest_pain_type) == "asymptomatic")
        + 0.50 * (np.array(chest_pain_type) == "typical_angina")
        - 0.025 * (max_hr - 150)
        + 0.95 * (np.array(exercise_angina) == "yes")
        + 0.55 * st_depression
        + 0.85 * (np.array(st_slope) == "flat")
        + 1.20 * (np.array(st_slope) == "downsloping")
        + 0.65 * np.array(num_major_vessels)
        + 1.15 * (np.array(thalassemia) == "reversible_defect")
        + 0.70 * (np.array(thalassemia) == "fixed_defect")
    )
    
    prob = 1.0 / (1.0 + np.exp(-log_odds))
    target = (rng.random(size=n_samples) < prob).astype(int)

    df = pd.DataFrame({
        "age": age,
        "sex": sex,
        "resting_bp": resting_bp,
        "chest_pain_type": chest_pain_type,
        "max_hr": max_hr,
        "exercise_angina": exercise_angina,
        "cholesterol": cholesterol,
        "fasting_bs": fasting_bs,
        "resting_ecg": resting_ecg,
        "st_depression": st_depression,
        "st_slope": st_slope,
        "num_major_vessels": num_major_vessels,
        "thalassemia": thalassemia,
        "target": target,
    })
    
    return df


def load_dataset() -> Tuple[pd.DataFrame, pd.Series]:
    """Load feature matrix X and target series y."""
    df = generate_curated_heart_dataset(n_samples=1500, random_state=42)
    X = df[FEATURE_COLUMNS]
    y = df["target"]
    return X, y
