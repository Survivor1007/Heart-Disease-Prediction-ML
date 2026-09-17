import React from 'react';
import { Terminal, Code, Cpu } from 'lucide-react';
import { Card } from '../common/Card';

export const ApiRefGuide: React.FC = () => {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-200 dark:border-slate-800">
        <Terminal className="w-5 h-5 text-teal-600 dark:text-teal-400" />
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          API Contracts & Integration Guide
        </h3>
      </div>

      <div className="space-y-4 text-xs">
        <p className="text-slate-600 dark:text-slate-300">
          The FastAPI backend exposes fully typed REST endpoints with automatic OpenAPI documentation available at <code className="text-teal-600 dark:text-teal-400 font-mono">/docs</code>.
        </p>

        <div className="space-y-3 font-mono text-[11px]">
          <div className="p-3 rounded-lg bg-slate-900 text-slate-100">
            <span className="text-emerald-400 font-bold">POST</span> /api/v1/predict
            <p className="text-slate-400 font-sans mt-1 text-[11px]">
              Execute multi-model inference, probability calibration, SHAP attribution, and database audit insertion.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-900 text-slate-100">
            <span className="text-emerald-400 font-bold">POST</span> /api/v1/what-if
            <p className="text-slate-400 font-sans mt-1 text-[11px]">
              Simulate dynamic risk variations when perturbing modifiable clinical parameters.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-900 text-slate-100">
            <span className="text-blue-400 font-bold">GET</span> /api/v1/benchmarks
            <p className="text-slate-400 font-sans mt-1 text-[11px]">
              Retrieve judgment metrics (Accuracy, F1, ROC-AUC, Brier score, latency distributions).
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-900 text-slate-100">
            <span className="text-blue-400 font-bold">GET</span> /api/v1/history
            <p className="text-slate-400 font-sans mt-1 text-[11px]">
              Fetch historical diagnostic assessments with risk classifications and SHAP attributions.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};
