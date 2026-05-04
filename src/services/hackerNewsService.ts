export interface HNStory {
  id: number;
  title: string;
  url: string;
  score: number;
  comments: number;
  by: string;
}

let cached: HNStory[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 10 * 60 * 1000;

export async function fetchHackerNewsTop(limit = 5): Promise<HNStory[]> {
  if (cached && Date.now() - cacheTimestamp < CACHE_TTL) return cached;

  try {
    const idsRes = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
    if (!idsRes.ok) throw new Error(`HTTP ${idsRes.status}`);
    const ids: number[] = await idsRes.json();
    const topIds = ids.slice(0, limit);

    const stories = await Promise.all(
      topIds.map(async (id) => {
        try {
          const r = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
          if (!r.ok) return null;
          const item = await r.json();
          if (!item || !item.title) return null;
          return {
            id: item.id,
            title: item.title,
            url: item.url || `https://news.ycombinator.com/item?id=${item.id}`,
            score: item.score || 0,
            comments: item.descendants || 0,
            by: item.by || '',
          } as HNStory;
        } catch {
          return null;
        }
      })
    );

    const filtered = stories.filter((s): s is HNStory => s !== null);
    if (filtered.length > 0) {
      cached = filtered;
      cacheTimestamp = Date.now();
    }
    return filtered;
  } catch (e) {
    console.warn('HN fetch failed', e);
    return cached || [];
  }
}
