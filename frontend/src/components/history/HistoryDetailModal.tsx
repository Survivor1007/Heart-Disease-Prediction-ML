import React from 'react';
import { HistoryRecord } from '../../types/history';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';

interface HistoryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: HistoryRecord;
}

export const HistoryDetailModal: React.FC<HistoryDetailModalProps> = ({
  isOpen,
  onClose,
  record,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Audit Record: ${record.id.slice(0, 13)}`} maxWidth="2xl">
      <div className="space-y-6 text-xs">
        {/* Risk Overview */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex justify-between items-center">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Predicted Risk</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                {record.calibrated_risk_score}%
              </span>
              <Badge
                variant={
                  record.risk_tier === 'Low Risk'
                    ? 'emerald'
                    : record.risk_tier === 'Moderate Risk'
                    ? 'amber'
                    : 'rose'
                }
              >
                {record.risk_tier}
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400">Certainty Score</span>
            <p className="text-base font-bold font-mono text-teal-600 dark:text-teal-400">
              {record.certainty_score}%
            </p>
          </div>
        </div>

        {/* Vitals Summary */}
        <div>
          <h4 className="font-bold text-slate-700 dark:text-slate-300 uppercase text-[11px] mb-2">
            Recorded Vitals & Lab Markers
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <div className="p-2 rounded bg-slate-100/70 dark:bg-slate-800/40">
              <span className="text-slate-400 block text-[10px]">Age / Sex</span>
              <span className="font-semibold">{record.age} yrs &bull; {record.sex}</span>
            </div>
            <div className="p-2 rounded bg-slate-100/70 dark:bg-slate-800/40">
              <span className="text-slate-400 block text-[10px]">Resting Blood Pressure</span>
              <span className="font-semibold">{record.resting_bp} mm Hg</span>
            </div>
            <div className="p-2 rounded bg-slate-100/70 dark:bg-slate-800/40">
              <span className="text-slate-400 block text-[10px]">Chest Pain Classification</span>
              <span className="font-semibold">{record.chest_pain_type.replace('_', ' ')}</span>
            </div>
            <div className="p-2 rounded bg-slate-100/70 dark:bg-slate-800/40">
              <span className="text-slate-400 block text-[10px]">Max Heart Rate</span>
              <span className="font-semibold">{record.max_hr} bpm</span>
            </div>
            <div className="p-2 rounded bg-slate-100/70 dark:bg-slate-800/40">
              <span className="text-slate-400 block text-[10px]">Exercise Angina</span>
              <span className="font-semibold">{record.exercise_angina === 'yes' ? 'Positive' : 'None'}</span>
            </div>
            <div className="p-2 rounded bg-slate-100/70 dark:bg-slate-800/40">
              <span className="text-slate-400 block text-[10px]">Cholesterol</span>
              <span className="font-semibold">{record.cholesterol ? `${record.cholesterol} mg/dL` : 'Imputed'}</span>
            </div>
          </div>
        </div>

        {/* Explainability Breakdown */}
        {record.shap_positive_drivers && record.shap_positive_drivers.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40">
              <p className="font-bold text-rose-700 dark:text-rose-400 mb-1.5">Top Risk Drivers</p>
              <ul className="space-y-1 text-[11px]">
                {record.shap_positive_drivers.map((d: any) => (
                  <li key={d.feature} className="flex justify-between">
                    <span>{d.display_name}</span>
                    <span className="font-mono font-bold text-rose-600 dark:text-rose-400">+{d.percentage_impact}%</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40">
              <p className="font-bold text-emerald-700 dark:text-emerald-400 mb-1.5">Top Protective Factors</p>
              <ul className="space-y-1 text-[11px]">
                {record.shap_protective_factors.map((d: any) => (
                  <li key={d.feature} className="flex justify-between">
                    <span>{d.display_name}</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{d.percentage_impact}%</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
