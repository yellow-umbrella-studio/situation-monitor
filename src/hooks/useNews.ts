import { useState, useEffect, useCallback } from 'react';
import { TopicId } from '../constants/topics';
import {
  NewsItem,
  fetchAllNews,
  getBreakingFromResults,
  getLatestFromResults,
} from '../services/newsService';
import { RSS_PROXY_URL } from '../config';

interface UseNewsResult {
  newsByTopic: Map<TopicId, NewsItem[]>;
  breaking: NewsItem[];
  latest: NewsItem[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useNews(selectedTopics: TopicId[]): UseNewsResult {
  const [newsByTopic, setNewsByTopic] = useState<Map<TopicId, NewsItem[]>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = useCallback(
    async (forceRefresh = false) => {
      if (selectedTopics.length === 0) {
        setNewsByTopic(new Map());
        setIsLoading(false);
        return;
      }

      try {
        setError(null);
        const results = await fetchAllNews(selectedTopics, RSS_PROXY_URL, forceRefresh);
        setNewsByTopic(results);
      } catch (err) {
        setError('Failed to load news');
        console.error('useNews error:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [selectedTopics]
  );

  useEffect(() => {
    setIsLoading(true);
    fetchNews();
  }, [fetchNews]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    await fetchNews(true);
  }, [fetchNews]);

  const breaking = getBreakingFromResults(newsByTopic);
  const latest = getLatestFromResults(newsByTopic);

  return { newsByTopic, breaking, latest, isLoading, error, refresh };
}
