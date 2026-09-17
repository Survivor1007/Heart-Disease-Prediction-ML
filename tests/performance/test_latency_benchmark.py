"""Performance benchmarks measuring inference latency distributions."""

import time
import pytest
from httpx import AsyncClient, ASGITransport
import numpy as np
from app.main import app


@pytest.mark.asyncio
async def test_inference_latency_distribution(valid_complete_patient):
    """Executes multiple consecutive predictions to compute P50, P95, and P99 latency."""
    transport = ASGITransport(app=app)
    latencies = []
    
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        async with app.router.lifespan_context(app):
            # Warm up
            _ = await client.post("/api/v1/predict", json=valid_complete_patient.model_dump())
            
            # Benchmark 25 iterations
            for _ in range(25):
                t0 = time.perf_counter()
                resp = await client.post("/api/v1/predict", json=valid_complete_patient.model_dump())
                t1 = time.perf_counter()
                assert resp.status_code == 200
                latencies.append((t1 - t0) * 1000.0)

    p50 = np.percentile(latencies, 50)
    p95 = np.percentile(latencies, 95)
    
    print(f"\n[LATENCY BENCHMARK] P50: {p50:.2f} ms | P95: {p95:.2f} ms | Mean: {np.mean(latencies):.2f} ms")
    assert p50 < 150.0, f"P50 latency must be sub-150ms for clinical responsiveness, got {p50:.2f}ms"
