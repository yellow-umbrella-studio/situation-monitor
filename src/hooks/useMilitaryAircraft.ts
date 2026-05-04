import { useState, useEffect, useCallback } from 'react';
import { MilitaryFlight, fetchMilitaryAircraft } from '../services/militaryAircraftService';

export function useMilitaryAircraft() {
  const [flights, setFlights] = useState<MilitaryFlight[]>([]);

  const load = useCallback(async () => {
    const data = await fetchMilitaryAircraft();
    setFlights(data);
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [load]);

  return { flights, refresh: load };
}
