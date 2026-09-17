# CardioLens CDSS: Clinical AI Heart Disease Diagnostic & Explainability System

A modular, multi-model Clinical Decision Support System (CDSS) for heart disease risk prediction, featuring probability calibration (Platt Scaling), local SHAP feature attribution, counterfactual "What-If" sensitivity analysis, and PostgreSQL audit persistence.

---

## 🌟 Key Features

1. **Multi-Model Consensus Engine**:
   - **Primary Model**: Calibrated XGBoost with strict hyperparameter regularization.
   - **Ensemble Check**: Calibrated Random Forest (150 estimators).
   - **Clinical Baseline**: Calibrated Logistic Regression.
   - **Probability Calibration**: 5-Fold Platt Scaling (Sigmoid) ensuring outputs reflect statistical probabilities.
2. **Dynamic Missing Data Handling**:
   - Integrated KNN imputer trained on baseline clinical distributions.
   - Transparent **Data Certainty Score** computed on the fly for missing secondary lab markers.
3. **Patient-Level Explainability (SHAP)**:
   - TreeExplainer calculates bi-directional feature attributions (Top 3 Positive Risk Drivers vs Top 3 Protective Factors).
4. **Counterfactual "What-If" Playground**:
   - Interactive sliders allowing clinicians to simulate risk reduction from BP reduction, heart rate conditioning, or ST segment improvements.
5. **Modern Multi-Tab Frontend**:
   - Built with React 18, TypeScript, Tailwind CSS v3, and Recharts.
   - Dark / Light theme with persistent toggle.
   - Progressive disclosure form with biological boundary guards.
   - One-click branded **PDF Report Export**.
6. **Automated Setup & Reproducibility**:
   - One-click setup scripts for Windows, Linux, and macOS.
   - Comprehensive test suite (`pytest`) covering unit, integration, and latency benchmarks.

---

## 🏗️ Project Architecture

```
e:\Heart Disease ML\
├── backend/
│   ├── app/
│   │   ├── api/v1/endpoints/   # predict.py, what_if.py, benchmarks.py, history.py, archetypes.py
│   │   ├── models/             # SQLAlchemy ORM models (PostgreSQL JSONB / SQLite)
│   │   ├── schemas/            # Pydantic v2 schemas with biological range validation
│   │   ├── services/           # ML inference, SHAP explainability, simulations, audit
│   │   ├── config.py           # Pydantic Settings & environment variables
│   │   ├── database.py         # Async database engine & session maker
│   │   └── main.py             # FastAPI lifespan handler & application entry point
│   ├── ml/
│   │   ├── dataset.py          # Clinical dataset loading & synthesis
│   │   ├── pipeline.py         # Dynamic KNN imputer, RobustScaler, OneHotEncoder
│   │   ├── train.py            # Multi-model training, calibration & serialization
│   │   ├── evaluate.py         # Model judgment metrics & ROC/calibration generator
│   │   └── artifacts/          # Pre-trained models, explainer & benchmark JSON
│   ├── requirements.txt        # Locked Python dependencies
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/         # Button, Card, Badge, Input, Select, Slider, Accordion, Modal
│   │   │   ├── diagnostic/     # Form, Archetypes, Gauge, Consensus, SHAP, WhatIf, PDF Report
│   │   │   ├── benchmarks/     # Model Comparison Table, ROC Curves, Calibration Plots
│   │   │   ├── history/        # Searchable Patient Audit Log
│   │   │   └── docs_view/      # Clinical Reference Guide & API Docs
│   │   ├── hooks/              # useTheme, usePrediction, useWhatIf, useBenchmarks, useHistory
│   │   ├── services/           # Typed API Client
│   │   ├── types/              # TypeScript interfaces matching backend schemas
│   │   └── App.tsx             # Multi-tab router & layout wrapper
│   └── package.json
├── tests/
│   ├── unit/                   # test_schemas.py, test_imputer.py, test_calibrator.py
│   ├── integration/            # test_predict_api.py, test_what_if_api.py, test_benchmarks_api.py
│   └── performance/            # test_latency_benchmark.py (P50/P95/P99 latency)
├── docs/                       # architecture.md, clinical_guidelines.md, api_specification.md
└── scripts/                    # setup_backend.bat, setup_frontend.bat, run_backend.bat, run_frontend.bat
```

---

## 🚀 Quickstart Guide

### 1. Automated Setup (Recommended)

#### On Windows:
```cmd
# 1. Setup Backend (Creates venv, installs dependencies & trains models)
scripts\setup_backend.bat

# 2. Setup Frontend (Installs npm dependencies)
cd frontend && npm install
```

#### On Linux / macOS:
```bash
chmod +x scripts/setup_backend.sh
./scripts/setup_backend.sh
cd frontend && npm install
```

---

### 2. Running the System

#### Start Backend:
```cmd
scripts\run_backend.bat
# Or manually:
cd backend
call venv\Scripts\activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
API Documentation: [http://localhost:8000/docs](http://localhost:8000/docs)

#### Start Frontend:
```cmd
scripts\run_frontend.bat
# Or manually:
cd frontend
npm run dev
```
Web Application: [http://localhost:5173](http://localhost:5173)

---

## 🧪 Running Tests

```cmd
cd "e:\Heart Disease ML"
backend\venv\Scripts\pytest -v tests/
```

Test Results:
- **Unit Tests**: Schema range validations, dynamic missing value imputation, probability tiering.
- **Integration Tests**: End-to-end inference, What-If perturbation, benchmarks, archetype loading.
- **Performance Benchmarks**: Sub-100ms P50 latency verification across concurrent requests.

---

## ⚙️ Environment Variables

Copy `backend/.env.example` to `backend/.env`:
```env
ENVIRONMENT=development
PROJECT_NAME="Heart Disease Clinical Decision Support System"
API_V1_STR=/api/v1
CORS_ORIGINS=["http://localhost:5173","http://localhost:3000"]
DATABASE_URL=sqlite+aiosqlite:///./heart_disease.db
MODEL_ARTIFACTS_DIR=ml/artifacts
```

> **Neon DB Setup**: For serverless PostgreSQL on Neon, simply replace `DATABASE_URL` with your Neon pooled connection string:
> `postgresql+asyncpg://<user>:<password>@<endpoint>-pooler.us-east-2.aws.neon.tech/<dbname>?ssl=require`
