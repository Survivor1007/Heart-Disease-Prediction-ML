import { PatientInput } from './patient';

export type RiskTier = 'Low Risk' | 'Moderate Risk' | 'High Risk';
export type RiskColor = 'emerald' | 'amber' | 'rose';

export interface ModelConsensusItem {
  model_name: string;
  predicted_probability: number;
  raw_probability: number;
  risk_tier: RiskTier;
  agrees_with_primary: boolean;
}

export interface ShapDriverItem {
  feature: string;
  display_name: string;
  feature_value: any;
  shap_value: number;
  percentage_impact: number;
  direction: 'positive' | 'negative';
  clinical_note: string;
}

export interface CounterfactualSimulation {
  parameter: string;
  original_value: any;
  simulated_value: any;
  original_risk_score: number;
  simulated_risk_score: number;
  risk_delta: number;
  insight: string;
}

export interface ExplainabilityResponse {
  base_value: number;
  top_positive_drivers: ShapDriverItem[];
  top_protective_factors: ShapDriverItem[];
  all_feature_attributions: ShapDriverItem[];
  what_if_simulation?: CounterfactualSimulation | null;
}

export interface PredictionResponse {
  id?: string;
  timestamp: string;
  calibrated_risk_score: number;
  risk_tier: RiskTier;
  risk_color: RiskColor;
  imputed_fields: string[];
  imputed_count: number;
  certainty_score: number;
  confidence_message: string;
  consensus_agreement_rate: number;
  models_consensus: ModelConsensusItem[];
  explainability: ExplainabilityResponse;
  input_vitals: PatientInput;
}
