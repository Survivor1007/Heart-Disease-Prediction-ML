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
import { TrendingUp, ShieldCheck, X } from 'lucide-react';
import { ExplainabilityResponse } from '../../types/prediction';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

interface ShapWaterfallProps {
  explainability: ExplainabilityResponse;
  onClose?: () => void;
}

export const ShapWaterfall: React.FC<ShapWaterfallProps> = ({ explainability, onClose }) => {
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
        <div className="p-3.5 bg-slate-900/90 text-white rounded-xl shadow-2xl border border-white/10 text-xs max-w-xs backdrop-blur-xl">
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
          <p className="text-[11px] text-slate-300 border-t border-slate-700/60 pt-1.5 leading-snug">
            {data.clinicalNote}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card
      variant="glass"
      className="p-6 relative overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-top-2"
    >
      {/* Background glow element for glass effect */}
      <div className="absolute -top-20 -left-20 w-44 h-44 bg-rose-500/10 dark:bg-rose-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-44 h-44 bg-emerald-500/10 dark:bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200/60 dark:border-white/10 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-teal-500/15 text-teal-600 dark:text-teal-400 backdrop-blur-sm border border-teal-500/20">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Patient-Level Feature Attribution (SHAP)
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Bi-directional feature decomposition relative to baseline log-odds
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="slate" size="sm">
            Base Log-Odds: {explainability.base_value}
          </Badge>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-white/40 dark:hover:bg-slate-800/60 transition-colors"
              title="Hide Section"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Waterfall Chart */}
      <div className="h-72 w-full mb-6 relative z-10">
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
        {/* Top 3 Positive Drivers */}
        <div className="p-4 rounded-xl bg-rose-500/10 dark:bg-rose-950/30 border border-rose-500/20 backdrop-blur-md">
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
                className="p-3 rounded-lg bg-white/60 dark:bg-slate-900/60 border border-white/60 dark:border-white/5 backdrop-blur-sm text-xs shadow-sm"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {driver.display_name}
                  </span>
                  <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                    +{driver.percentage_impact}%
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  {driver.clinical_note}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Top 3 Protective Factors */}
        <div className="p-4 rounded-xl bg-emerald-500/10 dark:bg-emerald-950/30 border border-emerald-500/20 backdrop-blur-md">
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
                className="p-3 rounded-lg bg-white/60 dark:bg-slate-900/60 border border-white/60 dark:border-white/5 backdrop-blur-sm text-xs shadow-sm"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {factor.display_name}
                  </span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {factor.percentage_impact}%
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
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
