import { useState, useEffect, useCallback } from 'react';
import { MarketTicker, Commodity, fetchMarketTickers, fetchCommodities } from '../services/marketService';

export function useMarkets() {
  const [tickers, setTickers] = useState<MarketTicker[]>([]);
  const [commodities, setCommodities] = useState<Commodity[]>([]);

  const load = useCallback(async () => {
    const [t, c] = await Promise.all([fetchMarketTickers(), fetchCommodities()]);
    setTickers(t);
    setCommodities(c);
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 60 * 1000);
    return () => clearInterval(interval);
  }, [load]);

  return { tickers, commodities, refresh: load };
}
