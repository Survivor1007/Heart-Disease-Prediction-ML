import { PatientInput, PatientArchetype } from '../types/patient';
import { PredictionResponse, CounterfactualSimulation } from '../types/prediction';
import { BenchmarkResponse } from '../types/benchmark';
import { HistoryRecord } from '../types/history';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export async function predictRisk(patient: PatientInput): Promise<PredictionResponse> {
  const response = await fetch(`${API_BASE}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patient),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Prediction failed with status: ${response.status}`);
  }

  return response.json();
}

export async function simulateWhatIf(
  patient: PatientInput,
  parameter: string,
  simulatedValue: any
): Promise<CounterfactualSimulation> {
  const response = await fetch(`${API_BASE}/what-if`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      patient,
      parameter,
      simulated_value: simulatedValue,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Simulation failed with status: ${response.status}`);
  }

  return response.json();
}

export async function fetchBenchmarks(): Promise<BenchmarkResponse> {
  const response = await fetch(`${API_BASE}/benchmarks`);
  if (!response.ok) {
    throw new Error(`Failed to fetch benchmark metrics: ${response.status}`);
  }
  return response.json();
}

export async function fetchArchetypes(): Promise<PatientArchetype[]> {
  const response = await fetch(`${API_BASE}/archetypes`);
  if (!response.ok) {
    throw new Error(`Failed to fetch archetypes: ${response.status}`);
  }
  return response.json();
}

export async function fetchHistory(
  limit: number = 20,
  offset: number = 0,
  riskTier?: string
): Promise<HistoryRecord[]> {
  const params = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString(),
  });
  if (riskTier) params.append('risk_tier', riskTier);

  const response = await fetch(`${API_BASE}/history?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch history logs: ${response.status}`);
  }
  return response.json();
}
