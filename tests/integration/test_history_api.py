"""Integration tests for the /history endpoint and prediction audit logging."""

import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_history_audit_trail_after_prediction(valid_complete_patient):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        async with app.router.lifespan_context(app):
            # 1. Run a prediction
            pred_resp = await client.post(
                "/api/v1/predict",
                json=valid_complete_patient.model_dump(),
            )
            assert pred_resp.status_code == 200
            pred_data = pred_resp.json()
            pred_id = pred_data["id"]

            # 2. Fetch history and verify the prediction was recorded
            hist_resp = await client.get("/api/v1/history")
            assert hist_resp.status_code == 200
            history_items = hist_resp.json()
            assert isinstance(history_items, list)
            assert len(history_items) > 0

            # 3. Find the recorded log by ID
            matching = [item for item in history_items if item["id"] == pred_id]
            assert len(matching) == 1, f"Prediction with ID {pred_id} should be present in history"
            log = matching[0]
            assert log["age"] == valid_complete_patient.age
            assert log["resting_bp"] == valid_complete_patient.resting_bp
            assert log["calibrated_risk_score"] == pred_data["calibrated_risk_score"]
            assert log["risk_tier"] == pred_data["risk_tier"]
            assert len(log["shap_positive_drivers"]) > 0
