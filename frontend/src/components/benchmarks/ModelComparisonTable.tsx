import React from 'react';
import { Award, Zap, ShieldCheck } from 'lucide-react';
import { BenchmarkResponse } from '../../types/benchmark';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

interface ModelComparisonTableProps {
  benchmarks: BenchmarkResponse;
}

export const ModelComparisonTable: React.FC<ModelComparisonTableProps> = ({ benchmarks }) => {
  const modelsList = [
    { key: 'xgboost', label: 'XGBoost (Primary Tabular)', data: benchmarks.models.xgboost, isPrimary: true },
    { key: 'random_forest', label: 'Random Forest (Ensemble Check)', data: benchmarks.models.random_forest, isPrimary: false },
    { key: 'logistic_regression', label: 'Logistic Regression (Clinical Baseline)', data: benchmarks.models.logistic_regression, isPrimary: false },
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Comparative Model Judgment Matrix
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Evaluated on held-out test cohort (N = {benchmarks.dataset_summary.test_samples} patients)
          </p>
        </div>
        <Badge variant="teal" size="sm">
          {benchmarks.dataset_summary.n_features_transformed} Transformed Features
        </Badge>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
              <th className="py-3 px-4">Model Architecture</th>
              <th className="py-3 px-4 text-center">ROC-AUC</th>
              <th className="py-3 px-4 text-center">Accuracy</th>
              <th className="py-3 px-4 text-center">Precision</th>
              <th className="py-3 px-4 text-center">Recall</th>
              <th className="py-3 px-4 text-center">F1-Score</th>
              <th className="py-3 px-4 text-center">Brier Score</th>
              <th className="py-3 px-4 text-center">P50 Latency</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
            {modelsList.map(({ key, label, data, isPrimary }) => (
              <tr
                key={key}
                className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                  isPrimary ? 'bg-teal-50/40 dark:bg-teal-950/20 font-semibold' : ''
                }`}
              >
                <td className="py-3.5 px-4 font-sans text-slate-900 dark:text-white flex items-center gap-2">
                  {isPrimary && <Award className="w-4 h-4 text-teal-600 dark:text-teal-400" />}
                  <span>{label}</span>
                </td>
                <td className="py-3.5 px-4 text-center text-teal-600 dark:text-teal-400 font-bold">
                  {(data.roc_auc * 100).toFixed(2)}%
                </td>
                <td className="py-3.5 px-4 text-center text-slate-700 dark:text-slate-300">
                  {(data.accuracy * 100).toFixed(2)}%
                </td>
                <td className="py-3.5 px-4 text-center text-slate-700 dark:text-slate-300">
                  {(data.precision * 100).toFixed(2)}%
                </td>
                <td className="py-3.5 px-4 text-center text-slate-700 dark:text-slate-300">
                  {(data.recall * 100).toFixed(2)}%
                </td>
                <td className="py-3.5 px-4 text-center text-slate-700 dark:text-slate-300">
                  {(data.f1_score * 100).toFixed(2)}%
                </td>
                <td className="py-3.5 px-4 text-center text-slate-700 dark:text-slate-300">
                  {data.brier_score.toFixed(4)}
                </td>
                <td className="py-3.5 px-4 text-center text-slate-700 dark:text-slate-300">
                  <span className="inline-flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-500" />
                    {data.latency_ms.p50.toFixed(2)} ms
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
