import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import { HelpCircle, TrendingUp, ShieldCheck } from 'lucide-react';
import { ExplainabilityResponse } from '../../types/prediction';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

interface ShapWaterfallProps {
  explainability: ExplainabilityResponse;
}

export const ShapWaterfall: React.FC<ShapWaterfallProps> = ({ explainability }) => {
  const chartData = explainability.all_feature_attributions.map((d) => ({
    name: d.display_name,
    impact: d.shap_value,
    percentage: d.percentage_impact,
    direction: d.direction,
    clinicalNote: d.clinical_note,
    rawVal: d.feature_value,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-3 bg-slate-900/95 text-white rounded-xl shadow-xl border border-slate-700 text-xs max-w-xs backdrop-blur-md">
          <p className="font-bold text-teal-300 mb-1">{data.name}</p>
          <div className="flex justify-between items-center gap-4 mb-2">
            <span className="text-slate-400">Observed Value:</span>
            <span className="font-mono font-semibold">{String(data.rawVal)}</span>
          </div>
          <div className="flex justify-between items-center gap-4 mb-2">
            <span className="text-slate-400">SHAP Attribution:</span>
            <span
              className={`font-mono font-bold ${
                data.impact >= 0 ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {data.impact >= 0 ? `+${data.impact}` : data.impact} ({data.percentage}%)
            </span>
          </div>
          <p className="text-[11px] text-slate-300 border-t border-slate-800 pt-1.5 leading-snug">
            {data.clinicalNote}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Patient-Level Feature Attribution (SHAP)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Bi-directional feature decomposition relative to baseline log-odds
            </p>
          </div>
        </div>
        <Badge variant="slate" size="sm">
          Base Log-Odds: {explainability.base_value}
        </Badge>
      </div>

      {/* Waterfall Chart */}
      <div className="h-72 w-full mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 90, bottom: 5 }}
          >
            <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} />
            <YAxis
              type="category"
              dataKey="name"
              width={160}
              tick={{ fontSize: 11, fill: '#64748b' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine x={0} stroke="#94a3b8" strokeDasharray="3 3" />
            <Bar dataKey="impact" radius={[4, 4, 4, 4]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.impact >= 0 ? '#f43f5e' : '#10b981'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top 3 Positive Drivers & Protective Factors Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top 3 Positive Drivers */}
        <div className="p-4 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40">
          <div className="flex items-center gap-1.5 mb-3 text-rose-700 dark:text-rose-400">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Top Risk Drivers (+ Impact)
            </span>
          </div>
          <div className="space-y-2.5">
            {explainability.top_positive_drivers.map((driver) => (
              <div
                key={driver.feature}
                className="p-2.5 rounded-lg bg-white dark:bg-slate-900/90 border border-rose-100 dark:border-rose-950 text-xs"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {driver.display_name}
                  </span>
                  <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                    +{driver.percentage_impact}%
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {driver.clinical_note}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Top 3 Protective Factors */}
        <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40">
          <div className="flex items-center gap-1.5 mb-3 text-emerald-700 dark:text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Top Protective Factors (- Impact)
            </span>
          </div>
          <div className="space-y-2.5">
            {explainability.top_protective_factors.map((factor) => (
              <div
                key={factor.feature}
                className="p-2.5 rounded-lg bg-white dark:bg-slate-900/90 border border-emerald-100 dark:border-emerald-950 text-xs"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {factor.display_name}
                  </span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {factor.percentage_impact}%
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {factor.clinical_note}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};
