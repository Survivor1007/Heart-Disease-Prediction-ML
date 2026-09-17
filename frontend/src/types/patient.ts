export type SexType = 'male' | 'female';

export type ChestPainType = 
  | 'typical_angina' 
  | 'atypical_angina' 
  | 'non_anginal' 
  | 'asymptomatic';

export type ExerciseAnginaType = 'yes' | 'no';

export type RestingEcgType = 
  | 'normal' 
  | 'st_t_wave_abnormality' 
  | 'left_ventricular_hypertrophy';

export type StSlopeType = 'upsloping' | 'flat' | 'downsloping';

export type ThalassemiaType = 'normal' | 'fixed_defect' | 'reversible_defect';

export interface PatientInput {
  // Mandatory Core
  age: number;
  sex: SexType;
  resting_bp: number;
  chest_pain_type: ChestPainType;
  max_hr: number;
  exercise_angina: ExerciseAnginaType;

  // Optional Secondary Markers
  cholesterol?: number | null;
  fasting_bs?: string | null;
  resting_ecg?: RestingEcgType | null;
  st_depression?: number | null;
  st_slope?: StSlopeType | null;
  num_major_vessels?: number | null;
  thalassemia?: ThalassemiaType | null;
}

export interface PatientArchetype {
  id: string;
  name: string;
  tagline: string;
  description: string;
  expected_risk: string;
  patient_data: PatientInput;
}
