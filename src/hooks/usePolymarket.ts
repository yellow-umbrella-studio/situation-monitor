import { useState, useEffect, useCallback } from 'react';
import { PredictionMarket, fetchTrendingMarkets } from '../services/polymarketService';

export function usePolymarket() {
  const [markets, setMarkets] = useState<PredictionMarket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    const data = await fetchTrendingMarkets(6);
    setMarkets(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { markets, isLoading, refresh: load };
}
