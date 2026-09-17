"""Integration tests for the /benchmarks and /archetypes endpoints."""

import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_get_benchmarks():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        response = await client.get("/api/v1/benchmarks")
        assert response.status_code == 200
        data = response.json()
        assert "models" in data
        assert "xgboost" in data["models"]
        assert "random_forest" in data["models"]
        assert "logistic_regression" in data["models"]
        assert "latency_ms" in data["models"]["xgboost"]
        assert "roc_curve" in data["models"]["xgboost"]


@pytest.mark.asyncio
async def test_get_archetypes():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        response = await client.get("/api/v1/archetypes")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 3
        assert "patient_data" in data[0]
