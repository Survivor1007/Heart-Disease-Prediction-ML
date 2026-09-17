import { RiskTier, ModelConsensusItem, ShapDriverItem } from './prediction';

export interface HistoryRecord {
  id: string;
  created_at: string;
  age: number;
  sex: string;
  resting_bp: number;
  chest_pain_type: string;
  max_hr: number;
  exercise_angina: string;
  cholesterol?: number | null;
  fasting_bs?: string | null;
  resting_ecg?: string | null;
  st_depression?: number | null;
  st_slope?: string | null;
  num_major_vessels?: number | null;
  thalassemia?: string | null;
  calibrated_risk_score: number;
  risk_tier: RiskTier;
  certainty_score: number;
  imputed_fields: string[];
  consensus_summary: ModelConsensusItem[];
  shap_positive_drivers: ShapDriverItem[];
  shap_protective_factors: ShapDriverItem[];
}
