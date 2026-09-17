"""API Version 1 Router bundling all sub-routers."""

from fastapi import APIRouter
from app.api.v1.endpoints import predict, what_if, benchmarks, history, archetypes

api_router = APIRouter()

api_router.include_router(predict.router, tags=["Diagnostic Prediction"])
api_router.include_router(what_if.router, tags=["Counterfactual Simulation"])
api_router.include_router(benchmarks.router, tags=["Model Benchmarks & Judgment Metrics"])
api_router.include_router(history.router, tags=["Patient Audit Logs"])
api_router.include_router(archetypes.router, tags=["Preset Archetypes"])
