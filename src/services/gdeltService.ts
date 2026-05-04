export interface GDELTEvent {
  title: string;
  url: string;
  source: string;
  country: string;
  language: string;
  publishedAt: Date;
  tone: number; // -10 to +10 (negative = negative news)
}

let cached: GDELTEvent[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 15 * 60 * 1000; // 15 min - GDELT requests should be sparse

function parseGDELTDate(s: string): Date {
  // Format: "20260411T120000Z"
  if (!s || s.length < 15) return new Date();
  const y = s.substring(0, 4);
  const mo = s.substring(4, 6);
  const d = s.substring(6, 8);
  const h = s.substring(9, 11);
  const mi = s.substring(11, 13);
  const se = s.substring(13, 15);
  return new Date(`${y}-${mo}-${d}T${h}:${mi}:${se}Z`);
}

/**
 * Fetches global news events from GDELT.
 * Targets high-impact international events from English sources.
 */
export async function fetchGDELTEvents(): Promise<GDELTEvent[]> {
  if (cached && Date.now() - cacheTimestamp < CACHE_TTL) return cached;

  try {
    // Tone < -5 = strongly negative news, sourcelang:eng = English
    // sort=tonedesc with negative filter shows the most impactful negative events
    const query = encodeURIComponent('(crisis OR attack OR strike OR sanctions OR summit OR escalation) sourcelang:eng');
    const url = `https://api.gdeltproject.org/api/v2/doc/doc?query=${query}&mode=artlist&format=json&maxrecords=10&sort=datedesc&timespan=12h`;

    const res = await fetch(url, {
      headers: { 'User-Agent': 'SituationMonitor/1.0' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const articles = data?.articles || [];

    const events: GDELTEvent[] = articles.map((a: any) => ({
      title: a.title || '',
      url: a.url || '',
      source: a.domain || a.sourcecountry || '',
      country: a.sourcecountry || '',
      language: a.language || '',
      publishedAt: parseGDELTDate(a.seendate || ''),
      tone: parseFloat(a.tone || '0'),
    }));

    if (events.length > 0) {
      cached = events;
      cacheTimestamp = Date.now();
    }
    return events.length > 0 ? events : (cached || []);
  } catch (e) {
    console.warn('GDELT fetch failed', e);
    return cached || [];
  }
}
