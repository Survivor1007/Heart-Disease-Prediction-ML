import React from 'react';
import { Sliders, RefreshCw, ArrowRight, TrendingDown, TrendingUp } from 'lucide-react';
import { PatientInput } from '../../types/patient';
import { useWhatIf } from '../../hooks/useWhatIf';
import { Card } from '../common/Card';
import { Slider } from '../common/Slider';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

interface WhatIfSimulatorProps {
  patient: PatientInput;
  baselineRisk: number;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({
  patient,
  baselineRisk,
}) => {
  const { simulation, simulating, simValues, triggerSimulation, resetSimulation } =
    useWhatIf(patient, baselineRisk);

  const activeRisk = simulation ? simulation.simulated_risk_score : baselineRisk;
  const delta = simulation ? simulation.risk_delta : 0;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Counterfactual "What-If" Simulator
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Simulate dynamic cardiovascular risk reduction by modulating clinical targets
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={resetSimulation}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Reset Sliders
        </Button>
      </div>

      {/* Live Impact Card */}
      <div className="p-4 rounded-xl bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
              Baseline Risk
            </span>
            <p className="text-2xl font-bold font-mono text-slate-700 dark:text-slate-300">
              {baselineRisk}%
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 hidden sm:block" />
          <div>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
              Simulated Risk
            </span>
            <p
              className={`text-2xl font-bold font-mono ${
                activeRisk < baselineRisk
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : activeRisk > baselineRisk
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-slate-900 dark:text-white'
              }`}
            >
              {activeRisk}%
            </p>
          </div>
        </div>

        {delta !== 0 && (
          <div className="flex items-center gap-2">
            {delta < 0 ? (
              <Badge variant="emerald" size="md" className="gap-1 px-3 py-1">
                <TrendingDown className="w-4 h-4" />
                <span>{delta}% Risk Reduction</span>
              </Badge>
            ) : (
              <Badge variant="rose" size="md" className="gap-1 px-3 py-1">
                <TrendingUp className="w-4 h-4" />
                <span>+{delta}% Risk Increase</span>
              </Badge>
            )}
          </div>
        )}
      </div>

      {simulation && simulation.insight && (
        <div className="p-3.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 mb-6 text-xs text-teal-900 dark:text-teal-200 flex items-start gap-2.5">
          <span className="font-bold shrink-0 text-teal-600 dark:text-teal-400">&bull; Clinical Impact:</span>
          <span>{simulation.insight}</span>
        </div>
      )}

      {/* Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Slider
          label="Resting Systolic Blood Pressure"
          min={90}
          max={200}
          step={2}
          unit="mm Hg"
          value={simValues.resting_bp}
          disabled={simulating}
          onChange={(val) => triggerSimulation('resting_bp', val)}
        />

        <Slider
          label="Max Peak Heart Rate"
          min={70}
          max={210}
          step={2}
          unit="bpm"
          value={simValues.max_hr}
          disabled={simulating}
          onChange={(val) => triggerSimulation('max_hr', val)}
        />

        <Slider
          label="Serum Cholesterol Level"
          min={120}
          max={450}
          step={5}
          unit="mg/dL"
          value={simValues.cholesterol}
          disabled={simulating}
          onChange={(val) => triggerSimulation('cholesterol', val)}
        />

        <Slider
          label="ST Segment Depression (Oldpeak)"
          min={0.0}
          max={5.0}
          step={0.1}
          unit="mm"
          value={simValues.st_depression}
          disabled={simulating}
          onChange={(val) => triggerSimulation('st_depression', val)}
        />
      </div>
    </Card>
  );
};
