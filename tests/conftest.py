"""Pytest test configuration, fixtures, and application test client setup."""

import sys
import os
from pathlib import Path
import pytest
from httpx import AsyncClient, ASGITransport

# Ensure backend directory is in sys.path
backend_path = Path(__file__).resolve().parent.parent / "backend"
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

from app.main import app
from app.schemas.patient import PatientInput


@pytest.fixture(scope="session")
def valid_complete_patient() -> PatientInput:
    """Fixture providing a complete clinical patient payload."""
    return PatientInput(
        age=58,
        sex="male",
        resting_bp=145,
        chest_pain_type="asymptomatic",
        max_hr=126,
        exercise_angina="yes",
        cholesterol=265.0,
        fasting_bs="true",
        resting_ecg="st_t_wave_abnormality",
        st_depression=2.4,
        st_slope="flat",
        num_major_vessels=2,
        thalassemia="reversible_defect",
    )


@pytest.fixture(scope="session")
def valid_core_only_patient() -> PatientInput:
    """Fixture providing only mandatory core vitals (all secondary fields omitted)."""
    return PatientInput(
        age=45,
        sex="female",
        resting_bp=118,
        chest_pain_type="non_anginal",
        max_hr=172,
        exercise_angina="no",
        cholesterol=None,
        fasting_bs=None,
        resting_ecg=None,
        st_depression=None,
        st_slope=None,
        num_major_vessels=None,
        thalassemia=None,
    )


@pytest.fixture
async def async_client():
    """Provides an asynchronous HTTP test client for FastAPI routes."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        yield client
