import React from 'react';
import { Layers, Check, AlertCircle, X } from 'lucide-react';
import { ModelConsensusItem } from '../../types/prediction';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

interface ConsensusMatrixProps {
  consensusItems: ModelConsensusItem[];
  agreementRate: number;
  onClose?: () => void;
}

export const ConsensusMatrix: React.FC<ConsensusMatrixProps> = ({
  consensusItems,
  agreementRate,
  onClose,
}) => {
  return (
    <Card
      variant="glass"
      className="p-6 relative overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-top-2"
    >
      {/* Background glow element for glass effect */}
      <div className="absolute -top-16 -right-16 w-36 h-36 bg-teal-500/10 dark:bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-indigo-500/10 dark:bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200/60 dark:border-white/10 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-teal-500/15 text-teal-600 dark:text-teal-400 backdrop-blur-sm border border-teal-500/20">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Multi-Model Consensus Matrix
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Cross-architecture confidence & tier agreement check
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={agreementRate >= 66.7 ? 'teal' : 'amber'} size="sm">
            {agreementRate}% Model Agreement
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 relative z-10">
        {consensusItems.map((item, idx) => {
          const isPrimary = idx === 0;
          return (
            <div
              key={item.model_name}
              className={`p-4 rounded-xl backdrop-blur-md transition-all duration-200 ${
                isPrimary
                  ? 'border border-teal-500/40 bg-teal-500/10 dark:bg-teal-950/30 shadow-[0_4px_20px_-4px_rgba(20,184,166,0.15)]'
                  : 'border border-white/60 dark:border-white/10 bg-white/40 dark:bg-slate-800/40 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {item.model_name}
                </span>
                {item.agrees_with_primary ? (
                  <span className="flex items-center text-[10px] text-emerald-600 dark:text-emerald-400 font-medium gap-0.5 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                    <Check className="w-3 h-3" /> Consensus
                  </span>
                ) : (
                  <span className="flex items-center text-[10px] text-amber-600 dark:text-amber-400 font-medium gap-0.5 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                    <AlertCircle className="w-3 h-3" /> Divergence
                  </span>
                )}
              </div>

              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                  {item.predicted_probability}%
                </span>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                    item.risk_tier === 'Low Risk'
                      ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30'
                      : item.risk_tier === 'Moderate Risk'
                      ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30'
                      : 'bg-rose-500/15 text-rose-800 dark:text-rose-300 border-rose-500/30'
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
