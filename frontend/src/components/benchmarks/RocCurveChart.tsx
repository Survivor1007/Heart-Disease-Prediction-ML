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

interface RocCurveChartProps {
  benchmarks: BenchmarkResponse;
}

export const RocCurveChart: React.FC<RocCurveChartProps> = ({ benchmarks }) => {
  const xgbCurve = benchmarks.models.xgboost.roc_curve;
  const rfCurve = benchmarks.models.random_forest.roc_curve;
  const lrCurve = benchmarks.models.logistic_regression.roc_curve;

  const length = Math.max(xgbCurve.length, rfCurve.length, lrCurve.length);
  const chartData = [];

  for (let i = 0; i < length; i++) {
    const pXgb = xgbCurve[i] || xgbCurve[xgbCurve.length - 1];
    const pRf = rfCurve[i] || rfCurve[rfCurve.length - 1];
    const pLr = lrCurve[i] || lrCurve[lrCurve.length - 1];

    chartData.push({
      fpr: pXgb ? pXgb.fpr : (i / (length - 1)),
      xgboost: pXgb ? pXgb.tpr : 1.0,
      random_forest: pRf ? pRf.tpr : 1.0,
      logistic_regression: pLr ? pLr.tpr : 1.0,
      chance: pXgb ? pXgb.fpr : (i / (length - 1)),
    });
  }

  return (
    <Card className="p-6">
      <div className="pb-3 mb-4 border-b border-slate-200 dark:border-slate-800">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Receiver Operating Characteristic (ROC Curves)
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          True Positive Rate vs. False Positive Rate across classification thresholds
        </p>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
            <XAxis
              dataKey="fpr"
              label={{ value: 'False Positive Rate (1 - Specificity)', position: 'insideBottom', offset: -5, fontSize: 11, fill: '#94a3b8' }}
              tick={{ fontSize: 10, fill: '#94a3b8' }}
            />
            <YAxis
              label={{ value: 'True Positive Rate (Sensitivity)', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#94a3b8' }}
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
              name={`XGBoost (AUC = ${benchmarks.models.xgboost.roc_auc})`}
              stroke="#0d9488"
              strokeWidth={2.5}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="random_forest"
              name={`Random Forest (AUC = ${benchmarks.models.random_forest.roc_auc})`}
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="logistic_regression"
              name={`Logistic Reg (AUC = ${benchmarks.models.logistic_regression.roc_auc})`}
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="chance"
              name="Chance Level (0.50)"
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
