"""Preset patient personas and demo archetypes for rapid clinical testing and examination."""

from typing import List
from fastapi import APIRouter, status
from app.schemas.patient import PatientArchetype, PatientInput

router = APIRouter()

PRESET_ARCHETYPES: List[PatientArchetype] = [
    PatientArchetype(
        id="healthy_runner",
        name="Healthy 25yo Runner",
        tagline="Low Risk Baseline",
        description="Young athletic individual with optimal blood pressure, high chronotropic reserve, and normal cardiac biomarkers.",
        expected_risk="Low Risk (< 35%)",
        patient_data=PatientInput(
            age=25,
            sex="female",
            resting_bp=112,
            chest_pain_type="non_anginal",
            max_hr=188,
            exercise_angina="no",
            cholesterol=165.0,
            fasting_bs="false",
            resting_ecg="normal",
            st_depression=0.0,
            st_slope="upsloping",
            num_major_vessels=0,
            thalassemia="normal",
        ),
    ),
    PatientArchetype(
        id="borderline_diabetic",
        name="Borderline 52yo Diabetic",
        tagline="Moderate Risk Warning",
        description="Middle-aged patient presenting with pre-hypertension, elevated fasting blood sugar, and mild exercise ST-segment changes.",
        expected_risk="Moderate Risk (35% - 65%)",
        patient_data=PatientInput(
            age=52,
            sex="male",
            resting_bp=138,
            chest_pain_type="atypical_angina",
            max_hr=145,
            exercise_angina="no",
            cholesterol=235.0,
            fasting_bs="true",
            resting_ecg="st_t_wave_abnormality",
            st_depression=1.2,
            st_slope="flat",
            num_major_vessels=1,
            thalassemia="normal",
        ),
    ),
    PatientArchetype(
        id="high_risk_ischemic",
        name="High-Risk 68yo with Angina",
        tagline="Critical High Risk Alert",
        description="Elderly patient with stage 2 hypertension, exercise-induced angina, multi-vessel fluoroscopic involvement, and reversible thallium perfusion defect.",
        expected_risk="High Risk (> 65%)",
        patient_data=PatientInput(
            age=68,
            sex="male",
            resting_bp=164,
            chest_pain_type="asymptomatic",
            max_hr=118,
            exercise_angina="yes",
            cholesterol=290.0,
            fasting_bs="true",
            resting_ecg="left_ventricular_hypertrophy",
            st_depression=2.8,
            st_slope="downsloping",
            num_major_vessels=2,
            thalassemia="reversible_defect",
        ),
    ),
    PatientArchetype(
        id="triage_core_only",
        name="Walk-in Triage (Core Vitals Only)",
        tagline="Dynamic Imputation Demo",
        description="Emergency walk-in patient with mandatory core vitals only. All 7 secondary lab markers are omitted to trigger MICE/KNN dynamic imputation.",
        expected_risk="Calculated with Certainty Score",
        patient_data=PatientInput(
            age=61,
            sex="male",
            resting_bp=152,
            chest_pain_type="typical_angina",
            max_hr=132,
            exercise_angina="yes",
            cholesterol=None,
            fasting_bs=None,
            resting_ecg=None,
            st_depression=None,
            st_slope=None,
            num_major_vessels=None,
            thalassemia=None,
        ),
    ),
]


@router.get(
    "/archetypes",
    response_model=List[PatientArchetype],
    status_code=status.HTTP_200_OK,
    summary="Preset Demo Patient Archetypes",
    description="Returns preconfigured clinical profiles for one-click testing across varied cardiac risk spectrums.",
)
def get_archetypes() -> List[PatientArchetype]:
    return PRESET_ARCHETYPES
