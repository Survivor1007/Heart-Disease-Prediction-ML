import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { AlertTriangle, CheckCircle2, AlertOctagon, Info, FileText } from 'lucide-react';
import { PredictionResponse } from '../../types/prediction';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

interface RiskGaugeProps {
  prediction: PredictionResponse;
  onOpenReport: () => void;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({ prediction, onOpenReport }) => {
  const score = prediction.calibrated_risk_score;

  // Chart data for 180-degree semi circle
  const data = [
    { name: 'Risk', value: score },
    { name: 'Remaining', value: Math.max(0, 100 - score) },
  ];

  const getColor = (tier: string) => {
    switch (tier) {
      case 'Low Risk':
        return {
          primary: '#10b981', // emerald-500
          track: '#d1fae5',
          darkTrack: '#064e3b',
          badge: 'emerald' as const,
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
        };
      case 'Moderate Risk':
        return {
          primary: '#f59e0b', // amber-500
          track: '#fef3c7',
          darkTrack: '#78350f',
          badge: 'amber' as const,
          icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
        };
      case 'High Risk':
      default:
        return {
          primary: '#f43f5e', // rose-500
          track: '#ffe4e6',
          darkTrack: '#881337',
          badge: 'rose' as const,
          icon: <AlertOctagon className="w-5 h-5 text-rose-500" />,
        };
    }
  };

  const themeConfig = getColor(prediction.risk_tier);

  return (
    <Card className="p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Consensus Calibrated Risk
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Isotonic & Platt Scaled Likelihood
            </p>
          </div>
          <Badge variant={themeConfig.badge} size="md">
            {prediction.risk_tier}
          </Badge>
        </div>

        {/* Gauge Visual */}
        <div className="relative h-44 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="85%"
                startAngle={180}
                endAngle={0}
                innerRadius={65}
                outerRadius={95}
                paddingAngle={0}
                dataKey="value"
                stroke="none"
              >
                <Cell fill={themeConfig.primary} />
                <Cell fill="#e2e8f0" className="dark:fill-slate-800" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div className="absolute top-[52%] flex flex-col items-center">
            <span className="text-4xl font-extrabold tracking-tight font-mono text-slate-900 dark:text-white">
              {score}%
            </span>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5">
              Risk Probability
            </span>
          </div>
        </div>

        {/* Risk Breakdown Indicators */}
        <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-medium border-t border-slate-100 dark:border-slate-800/80 pt-3 mb-4">
          <div className="p-1.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/60">
            Low: &lt;35%
          </div>
          <div className="p-1.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/60">
            Mod: 35-65%
          </div>
          <div className="p-1.5 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/60">
            High: &gt;65%
          </div>
        </div>

        {/* Data Certainty & Imputation Alert */}
        <div className="p-3 rounded-lg bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 mb-4">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-teal-600 dark:text-teal-400 mt-0.5 shrink-0" />
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Data Certainty Score
                </span>
                <span className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400">
                  {prediction.certainty_score}%
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                {prediction.confidence_message}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Button
        variant="outline"
        size="md"
        onClick={onOpenReport}
        leftIcon={<FileText className="w-4 h-4" />}
        className="w-full"
      >
        View & Export Clinical PDF Report
      </Button>
    </Card>
  );
};
