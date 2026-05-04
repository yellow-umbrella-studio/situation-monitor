import { useState, useEffect, useCallback } from 'react';
import { GDELTEvent, fetchGDELTEvents } from '../services/gdeltService';

export function useGDELT() {
  const [events, setEvents] = useState<GDELTEvent[]>([]);

  const load = useCallback(async () => {
    const data = await fetchGDELTEvents();
    setEvents(data);
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [load]);

  return { events, refresh: load };
}
