"""Unit tests for probability calibration and risk tiering boundaries."""

from app.services.inference_service import determine_risk_tier
from app.schemas.prediction import RiskTierEnum


def test_determine_risk_tier_low():
    tier, color = determine_risk_tier(0.25)
    assert tier == RiskTierEnum.LOW
    assert color == "emerald"


def test_determine_risk_tier_moderate():
    tier, color = determine_risk_tier(0.50)
    assert tier == RiskTierEnum.MODERATE
    assert color == "amber"


def test_determine_risk_tier_high():
    tier, color = determine_risk_tier(0.78)
    assert tier == RiskTierEnum.HIGH
    assert color == "rose"
