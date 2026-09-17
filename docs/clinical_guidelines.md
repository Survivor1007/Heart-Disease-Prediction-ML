# Clinical Guidelines & Explainability Interpretation

## 1. Physiological Bounds & Core Vitals

| Vital Marker | Target Normal Range | Biological Validation Bounds | Clinical Relevance |
| :--- | :--- | :--- | :--- |
| **Age** | N/A | $18 - 100\text{ years}$ | Age correlates with cumulative coronary arterial calcification. |
| **Resting BP** | $< 120\text{ mm Hg}$ | $60 - 240\text{ mm Hg}$ | Chronic hypertension accelerates vascular endothelial damage. |
| **Chest Pain** | Asymptomatic / Non-anginal | Categorical (4 types) | Typical angina and asymptomatic ischemia carry higher cardiac risk. |
| **Max HR** | $\approx 220 - \text{Age}$ | $60 - 220\text{ bpm}$ | Inability to achieve age-predicted target heart rate suggests chronotropic incompetence. |
| **Exercise Angina** | None | Yes / No | Angina triggered by physical stress signifies myocardial ischemia. |

## 2. Secondary Diagnostic & Lab Panel

| Secondary Marker | Unit / Range | Clinical Description |
| :--- | :--- | :--- |
| **Serum Cholesterol** | $120 - 560\text{ mg/dL}$ | Contributes to coronary atherogenesis and plaque accumulation. |
| **Fasting Blood Sugar** | $> 120\text{ mg/dL}$ | Marker of diabetic metabolic dysfunction and microvascular risk. |
| **Resting ECG** | 3 Classes | Detects baseline repolarization abnormalities or Left Ventricular Hypertrophy (LVH). |
| **ST Depression (Oldpeak)** | $0.0 - 6.2\text{ mm}$ | Exercise-induced ST segment depression relative to baseline rest. |
| **ST Slope** | Upsloping / Flat / Downsloping | Downsloping and flat ST slopes are indicative of severe myocardial ischemia. |
| **Fluoroscopy Vessels** | $0 - 3$ | Number of major epicardial coronary arteries with $\ge 50\%$ luminal narrowing. |
| **Thallium Stress Test** | Normal / Fixed / Reversible | Reversible perfusion defects indicate salvageable ischemic myocardium. |

## 3. SHAP Feature Attribution Interpretation
- **Positive SHAP Values (Red Bars)**: Push the patient's predicted risk score **higher**.
- **Negative SHAP Values (Green Bars)**: Act as **protective factors**, pulling the risk score **lower**.
- The sum of model base expected log-odds + all SHAP attributions transforms into the final calibrated probability score.
