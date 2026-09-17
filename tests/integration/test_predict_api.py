"""Integration tests for the /predict endpoint."""

import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_predict_full_payload(valid_complete_patient):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        # Trigger lifespan startup
        async with app.router.lifespan_context(app):
            response = await client.post(
                "/api/v1/predict",
                json=valid_complete_patient.model_dump(),
            )
            assert response.status_code == 200
            data = response.json()
            assert "calibrated_risk_score" in data
            assert "risk_tier" in data
            assert "explainability" in data
            assert "models_consensus" in data
            assert len(data["explainability"]["top_positive_drivers"]) > 0


@pytest.mark.asyncio
async def test_predict_partial_core_only_payload(valid_core_only_patient):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        async with app.router.lifespan_context(app):
            response = await client.post(
                "/api/v1/predict",
                json=valid_core_only_patient.model_dump(),
            )
            assert response.status_code == 200
            data = response.json()
            assert data["imputed_count"] == 7
            assert data["certainty_score"] < 100.0
            assert "imputed" in data["confidence_message"].lower()


@pytest.mark.asyncio
async def test_predict_invalid_boundary():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        response = await client.post(
            "/api/v1/predict",
            json={
                "age": 12,  # Invalid age
                "sex": "male",
                "resting_bp": 120,
                "chest_pain_type": "typical_angina",
                "max_hr": 150,
                "exercise_angina": "no",
            },
        )
        assert response.status_code == 422  # Unprocessable Entity
