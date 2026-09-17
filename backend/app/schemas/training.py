"""Training request and response schemas for the model-training upload endpoint."""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class TrainingRowSchema(BaseModel):
    """Represents a single patient row in the uploaded JSON training dataset."""
    age: int
    sex: str
    resting_bp: int
    chest_pain_type: str
    max_hr: int
    exercise_angina: str
    cholesterol: Optional[float] = None
    fasting_bs: Optional[str] = None
    resting_ecg: Optional[str] = None
    st_depression: Optional[float] = None
    st_slope: Optional[str] = None
    num_major_vessels: Optional[int] = None
    thalassemia: Optional[str] = None
    target: int = Field(..., ge=0, le=1, description="Ground truth label: 1=Heart Disease, 0=No Disease")


class TrainingUploadSchema(BaseModel):
    """Schema for the uploaded JSON training file body."""
    data: List[TrainingRowSchema] = Field(
        ...,
        min_length=50,
        description="List of patient records with ground truth labels. Minimum 50 rows required.",
    )


class LatencyStatsSchema(BaseModel):
    p50: float
    p95: float
    p99: float
    mean: float


class RocPointSchema(BaseModel):
    fpr: float
    tpr: float


class CalibrationPointSchema(BaseModel):
    predicted_prob: float
    true_fraction: float


class SingleModelMetrics(BaseModel):
    model_name: str
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    roc_auc: float
    brier_score: float
    confusion_matrix: List[List[int]]
    latency_ms: LatencyStatsSchema
    roc_curve: List[RocPointSchema]
    calibration_curve: List[CalibrationPointSchema]


class DatasetSummarySchema(BaseModel):
    total_samples: int
    train_samples: int
    calibration_samples: int
    test_samples: int
    n_features_raw: int
    n_features_transformed: int
    positive_class_rate: float
    negative_class_rate: float
    uploaded_rows: Optional[int] = None
    corpus_rows: Optional[int] = None
    merge_mode: Optional[str] = None


class TrainingResponseSchema(BaseModel):
    """Response returned after model training completes successfully."""
    status: str = "success"
    message: str
    dataset_summary: DatasetSummarySchema
    models: Dict[str, SingleModelMetrics]
    training_duration_seconds: float
    artifacts_path: str
