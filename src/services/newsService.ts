import { TopicId, topics } from '../constants/topics';

// ─── Types ───────────────────────────────────────────────────────

export interface NewsItem {
  id: string;
  topicId: TopicId;
  title: string;
  description: string;
  source: string;
  url: string;
  publishedAt: Date;
  isBreaking: boolean;
}

export interface TopicFeed {
  topicId: TopicId;
  items: NewsItem[];
  lastUpdated: Date;
}

// ─── Cache ───────────────────────────────────────────────────────

const cache = new Map<TopicId, { items: NewsItem[]; timestamp: number }>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

function getCached(topicId: TopicId): NewsItem[] | null {
  const entry = cache.get(topicId);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.items;
  }
  return null;
}

function setCache(topicId: TopicId, items: NewsItem[]) {
  cache.set(topicId, { items, timestamp: Date.now() });
}

// ─── RSS Parsing ─────────────────────────────────────────────────

function parseRSSItems(xml: string, topicId: TopicId): NewsItem[] {
  const items: NewsItem[] = [];

  // Extract <item> blocks
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];

    const title = extractTag(block, 'title');
    const description = extractTag(block, 'description');
    const link = extractTag(block, 'link');
    const pubDate = extractTag(block, 'pubDate');
    const source = extractGoogleNewsSource(title) || extractTag(block, 'source') || 'Unknown';

    if (!title) continue;

    // Clean Google News title format: "Headline - Source"
    const cleanTitle = cleanGoogleNewsTitle(title);

    const publishedAt = pubDate ? new Date(pubDate) : new Date();
    const ageMinutes = (Date.now() - publishedAt.getTime()) / (1000 * 60);

    items.push({
      id: generateId(link || title),
      topicId,
      title: cleanTitle,
      description: stripHtml(description || ''),
      source,
      url: link || '',
      publishedAt,
      isBreaking: ageMinutes < 60, // less than 1 hour old = breaking
    });
  }

  return items.slice(0, 20); // limit per feed
}

function extractTag(xml: string, tag: string): string {
  // Handle CDATA
  const cdataRegex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`, 'i');
  const cdataMatch = xml.match(cdataRegex);
  if (cdataMatch) return cdataMatch[1].trim();

  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i');
  const match = xml.match(regex);
  return match ? match[1].trim() : '';
}

function extractGoogleNewsSource(title: string): string | null {
  // Google News format: "Headline text - Source Name"
  const lastDash = title.lastIndexOf(' - ');
  if (lastDash > 0) {
    return title.substring(lastDash + 3).trim();
  }
  return null;
}

function cleanGoogleNewsTitle(title: string): string {
  // Remove " - Source" suffix from Google News titles
  const lastDash = title.lastIndexOf(' - ');
  if (lastDash > 0) {
    return title.substring(0, lastDash).trim();
  }
  return title;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
}

function generateId(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

// ─── Google News RSS ─────────────────────────────────────────────

function buildGoogleNewsUrl(query: string): string {
  const encoded = encodeURIComponent(query);
  return `https://news.google.com/rss/search?q=${encoded}&hl=en-US&gl=US&ceid=US:en`;
}

// ─── Public API ──────────────────────────────────────────────────

/**
 * Fetch news for a single topic.
 * React Native has no CORS - fetches Google News RSS directly.
 */
export async function fetchTopicNews(
  topicId: TopicId,
  _proxyBaseUrl?: string,
  forceRefresh = false
): Promise<NewsItem[]> {
  if (!forceRefresh) {
    const cached = getCached(topicId);
    if (cached) return cached;
  }

  const topic = topics.find((t) => t.id === topicId);
  if (!topic) return [];

  const rssUrl = buildGoogleNewsUrl(topic.googleNewsQuery);

  try {
    const response = await fetch(rssUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
        'Accept': 'application/xml, text/xml, */*',
      },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const xml = await response.text();
    const items = parseRSSItems(xml, topicId);

    setCache(topicId, items);
    return items;
  } catch (error) {
    console.error(`Failed to fetch news for ${topicId}:`, error);
    const stale = cache.get(topicId);
    return stale?.items || [];
  }
}

/**
 * Fetch news for multiple topics in parallel.
 */
export async function fetchAllNews(
  topicIds: TopicId[],
  proxyBaseUrl: string,
  forceRefresh = false
): Promise<Map<TopicId, NewsItem[]>> {
  const results = new Map<TopicId, NewsItem[]>();

  const fetches = topicIds.map(async (topicId) => {
    const items = await fetchTopicNews(topicId, proxyBaseUrl, forceRefresh);
    results.set(topicId, items);
  });
  await Promise.allSettled(fetches);

  return results;
}

/**
 * Get all breaking news across topics.
 */
export function getBreakingFromResults(allNews: Map<TopicId, NewsItem[]>): NewsItem[] {
  const breaking: NewsItem[] = [];
  allNews.forEach((items) => {
    breaking.push(...items.filter((item) => item.isBreaking));
  });
  return breaking
    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
    .slice(0, 10);
}

/**
 * Get latest news across all topics, sorted by time.
 */
export function getLatestFromResults(
  allNews: Map<TopicId, NewsItem[]>,
  limit = 20
): NewsItem[] {
  const all: NewsItem[] = [];
  allNews.forEach((items) => all.push(...items));
  return all
    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
    .slice(0, limit);
}
