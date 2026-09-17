"""Patient schema definitions with strict biological range validation and archetypes."""

from typing import Optional, Literal, Union
from pydantic import BaseModel, Field, field_validator


class PatientInput(BaseModel):
    # Mandatory Core Metrics
    age: int = Field(..., ge=18, le=100, description="Patient age in years (18-100)", examples=[54])
    sex: Literal["male", "female"] = Field(..., description="Biological sex ('male' or 'female')", examples=["male"])
    resting_bp: int = Field(..., ge=60, le=240, description="Resting systolic blood pressure in mm Hg (60-240)", examples=[130])
    chest_pain_type: Literal["typical_angina", "atypical_angina", "non_anginal", "asymptomatic"] = Field(
        ..., description="Chest pain clinical classification", examples=["typical_angina"]
    )
    max_hr: int = Field(..., ge=60, le=220, description="Maximum heart rate achieved during stress test (60-220 bpm)", examples=[150])
    exercise_angina: Union[Literal["yes", "no"], bool] = Field(
        ..., description="Exercise-induced angina ('yes'/'no' or boolean)", examples=["no"]
    )

    # Optional Secondary Lab & Diagnostic Markers
    cholesterol: Optional[float] = Field(
        None, ge=80.0, le=600.0, description="Serum cholesterol in mg/dL (80-600)", examples=[240.0]
    )
    fasting_bs: Optional[Union[Literal["true", "false"], bool]] = Field(
        None, description="Fasting blood sugar > 120 mg/dL ('true'/'false' or boolean)", examples=[False]
    )
    resting_ecg: Optional[Literal["normal", "st_t_wave_abnormality", "left_ventricular_hypertrophy"]] = Field(
        None, description="Resting electrocardiogram results", examples=["normal"]
    )
    st_depression: Optional[float] = Field(
        None, ge=0.0, le=10.0, description="ST depression (oldpeak) relative to rest in mm (0.0-10.0)", examples=[1.4]
    )
    st_slope: Optional[Literal["upsloping", "flat", "downsloping"]] = Field(
        None, description="Slope of peak exercise ST segment", examples=["flat"]
    )
    num_major_vessels: Optional[int] = Field(
        None, ge=0, le=3, description="Number of major vessels colored by fluoroscopy (0-3)", examples=[0]
    )
    thalassemia: Optional[Literal["normal", "fixed_defect", "reversible_defect"]] = Field(
        None, description="Thallium stress test defect status", examples=["normal"]
    )

    @field_validator("exercise_angina", mode="before")
    @classmethod
    def normalize_exercise_angina(cls, v: Union[str, bool]) -> str:
        if isinstance(v, bool):
            return "yes" if v else "no"
        if isinstance(v, str):
            clean = v.strip().lower()
            if clean in ["yes", "true", "1", "y"]:
                return "yes"
            if clean in ["no", "false", "0", "n"]:
                return "no"
        return "no"

    @field_validator("fasting_bs", mode="before")
    @classmethod
    def normalize_fasting_bs(cls, v: Optional[Union[str, bool]]) -> Optional[str]:
        if v is None:
            return None
        if isinstance(v, bool):
            return "true" if v else "false"
        if isinstance(v, str):
            clean = v.strip().lower()
            if clean in ["true", "1", "yes", "y"]:
                return "true"
            if clean in ["false", "0", "no", "n"]:
                return "false"
        return None

    model_config = {
        "json_schema_extra": {
            "example": {
                "age": 58,
                "sex": "male",
                "resting_bp": 140,
                "chest_pain_type": "asymptomatic",
                "max_hr": 128,
                "exercise_angina": "yes",
                "cholesterol": 260.0,
                "fasting_bs": "false",
                "resting_ecg": "st_t_wave_abnormality",
                "st_depression": 2.2,
                "st_slope": "flat",
                "num_major_vessels": 1,
                "thalassemia": "reversible_defect",
            }
        }
    }


class PatientArchetype(BaseModel):
    id: str
    name: str
    tagline: str
    description: str
    expected_risk: str
    patient_data: PatientInput
