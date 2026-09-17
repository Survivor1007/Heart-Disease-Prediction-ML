"""Database ORM model for storing diagnostic assessments, inputs, and SHAP explainability audit logs."""

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, JSON
from app.database import Base


class PredictionLog(Base):
    __tablename__ = "prediction_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)

    # Mandatory Patient Vitals
    age = Column(Integer, nullable=False)
    sex = Column(String(10), nullable=False)
    resting_bp = Column(Integer, nullable=False)
    chest_pain_type = Column(String(30), nullable=False)
    max_hr = Column(Integer, nullable=False)
    exercise_angina = Column(String(5), nullable=False)

    # Optional Lab & Clinical Results (Nullable)
    cholesterol = Column(Float, nullable=True)
    fasting_bs = Column(String(10), nullable=True)
    resting_ecg = Column(String(35), nullable=True)
    st_depression = Column(Float, nullable=True)
    st_slope = Column(String(20), nullable=True)
    num_major_vessels = Column(Integer, nullable=True)
    thalassemia = Column(String(25), nullable=True)

    # Diagnostic Output & Metrics
    calibrated_risk_score = Column(Float, nullable=False)
    risk_tier = Column(String(20), nullable=False, index=True)
    certainty_score = Column(Float, nullable=False)
    imputed_fields = Column(JSON, nullable=False, default=list)
    consensus_summary = Column(JSON, nullable=False, default=list)

    # SHAP Explainability Payloads (Stored as JSON/JSONB)
    shap_positive_drivers = Column(JSON, nullable=False, default=list)
    shap_protective_factors = Column(JSON, nullable=False, default=list)
    raw_shap_attributions = Column(JSON, nullable=False, default=list)
