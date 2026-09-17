"""Model performance evaluation, judgment metrics, and ROC/calibration curve endpoints."""

from fastapi import APIRouter, status
from app.schemas.benchmark import BenchmarkResponse
from app.services.benchmark_service import get_benchmark_metrics

router = APIRouter()


@router.get(
    "/benchmarks",
    response_model=BenchmarkResponse,
    status_code=status.HTTP_200_OK,
    summary="Model Judgment & Benchmark Metrics",
    description="Retrieves multi-model comparative performance: Accuracy, Precision, Recall, F1-Score, ROC-AUC, Brier score, latency distributions, and curve coordinates.",
)
def get_benchmarks() -> BenchmarkResponse:
    metrics = get_benchmark_metrics()
    return BenchmarkResponse(**metrics)
