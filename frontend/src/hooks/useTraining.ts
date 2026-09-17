import { useCallback, useEffect, useState } from 'react';
import { BenchmarkResponse } from '../types/benchmark';
import { LogStorageInfo, TrainingMode, TrainingResponse, TrainingSchema } from '../types/training';
import { fetchBenchmarks, fetchLogStorage, fetchTrainingSchema, uploadTrainingFile } from '../services/api';

export function useTraining() {
  const [schema, setSchema] = useState<TrainingSchema | null>(null);
  const [logs, setLogs] = useState<LogStorageInfo | null>(null);
  const [result, setResult] = useState<TrainingResponse | null>(null);
  const [lastMetrics, setLastMetrics] = useState<BenchmarkResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMeta = useCallback(async () => {
    try {
      const [schemaData, logData] = await Promise.all([fetchTrainingSchema(), fetchLogStorage()]);
      setSchema(schemaData);
      setLogs(logData);
    } catch (err: any) {
      setError(err.message || 'Could not load training metadata.');
    }
  }, []);

  const loadLastMetrics = useCallback(async () => {
    try {
      const data = await fetchBenchmarks();
      setLastMetrics(data);
    } catch {
      setLastMetrics(null);
    }
  }, []);

  useEffect(() => {
    loadMeta();
    loadLastMetrics();
  }, [loadMeta, loadLastMetrics]);

  const train = async (file: File, mode: TrainingMode) => {
    setLoading(true);
    setError(null);
    try {
      const data = await uploadTrainingFile(file, mode);
      setResult(data);
      setLastMetrics({
        dataset_summary: data.dataset_summary,
        models: data.models,
      });
      await loadMeta();
      return data;
    } catch (err: any) {
      setError(err.message || 'Training failed.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { schema, logs, result, lastMetrics, loading, error, train, reload: loadMeta };
}