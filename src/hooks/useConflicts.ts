import { useState, useEffect, useCallback } from 'react';
import { Conflict, fetchConflicts } from '../services/conflictsService';

// Replace with your deployed URL after firebase deploy
const CONFLICTS_URL = 'https://refreshconflicts-hjt5hzwieq-uc.a.run.app';

export function useConflicts() {
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    const data = await fetchConflicts(CONFLICTS_URL);
    setConflicts(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { conflicts, isLoading, refresh: load };
}
