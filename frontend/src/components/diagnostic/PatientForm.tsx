import React from 'react';
import { Activity, Beaker, RotateCcw, Play } from 'lucide-react';
import { PatientInput, SexType, ChestPainType, ExerciseAnginaType, RestingEcgType, StSlopeType, ThalassemiaType } from '../../types/patient';
import { Card } from '../common/Card';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { Accordion } from '../common/Accordion';
import { Badge } from '../common/Badge';

interface PatientFormProps {
  patientData: PatientInput;
  onChange: (data: PatientInput) => void;
  onSubmit: () => void;
  onReset: () => void;
  loading: boolean;
}

export const PatientForm: React.FC<PatientFormProps> = ({
  patientData,
  onChange,
  onSubmit,
  onReset,
  loading,
}) => {
  const updateField = (field: keyof PatientInput, value: any) => {
    onChange({
      ...patientData,
      [field]: value === '' ? null : value,
    });
  };

  const getBpWarning = (bp: number) => {
    if (bp > 180) return 'Stage 3 Hypertensive Crisis Threshold';
    if (bp > 140) return 'Stage 2 Hypertension Range';
    if (bp < 90) return 'Hypotensive Blood Pressure';
    return undefined;
  };

  const getHrWarning = (hr: number) => {
    if (hr > 200) return 'High Tachycardia Exertion';
    if (hr < 50) return 'Marked Bradycardia';
    return undefined;
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Patient Diagnostic Payload
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Input mandatory core vitals and optional lab markers
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onReset} leftIcon={<RotateCcw className="w-3.5 h-3.5" />}>
          Reset
        </Button>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="space-y-6"
      >
        {/* SECTION 1: MANDATORY CORE VITALS */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              1. Mandatory Core Vitals (Strictly Required)
            </span>
            <Badge variant="teal" size="sm">6 Core Metrics</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input
              label="Patient Age"
              type="number"
              min={18}
              max={100}
              unit="years"
              value={patientData.age}
              onChange={(e) => updateField('age', parseInt(e.target.value) || 18)}
              required
            />

            <Select
              label="Biological Sex"
              value={patientData.sex}
              onChange={(e) => updateField('sex', e.target.value as SexType)}
              options={[
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
              ]}
              required
            />

            <Input
              label="Resting Blood Pressure"
              type="number"
              min={60}
              max={240}
              unit="mm Hg"
              value={patientData.resting_bp}
              warning={getBpWarning(patientData.resting_bp)}
              onChange={(e) => updateField('resting_bp', parseInt(e.target.value) || 120)}
              required
            />

            <Select
              label="Chest Pain Classification"
              value={patientData.chest_pain_type}
              onChange={(e) => updateField('chest_pain_type', e.target.value as ChestPainType)}
              options={[
                { value: 'typical_angina', label: 'Typical Angina' },
                { value: 'atypical_angina', label: 'Atypical Angina' },
                { value: 'non_anginal', label: 'Non-Anginal Pain' },
                { value: 'asymptomatic', label: 'Asymptomatic Ischemia' },
              ]}
              required
            />

            <Input
              label="Max Heart Rate Achieved"
              type="number"
              min={60}
              max={220}
              unit="bpm"
              value={patientData.max_hr}
              warning={getHrWarning(patientData.max_hr)}
              onChange={(e) => updateField('max_hr', parseInt(e.target.value) || 150)}
              required
            />

            <Select
              label="Exercise-Induced Angina"
              value={patientData.exercise_angina}
              onChange={(e) => updateField('exercise_angina', e.target.value as ExerciseAnginaType)}
              options={[
                { value: 'no', label: 'No Angina Under Stress' },
                { value: 'yes', label: 'Yes (Provoked Angina)' },
              ]}
              required
            />
          </div>
        </div>

        {/* SECTION 2: ADVANCED CLINICAL & LAB RESULTS (COLLAPSIBLE) */}
        <Accordion
          title="2. Advanced Clinical / Lab Results"
          subtitle="Optional secondary diagnostic markers (Dynamically imputed if omitted)"
          badge={<Badge variant="slate" size="sm">Optional &bull; 7 Markers</Badge>}
          defaultOpen={false}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            <Input
              label="Serum Cholesterol"
              type="number"
              min={80}
              max={600}
              unit="mg/dL"
              value={patientData.cholesterol ?? ''}
              placeholder="Leave blank to impute"
              onChange={(e) => updateField('cholesterol', e.target.value ? parseFloat(e.target.value) : null)}
            />

            <Select
              label="Fasting Blood Sugar > 120 mg/dL"
              value={patientData.fasting_bs ?? ''}
              onChange={(e) => updateField('fasting_bs', e.target.value || null)}
              options={[
                { value: '', label: '-- Not Available (Impute) --' },
                { value: 'false', label: 'Normal (<= 120 mg/dL)' },
                { value: 'true', label: 'Elevated (> 120 mg/dL)' },
              ]}
            />

            <Select
              label="Resting ECG Findings"
              value={patientData.resting_ecg ?? ''}
              onChange={(e) => updateField('resting_ecg', (e.target.value as RestingEcgType) || null)}
              options={[
                { value: '', label: '-- Not Available (Impute) --' },
                { value: 'normal', label: 'Normal' },
                { value: 'st_t_wave_abnormality', label: 'ST-T Wave Abnormality' },
                { value: 'left_ventricular_hypertrophy', label: 'Left Ventricular Hypertrophy' },
              ]}
            />

            <Input
              label="ST Depression (Oldpeak)"
              type="number"
              step="0.1"
              min={0.0}
              max={10.0}
              unit="mm"
              value={patientData.st_depression ?? ''}
              placeholder="Leave blank to impute"
              onChange={(e) => updateField('st_depression', e.target.value ? parseFloat(e.target.value) : null)}
            />

            <Select
              label="Peak Exercise ST Slope"
              value={patientData.st_slope ?? ''}
              onChange={(e) => updateField('st_slope', (e.target.value as StSlopeType) || null)}
              options={[
                { value: '', label: '-- Not Available (Impute) --' },
                { value: 'upsloping', label: 'Upsloping' },
                { value: 'flat', label: 'Flat' },
                { value: 'downsloping', label: 'Downsloping' },
              ]}
            />

            <Select
              label="Fluoroscopy Vessels (0-3)"
              value={patientData.num_major_vessels !== null && patientData.num_major_vessels !== undefined ? patientData.num_major_vessels.toString() : ''}
              onChange={(e) => updateField('num_major_vessels', e.target.value !== '' ? parseInt(e.target.value) : null)}
              options={[
                { value: '', label: '-- Not Available (Impute) --' },
                { value: '0', label: '0 Vessels Colored' },
                { value: '1', label: '1 Vessel Colored' },
                { value: '2', label: '2 Vessels Colored' },
                { value: '3', label: '3 Vessels Colored' },
              ]}
            />

            <Select
              label="Thallium Stress Test"
              value={patientData.thalassemia ?? ''}
              onChange={(e) => updateField('thalassemia', (e.target.value as ThalassemiaType) || null)}
              options={[
                { value: '', label: '-- Not Available (Impute) --' },
                { value: 'normal', label: 'Normal Perfusion' },
                { value: 'fixed_defect', label: 'Fixed Defect (Infarction)' },
                { value: 'reversible_defect', label: 'Reversible Defect (Ischemia)' },
              ]}
            />
          </div>
        </Accordion>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button
            type="submit"
            size="lg"
            isLoading={loading}
            leftIcon={<Play className="w-4 h-4 fill-current" />}
            className="w-full sm:w-auto min-w-[220px]"
          >
            Compute Diagnostic Assessment
          </Button>
        </div>
      </form>
    </Card>
  );
};
