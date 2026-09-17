"""FastAPI Application Entry Point with Lifespan ML Model Caching and CORS setup."""

from contextlib import asynccontextmanager
from pathlib import Path
from typing import AsyncGenerator
import joblib
from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.database import init_db
from app.api.v1.router import api_router


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Lifespan context manager that initializes the database and preloads ML models into memory."""
    print("-------------------------------------------------------------------")
    print(f"Starting {settings.PROJECT_NAME} [{settings.ENVIRONMENT}]")
    print("-------------------------------------------------------------------")
    
    # 1. Initialize DB tables
    print("[DB] Initializing database schema...")
    try:
        await init_db()
        print("[DB] Database tables verified.")
    except Exception as e:
        print(f"[DB Warning] Could not initialize DB (will retry on query): {e}")

    # 2. Preload ML models and SHAP explainers into app.state
    artifacts_dir = Path(settings.MODEL_ARTIFACTS_DIR)
    if not artifacts_dir.exists():
        backend_root = Path(__file__).resolve().parent.parent
        artifacts_dir = backend_root / settings.MODEL_ARTIFACTS_DIR

    print(f"[ML] Loading serialized artifacts from: {artifacts_dir.resolve()} ...")
    
    # Auto-train if artifacts are missing
    if not (artifacts_dir / "preprocessor.joblib").exists():
        print("[ML] Artifacts not found. Executing automatic model training pipeline...")
        from ml.train import train_and_export_artifacts
        train_and_export_artifacts(output_dir=str(artifacts_dir))

    app.state.ml_models = {
        "preprocessor": joblib.load(artifacts_dir / "preprocessor.joblib"),
        "model_lr": joblib.load(artifacts_dir / "model_lr.joblib"),
        "model_xgb": joblib.load(artifacts_dir / "model_xgb.joblib"),
        "model_rf": joblib.load(artifacts_dir / "model_rf.joblib"),
        "calibrator_lr": joblib.load(artifacts_dir / "calibrator_lr.joblib"),
        "calibrator_xgb": joblib.load(artifacts_dir / "calibrator_xgb.joblib"),
        "calibrator_rf": joblib.load(artifacts_dir / "calibrator_rf.joblib"),
        "shap_explainer": joblib.load(artifacts_dir / "shap_explainer.joblib"),
        "feature_names": joblib.load(artifacts_dir / "feature_names.joblib"),
    }
    print("[ML] Multi-model architecture & SHAP explainer successfully loaded into memory.")
    
    yield
    
    # Shutdown / cleanup
    print("[ML] Clearing model cache on shutdown...")
    if hasattr(app.state, "ml_models"):
        app.state.ml_models.clear()


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Multi-Model Heart Disease Diagnostic & Explainability API with SHAP and Counterfactual Simulations.",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API v1 routes
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/", status_code=status.HTTP_200_OK, tags=["Health"])
def root():
    return {
        "name": settings.PROJECT_NAME,
        "version": "1.0.0",
        "status": "operational",
        "docs_url": "/docs",
        "api_v1": settings.API_V1_STR,
    }


@app.get("/health", status_code=status.HTTP_200_OK, tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "ml_engine": "ready",
    }
