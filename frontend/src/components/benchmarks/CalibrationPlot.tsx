import React from 'react';
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

export const CalibrationPlot: React.FC<CalibrationPlotProps> = ({ benchmarks }) => {
  const xgbCalib = benchmarks.models.xgboost.calibration_curve;
  const rfCalib = benchmarks.models.random_forest.calibration_curve;

  const chartData = xgbCalib.map((item, idx) => {
    const rfItem = rfCalib[idx];
    return {
      predProb: item.predicted_prob,
      xgboost: item.true_fraction,
      random_forest: rfItem ? rfItem.true_fraction : null,
      perfect: item.predicted_prob,
    };
  });

  return (
    <Card className="p-6">
      <div className="pb-3 mb-4 border-b border-slate-200 dark:border-slate-800">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Probability Calibration & Reliability Curves
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Platt Scaled Probability vs. Actual Fraction of Positive Cases (Brier Loss Check)
        </p>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
            <XAxis
              dataKey="predProb"
              label={{ value: 'Mean Predicted Probability', position: 'insideBottom', offset: -5, fontSize: 11, fill: '#94a3b8' }}
              tick={{ fontSize: 10, fill: '#94a3b8' }}
            />
            <YAxis
              label={{ value: 'Fraction of Positives', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#94a3b8' }}
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              domain={[0, 1]}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            <Line
              type="monotone"
              dataKey="xgboost"
              name={`XGBoost Platt Scaled (Brier = ${benchmarks.models.xgboost.brier_score})`}
              stroke="#0d9488"
              strokeWidth={2.5}
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="random_forest"
              name={`Random Forest Scaled (Brier = ${benchmarks.models.random_forest.brier_score})`}
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="perfect"
              name="Perfect Calibration"
              stroke="#94a3b8"
              strokeDasharray="4 4"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
