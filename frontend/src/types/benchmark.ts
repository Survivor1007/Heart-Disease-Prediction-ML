export interface LatencyStats {
  p50: number;
  p95: number;
  p99: number;
  mean: number;
}

export interface RocPoint {
  fpr: number;
  tpr: number;
}

export interface CalibrationPoint {
  predicted_prob: number;
  true_fraction: number;
}

export interface ModelMetricItem {
  model_name: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  roc_auc: number;
  brier_score: number;
  confusion_matrix: number[][];
  latency_ms: LatencyStats;
  roc_curve: RocPoint[];
  calibration_curve: CalibrationPoint[];
}

export interface DatasetSummary {
  total_samples: number;
  test_samples: number;
  n_features_raw: number;
  n_features_transformed: number;
  train_samples?: number;
  calibration_samples?: number;
  positive_class_rate?: number;
  negative_class_rate?: number;
  uploaded_rows?: number;
  corpus_rows?: number;
  merge_mode?: string;
}

export interface BenchmarkResponse {
  dataset_summary: DatasetSummary;
  models: Record<string, ModelMetricItem>;
}
