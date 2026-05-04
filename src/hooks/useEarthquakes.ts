import { useState, useEffect, useCallback } from 'react';
import { Earthquake, fetchRecentEarthquakes } from '../services/earthquakeService';

export function useEarthquakes() {
  const [quakes, setQuakes] = useState<Earthquake[]>([]);

  const load = useCallback(async () => {
    const data = await fetchRecentEarthquakes();
    setQuakes(data);
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 5 * 60 * 1000); // every 5 min
    return () => clearInterval(interval);
  }, [load]);

  return { quakes, refresh: load };
}
