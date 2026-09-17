import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { BenchmarkResponse } from '../../types/benchmark';
import { Card } from '../common/Card';

interface RocCurveChartProps {
  benchmarks: BenchmarkResponse;
}

const COLORS = ['#0d9488', '#3b82f6', '#8b5cf6', '#f59e0b', '#f43f5e'];

export const RocCurveChart: React.FC<RocCurveChartProps> = ({ benchmarks }) => {
  const entries = Object.entries(benchmarks.models);
  const chartData = useMemo(() => {
    const length = Math.max(...entries.map(([, m]) => m.roc_curve.length), 1);
    const rows = [];
    for (let i = 0; i < length; i++) {
      const row: Record<string, number> = {};
      entries.forEach(([key, model]) => {
        const point = model.roc_curve[i] || model.roc_curve[model.roc_curve.length - 1];
        if (point) {
          row.fpr = point.fpr;
          row[key] = point.tpr;
        }
      });
      if (row.fpr == null) row.fpr = length > 1 ? i / (length - 1) : 0;
      row.chance = row.fpr;
      rows.push(row);
    }
    return rows;
  }, [benchmarks.models]);

  return (
    <Card className="p-6">
      <div className="pb-3 mb-4 border-b border-slate-200 dark:border-slate-800">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          ROC curves
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          True positive rate vs. false positive rate on the held-out test fold
        </p>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
            <XAxis
              dataKey="fpr"
              label={{ value: 'False positive rate', position: 'insideBottom', offset: -5, fontSize: 11, fill: '#94a3b8' }}
              tick={{ fontSize: 10, fill: '#94a3b8' }}
            />
            <YAxis
              label={{ value: 'True positive rate', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#94a3b8' }}
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              domain={[0, 1]}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            {entries.map(([key, model], idx) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                name={`${model.model_name} (AUC ${model.roc_auc})`}
                stroke={COLORS[idx % COLORS.length]}
                strokeWidth={idx === 0 ? 2.5 : 2}
                dot={false}
              />
            ))}
            <Line type="monotone" dataKey="chance" name="Chance (0.50)" stroke="#94a3b8" strokeDasharray="4 4" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
