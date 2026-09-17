# API Specification (REST v1)

Base URL: `http://localhost:8000/api/v1`

## 1. Endpoints

### `POST /predict`
Submits mandatory patient vitals and optional lab markers for multi-model risk assessment, calibration, and SHAP feature attribution.

**Request Payload:**
```json
{
  "age": 58,
  "sex": "male",
  "resting_bp": 140,
  "chest_pain_type": "asymptomatic",
  "max_hr": 128,
  "exercise_angina": "yes",
  "cholesterol": 260.0,
  "fasting_bs": "false",
  "resting_ecg": "st_t_wave_abnormality",
  "st_depression": 2.2,
  "st_slope": "flat",
  "num_major_vessels": 1,
  "thalassemia": "reversible_defect"
}
```

**Response (200 OK):**
```json
{
  "id": "7b853823-3b6d-491c-bf0d-d40b0df2b79a",
  "timestamp": "2026-09-17T07:45:00Z",
  "calibrated_risk_score": 71.4,
  "risk_tier": "High Risk",
  "risk_color": "rose",
  "imputed_fields": [],
  "imputed_count": 0,
  "certainty_score": 100.0,
  "confidence_message": "Complete clinical profile provided. Maximum predictive confidence (100%).",
  "consensus_agreement_rate": 100.0,
  "models_consensus": [
    {
      "model_name": "XGBoost (Primary)",
      "predicted_probability": 71.4,
      "raw_probability": 0.7142,
      "risk_tier": "High Risk",
      "agrees_with_primary": true
    },
    {
      "model_name": "Random Forest (Ensemble Check)",
      "predicted_probability": 68.2,
      "raw_probability": 0.6821,
      "risk_tier": "High Risk",
      "agrees_with_primary": true
    },
    {
      "model_name": "Logistic Regression (Clinical Baseline)",
      "predicted_probability": 64.8,
      "raw_probability": 0.6480,
      "risk_tier": "Moderate Risk",
      "agrees_with_primary": false
    }
  ],
  "explainability": {
    "base_value": -0.15,
    "top_positive_drivers": [
      {
        "feature": "chest_pain_type_asymptomatic",
        "display_name": "Chest Pain: Asymptomatic Ischemia",
        "feature_value": "asymptomatic",
        "shap_value": 0.84,
        "percentage_impact": 22.4,
        "direction": "positive",
        "clinical_note": "Silent/asymptomatic ischemia presentation is associated with adverse cardiac events."
      }
    ],
    "top_protective_factors": [
      {
        "feature": "fasting_bs_false",
        "display_name": "Fasting Blood Sugar Normal (<= 120 mg/dL)",
        "feature_value": "false",
        "shap_value": -0.22,
        "percentage_impact": -5.8,
        "direction": "negative",
        "clinical_note": "Contributes to the overall predictive assessment based on clinical guidelines."
      }
    ]
  }
}
```

---

### `POST /what-if`
Simulates counterfactual sensitivity analysis by perturbing a selected vital or lab parameter.

**Request Payload:**
```json
{
  "patient": { ... },
  "parameter": "resting_bp",
  "simulated_value": 120
}
```

---

### `GET /benchmarks`
Returns judgment metrics, ROC curves, calibration curves, and latency metrics across all candidate models.

---

### `GET /archetypes`
Returns list of preset clinical archetypes for rapid demo and testing.

---

### `GET /history`
Returns paginated historical diagnostic audit records stored in the database.
