import { useState, useEffect, useCallback } from 'react';
import { FearGreedIndex, fetchFearGreed } from '../services/sentimentService';

export function useSentiment() {
  const [fearGreed, setFearGreed] = useState<FearGreedIndex | null>(null);

  const load = useCallback(async () => {
    const data = await fetchFearGreed();
    setFearGreed(data);
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30 * 60 * 1000); // every 30 min
    return () => clearInterval(interval);
  }, [load]);

  return { fearGreed, refresh: load };
}
