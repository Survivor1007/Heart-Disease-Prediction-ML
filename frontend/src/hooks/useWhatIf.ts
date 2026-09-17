import { useState } from 'react';
import { PatientInput } from '../types/patient';
import { CounterfactualSimulation } from '../types/prediction';
import { simulateWhatIf } from '../services/api';

export function useWhatIf(currentPatient: PatientInput, baselineRisk: number) {
  const [simulation, setSimulation] = useState<CounterfactualSimulation | null>(null);
  const [simulating, setSimulating] = useState<boolean>(false);
  const [simValues, setSimValues] = useState({
    resting_bp: currentPatient.resting_bp,
    max_hr: currentPatient.max_hr,
    cholesterol: currentPatient.cholesterol || 220,
    st_depression: currentPatient.st_depression || 0.0,
  });

  const triggerSimulation = async (param: string, value: number) => {
    setSimulating(true);
    setSimValues((prev) => ({ ...prev, [param]: value }));
    try {
      const result = await simulateWhatIf(currentPatient, param, value);
      setSimulation(result);
    } catch (err) {
      console.error('What-if simulation error:', err);
    } finally {
      setSimulating(false);
    }
  };

  const resetSimulation = () => {
    setSimValues({
      resting_bp: currentPatient.resting_bp,
      max_hr: currentPatient.max_hr,
      cholesterol: currentPatient.cholesterol || 220,
      st_depression: currentPatient.st_depression || 0.0,
    });
    setSimulation(null);
  };

  return {
    simulation,
    simulating,
    simValues,
    triggerSimulation,
    resetSimulation,
  };
}
