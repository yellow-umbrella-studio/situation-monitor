import { useState, useEffect, useCallback } from 'react';
import { PizzaIndex, fetchPizzaIndex } from '../services/pizzaIndexService';

export function usePizzaIndex() {
  const [pizza, setPizza] = useState<PizzaIndex | null>(null);

  const load = useCallback(async () => {
    const data = await fetchPizzaIndex();
    setPizza(data);
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 10 * 60 * 1000); // every 10 min
    return () => clearInterval(interval);
  }, [load]);

  return { pizza, refresh: load };
}
