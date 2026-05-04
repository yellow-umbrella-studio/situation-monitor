export interface TrendingKeyword {
  keyword: string;
  traffic: string;
  traffixValue: number;
  newsTitle?: string;
  newsUrl?: string;
}

// ─── Cache ───────────────────────────────────────────────────────

let cached: TrendingKeyword[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

// ─── Parse ───────────────────────────────────────────────────────

function parseTrafficValue(traffic: string): number {
  // "1M+" → 1000000, "500K+" → 500000, "1000+" → 1000
  const match = traffic.match(/^(\d+(?:\.\d+)?)\s*([KMB])?/i);
  if (!match) return 0;
  const num = parseFloat(match[1]);
  const unit = (match[2] || '').toUpperCase();
  if (unit === 'M') return num * 1_000_000;
  if (unit === 'K') return num * 1_000;
  if (unit === 'B') return num * 1_000_000_000;
  return num;
}

function extractTag(xml: string, tag: string): string {
  const cdataRegex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`, 'i');
  const cdataMatch = xml.match(cdataRegex);
  if (cdataMatch) return cdataMatch[1].trim();
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i');
  const match = xml.match(regex);
  return match ? match[1].trim() : '';
}

function parseTrendsRSS(xml: string): TrendingKeyword[] {
  const items: TrendingKeyword[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const keyword = extractTag(block, 'title');
    const traffic = extractTag(block, 'ht:approx_traffic') || '0';
    const newsTitle = extractTag(block, 'ht:news_item_title');
    const newsUrl = extractTag(block, 'ht:news_item_url');

    if (!keyword) continue;

    items.push({
      keyword,
      traffic,
      traffixValue: parseTrafficValue(traffic),
      newsTitle: newsTitle || undefined,
      newsUrl: newsUrl || undefined,
    });
  }

  return items
    .sort((a, b) => b.traffixValue - a.traffixValue)
    .slice(0, 5);
}

// ─── Public API ──────────────────────────────────────────────────

export async function fetchTrendingKeywords(geo: string = 'US'): Promise<TrendingKeyword[]> {
  if (cached && Date.now() - cacheTimestamp < CACHE_TTL) {
    return cached;
  }

  try {
    const res = await fetch(`https://trends.google.com/trending/rss?geo=${geo}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const xml = await res.text();
    const trends = parseTrendsRSS(xml);

    if (trends.length > 0) {
      cached = trends;
      cacheTimestamp = Date.now();
    }
    return trends.length > 0 ? trends : (cached || []);
  } catch (e) {
    console.warn('Trends fetch failed', e);
    return cached || [];
  }
}

// ─── Helpers ─────────────────────────────────────────────────────

export function formatTraffic(val: number): string {
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `${Math.round(val / 1_000)}K`;
  return val.toString();
}
