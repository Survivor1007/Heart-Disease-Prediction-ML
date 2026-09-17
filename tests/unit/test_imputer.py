"""Unit tests for missing value handling and dynamic imputation."""

import pandas as pd
import numpy as np
from ml.pipeline import build_preprocessor
from ml.dataset import load_dataset, OPTIONAL_FEATURES


def test_imputation_with_missing_optional_fields():
    """Verify preprocessor successfully handles missing optional fields without NaN outputs."""
    X_train, y_train = load_dataset()
    pipeline = build_preprocessor()
    pipeline.fit(X_train)

    # Create sample with ALL optional fields missing (None / NaN)
    incomplete_sample = pd.DataFrame([{
        "age": 60,
        "sex": "male",
        "resting_bp": 140,
        "chest_pain_type": "typical_angina",
        "max_hr": 130,
        "exercise_angina": "yes",
        "cholesterol": None,
        "fasting_bs": None,
        "resting_ecg": None,
        "st_depression": None,
        "st_slope": None,
        "num_major_vessels": None,
        "thalassemia": None,
    }])

    transformed = pipeline.transform(incomplete_sample)
    
    assert transformed is not None
    assert transformed.shape[0] == 1
    # Ensure no NaN remains after imputation & scaling
    assert not np.isnan(transformed).any(), "Imputed output must not contain any NaNs"
