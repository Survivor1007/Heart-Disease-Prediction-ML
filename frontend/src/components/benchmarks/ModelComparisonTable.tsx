import React, { useMemo } from 'react';
import { Award, Zap } from 'lucide-react';
import { BenchmarkResponse, ModelMetricItem } from '../../types/benchmark';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

interface ModelComparisonTableProps {
  benchmarks: BenchmarkResponse;
}

function formatPct(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

export const ModelComparisonTable: React.FC<ModelComparisonTableProps> = ({ benchmarks }) => {
  const modelsList = useMemo(() => {
    return Object.entries(benchmarks.models).map(([key, data], index) => ({
      key,
      data,
      isPrimary: index === 0 || key === 'xgboost',
    }));
  }, [benchmarks.models]);

  const summary = benchmarks.dataset_summary;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Held-out test metrics from this training run
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Test cohort N = {summary.test_samples}
            {summary.total_samples != null && ` · corpus ${summary.total_samples}`}
            {summary.merge_mode && ` · mode ${summary.merge_mode}`}
          </p>
        </div>
        <Badge variant="teal" size="sm">
          {summary.n_features_transformed} transformed features
        </Badge>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
              <th className="py-3 px-4">Model</th>
              <th className="py-3 px-4 text-center">ROC-AUC</th>
              <th className="py-3 px-4 text-center">Accuracy</th>
              <th className="py-3 px-4 text-center">Precision</th>
              <th className="py-3 px-4 text-center">Recall</th>
              <th className="py-3 px-4 text-center">F1</th>
              <th className="py-3 px-4 text-center">Brier</th>
              <th className="py-3 px-4 text-center">P50 latency</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
            {modelsList.map(({ key, data, isPrimary }) => (
              <tr
                key={key}
                className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                  isPrimary ? 'bg-teal-50/40 dark:bg-teal-950/20 font-semibold' : ''
                }`}
              >
                <td className="py-3.5 px-4 font-sans text-slate-900 dark:text-white">
                  <span className="inline-flex items-center gap-2">
                    {isPrimary && <Award className="w-4 h-4 text-teal-600 dark:text-teal-400" />}
                    {data.model_name}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-center text-teal-600 dark:text-teal-400 font-bold">
                  {formatPct(data.roc_auc)}
                </td>
                <td className="py-3.5 px-4 text-center text-slate-700 dark:text-slate-300">
                  {formatPct(data.accuracy)}
                </td>
                <td className="py-3.5 px-4 text-center text-slate-700 dark:text-slate-300">
                  {formatPct(data.precision)}
                </td>
                <td className="py-3.5 px-4 text-center text-slate-700 dark:text-slate-300">
                  {formatPct(data.recall)}
                </td>
                <td className="py-3.5 px-4 text-center text-slate-700 dark:text-slate-300">
                  {formatPct(data.f1_score)}
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
