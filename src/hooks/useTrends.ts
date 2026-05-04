import { useState, useEffect, useCallback } from 'react';
import { TrendingKeyword, fetchTrendingKeywords } from '../services/trendsService';

const REFRESH_INTERVAL = 30 * 60 * 1000; // 30 minutes

export function useTrends() {
  const [trends, setTrends] = useState<TrendingKeyword[]>([]);

  const load = useCallback(async () => {
    const data = await fetchTrendingKeywords('US');
    setTrends(data);
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [load]);

  return { trends, refresh: load };
}
