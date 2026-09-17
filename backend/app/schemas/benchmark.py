"""Model benchmark metrics schemas."""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field, ConfigDict


class LatencyStats(BaseModel):
    p50: float = Field(..., description="50th percentile latency (median) in ms")
    p95: float = Field(..., description="95th percentile latency in ms")
    p99: float = Field(..., description="99th percentile latency in ms")
    mean: float = Field(..., description="Mean latency in ms")


class RocPoint(BaseModel):
    fpr: float
    tpr: float


class CalibrationPoint(BaseModel):
    predicted_prob: float
    true_fraction: float


class ModelMetricItem(BaseModel):
    model_name: str
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    roc_auc: float
    brier_score: float
    confusion_matrix: List[List[int]]
    latency_ms: LatencyStats
    roc_curve: List[RocPoint]
    calibration_curve: List[CalibrationPoint]


class DatasetSummary(BaseModel):
    model_config = ConfigDict(extra="allow")

    total_samples: int
    test_samples: int
    n_features_raw: int
    n_features_transformed: int
    train_samples: Optional[int] = None
    calibration_samples: Optional[int] = None
    positive_class_rate: Optional[float] = None
    negative_class_rate: Optional[float] = None
    uploaded_rows: Optional[int] = None
    corpus_rows: Optional[int] = None
    merge_mode: Optional[str] = None


class BenchmarkResponse(BaseModel):
    dataset_summary: DatasetSummary
    models: Dict[str, ModelMetricItem]
