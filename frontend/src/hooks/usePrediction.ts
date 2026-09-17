import { useState, useEffect } from 'react';
import { PatientInput, PatientArchetype } from '../types/patient';
import { PredictionResponse } from '../types/prediction';
import { predictRisk, fetchArchetypes } from '../services/api';

export const DEFAULT_PATIENT: PatientInput = {
  age: 54,
  sex: 'male',
  resting_bp: 135,
  chest_pain_type: 'typical_angina',
  max_hr: 152,
  exercise_angina: 'no',
  cholesterol: 230,
  fasting_bs: 'false',
  resting_ecg: 'normal',
  st_depression: 1.0,
  st_slope: 'upsloping',
  num_major_vessels: 0,
  thalassemia: 'normal',
};

export function usePrediction() {
  const [patientData, setPatientData] = useState<PatientInput>(DEFAULT_PATIENT);
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [archetypes, setArchetypes] = useState<PatientArchetype[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchArchetypes()
      .then((data) => setArchetypes(data))
      .catch((err) => console.warn('Could not load archetypes:', err));
  }, []);

  const handlePredict = async (dataToPredict?: PatientInput) => {
    const payload = dataToPredict || patientData;
    setLoading(true);
    setError(null);
    try {
      const result = await predictRisk(payload);
      setPrediction(result);
    } catch (err: any) {
      setError(err.message || 'Diagnostic assessment failed.');
    } finally {
      setLoading(false);
    }
  };

  const loadArchetype = (archetypeId: string) => {
    const found = archetypes.find((a) => a.id === archetypeId);
    if (found) {
      setPatientData({ ...found.patient_data });
      handlePredict(found.patient_data);
    }
  };

  const resetForm = () => {
    setPatientData(DEFAULT_PATIENT);
    setPrediction(null);
    setError(null);
  };

  return {
    patientData,
    setPatientData,
    prediction,
    archetypes,
    loading,
    error,
    handlePredict,
    loadArchetype,
    resetForm,
  };
}
