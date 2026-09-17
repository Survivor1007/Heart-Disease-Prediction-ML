"""Integration tests for the /what-if simulation endpoint."""

import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_what_if_simulation_systolic_bp(valid_complete_patient):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        async with app.router.lifespan_context(app):
            response = await client.post(
                "/api/v1/what-if",
                json={
                    "patient": valid_complete_patient.model_dump(),
                    "parameter": "resting_bp",
                    "simulated_value": 115,  # Drop BP from 145 to 115
                },
            )
            assert response.status_code == 200
            data = response.json()
            assert data["parameter"] == "resting_bp"
            assert data["original_value"] == 145
            assert data["simulated_value"] == 115
            assert "risk_delta" in data
            assert "insight" in data
