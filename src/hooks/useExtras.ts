import { useState, useEffect, useCallback } from 'react';
import { HistoricalEvent, fetchOnThisDay } from '../services/onThisDayService';
import { HNStory, fetchHackerNewsTop } from '../services/hackerNewsService';

export function useOnThisDay() {
  const [events, setEvents] = useState<HistoricalEvent[]>([]);

  const load = useCallback(async () => {
    const data = await fetchOnThisDay();
    setEvents(data);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { events, refresh: load };
}

export function useHackerNews() {
  const [stories, setStories] = useState<HNStory[]>([]);

  const load = useCallback(async () => {
    const data = await fetchHackerNewsTop(5);
    setStories(data);
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [load]);

  return { stories, refresh: load };
}
