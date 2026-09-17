import React from 'react';
import { Layers, Check, AlertCircle } from 'lucide-react';
import { ModelConsensusItem } from '../../types/prediction';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

interface ConsensusMatrixProps {
  consensusItems: ModelConsensusItem[];
  agreementRate: number;
}

export const ConsensusMatrix: React.FC<ConsensusMatrixProps> = ({
  consensusItems,
  agreementRate,
}) => {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Multi-Model Consensus Matrix
          </h3>
        </div>
        <Badge variant={agreementRate >= 66.7 ? 'teal' : 'amber'} size="sm">
          {agreementRate}% Model Consensus
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {consensusItems.map((item, idx) => {
          const isPrimary = idx === 0;
          return (
            <div
              key={item.model_name}
              className={`p-3.5 rounded-xl border transition-all ${
                isPrimary
                  ? 'border-teal-500/40 bg-teal-50/30 dark:bg-teal-950/20'
                  : 'border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {item.model_name}
                </span>
                {item.agrees_with_primary ? (
                  <span className="flex items-center text-[10px] text-emerald-600 dark:text-emerald-400 font-medium gap-0.5">
                    <Check className="w-3 h-3" /> Consensus
                  </span>
                ) : (
                  <span className="flex items-center text-[10px] text-amber-600 dark:text-amber-400 font-medium gap-0.5">
                    <AlertCircle className="w-3 h-3" /> Divergence
                  </span>
                )}
              </div>

              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                  {item.predicted_probability}%
                </span>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    item.risk_tier === 'Low Risk'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : item.risk_tier === 'Moderate Risk'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                  }`}
                >
                  {item.risk_tier}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
