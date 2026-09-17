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

interface CalibrationPlotProps {
  benchmarks: BenchmarkResponse;
}

const COLORS = ['#0d9488', '#3b82f6', '#8b5cf6', '#f59e0b'];

export const CalibrationPlot: React.FC<CalibrationPlotProps> = ({ benchmarks }) => {
  const entries = Object.entries(benchmarks.models);
  const chartData = useMemo(() => {
    const longest = entries.reduce(
      (acc, [, m]) => (m.calibration_curve.length > acc.length ? m.calibration_curve : acc),
      entries[0]?.[1].calibration_curve || []
    );
    return longest.map((item, idx) => {
      const row: Record<string, number | null> = {
        predProb: item.predicted_prob,
        perfect: item.predicted_prob,
      };
      entries.forEach(([key, model]) => {
        const point = model.calibration_curve[idx];
        row[key] = point ? point.true_fraction : null;
      });
      return row;
    });
  }, [benchmarks.models]);

  return (
    <Card className="p-6">
      <div className="pb-3 mb-4 border-b border-slate-200 dark:border-slate-800">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Calibration curves
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Predicted probability vs. observed positive rate after Platt scaling
        </p>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
            <XAxis
              dataKey="predProb"
              label={{ value: 'Mean predicted probability', position: 'insideBottom', offset: -5, fontSize: 11, fill: '#94a3b8' }}
              tick={{ fontSize: 10, fill: '#94a3b8' }}
            />
            <YAxis
              label={{ value: 'Fraction of positives', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#94a3b8' }}
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
                name={`${model.model_name} (Brier ${model.brier_score})`}
                stroke={COLORS[idx % COLORS.length]}
                strokeWidth={idx === 0 ? 2.5 : 2}
                dot={{ r: 4 }}
                connectNulls
              />
            ))}
            <Line type="monotone" dataKey="perfect" name="Perfect calibration" stroke="#94a3b8" strokeDasharray="4 4" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
