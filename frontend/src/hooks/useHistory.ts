import { useState, useEffect } from 'react';
import { HistoryRecord } from '../types/history';
import { fetchHistory } from '../services/api';

export function useHistory() {
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filterTier, setFilterTier] = useState<string>('');

  const loadHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchHistory(50, 0, filterTier || undefined);
      setRecords(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load historical audit logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [filterTier]);

  return {
    records,
    loading,
    error,
    filterTier,
    setFilterTier,
    refetch: loadHistory,
  };
}
