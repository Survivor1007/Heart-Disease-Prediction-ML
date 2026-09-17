"""Benchmark service for retrieving model judgment metrics, ROC curves, calibration curves, and latency statistics."""

import json
from pathlib import Path
from typing import Dict, Any, Optional
from app.config import settings
from app.schemas.benchmark import BenchmarkResponse


_cached_benchmarks: Optional[Dict[str, Any]] = None


def get_benchmark_metrics() -> Optional[Dict[str, Any]]:
    """Loads and returns benchmark metrics generated during pipeline training.

    Returns ``None`` when no metrics have been produced yet (i.e. the models
    have not been trained on this instance). Metrics are only ever read from
    the ``benchmark_metrics.json`` artifact written by the training pipeline.
    """
    global _cached_benchmarks
    if _cached_benchmarks is not None:
        return _cached_benchmarks

    benchmark_path = resolve_benchmark_path()
    if benchmark_path is None:
        return None

    with open(benchmark_path, "r", encoding="utf-8") as f:
        _cached_benchmarks = json.load(f)
    return _cached_benchmarks


def resolve_benchmark_path() -> Optional[Path]:
    """Resolve the benchmark metrics JSON artifact path (checks CWD then backend root)."""
    candidate = Path(settings.MODEL_ARTIFACTS_DIR) / "benchmark_metrics.json"
    if candidate.exists():
        return candidate

    backend_root = Path(__file__).resolve().parent.parent.parent
    candidate = backend_root / settings.MODEL_ARTIFACTS_DIR / "benchmark_metrics.json"
    return candidate if candidate.exists() else None


def resolve_artifacts_dir() -> Path:
    """Resolve the ML artifacts directory (CWD-relative first, then backend root)."""
    candidate = Path(settings.MODEL_ARTIFACTS_DIR)
    if candidate.exists():
        return candidate.resolve()
    backend_root = Path(__file__).resolve().parent.parent.parent
    return (backend_root / settings.MODEL_ARTIFACTS_DIR).resolve()


def invalidate_benchmark_cache() -> None:
    """Drop the in-memory benchmark cache so the next read reloads from disk."""
    global _cached_benchmarks
    _cached_benchmarks = None
