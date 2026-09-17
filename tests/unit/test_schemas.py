"""Unit tests for Pydantic schema validation and biological range boundaries."""

import pytest
from pydantic import ValidationError
from app.schemas.patient import PatientInput


def test_valid_patient_schema_creation():
    """Verify standard valid inputs instantiate without error."""
    patient = PatientInput(
        age=50,
        sex="male",
        resting_bp=120,
        chest_pain_type="typical_angina",
        max_hr=160,
        exercise_angina="no",
        cholesterol=200.0,
    )
    assert patient.age == 50
    assert patient.sex == "male"
    assert patient.resting_bp == 120
    assert patient.exercise_angina == "no"


def test_invalid_age_boundary():
    """Verify age under 18 or over 100 raises ValidationError."""
    with pytest.raises(ValidationError):
        PatientInput(
            age=15,  # Too young
            sex="male",
            resting_bp=120,
            chest_pain_type="typical_angina",
            max_hr=160,
            exercise_angina="no",
        )

    with pytest.raises(ValidationError):
        PatientInput(
            age=110,  # Exceeds max
            sex="male",
            resting_bp=120,
            chest_pain_type="typical_angina",
            max_hr=160,
            exercise_angina="no",
        )


def test_invalid_blood_pressure_boundary():
    """Verify systolic BP outside [60, 240] is rejected."""
    with pytest.raises(ValidationError):
        PatientInput(
            age=50,
            sex="female",
            resting_bp=300,  # Biologically impossible / critical error
            chest_pain_type="non_anginal",
            max_hr=150,
            exercise_angina="no",
        )


def test_exercise_angina_normalization():
    """Verify boolean or various string forms are normalized to 'yes' / 'no'."""
    p_true = PatientInput(
        age=50,
        sex="male",
        resting_bp=120,
        chest_pain_type="typical_angina",
        max_hr=150,
        exercise_angina=True,
    )
    assert p_true.exercise_angina == "yes"

    p_false = PatientInput(
        age=50,
        sex="male",
        resting_bp=120,
        chest_pain_type="typical_angina",
        max_hr=150,
        exercise_angina=False,
    )
    assert p_false.exercise_angina == "no"
