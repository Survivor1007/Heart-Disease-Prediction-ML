import { BenchmarkResponse, DatasetSummary, ModelMetricItem } from './benchmark';

export type TrainingMode = 'append' | 'replace';

export interface TrainingSchema {
  accepted_formats: string[];
  json_shapes: string[];
  required_columns: string[];
  target_values: Record<string, string>;
  minimum_rows: number;
  modes: Record<string, string>;
  corpus_rows: number;
}

export interface TrainingResponse {
  status: string;
  message: string;
  dataset_summary: DatasetSummary;
  models: Record<string, ModelMetricItem>;
  training_duration_seconds: number;
  artifacts_path: string;
}

export interface LogStorageInfo {
  directory: string;
  files: { name: string; path: string; size_bytes: number }[];
  note: string;
  model_artifacts_directory?: string;
  audit_store?: string;
}

export type { BenchmarkResponse, DatasetSummary };
