import { useState, useEffect } from 'react';
import { BenchmarkResponse } from '../types/benchmark';
import { fetchBenchmarks } from '../services/api';

export function useBenchmarks() {
  const [benchmarks, setBenchmarks] = useState<BenchmarkResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchBenchmarks();
      setBenchmarks(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load benchmarks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return { benchmarks, loading, error, refetch: loadData };
}
