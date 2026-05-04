export interface HistoricalEvent {
  year: number;
  yearsAgo: number;
  text: string;
}

let cached: { date: string; events: HistoricalEvent[] } | null = null;

export async function fetchOnThisDay(): Promise<HistoricalEvent[]> {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const dateKey = `${mm}-${dd}`;

  if (cached && cached.date === dateKey) return cached.events;

  try {
    const res = await fetch(
      `https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/events/${mm}/${dd}`,
      { headers: { 'User-Agent': 'SituationMonitor/1.0' } }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const events = (data?.events || []) as any[];
    const currentYear = now.getFullYear();

    const parsed: HistoricalEvent[] = events.map((e) => ({
      year: e.year || 0,
      yearsAgo: currentYear - (e.year || currentYear),
      text: e.text || '',
    }));

    // Sort newest first, take top 5
    parsed.sort((a, b) => b.year - a.year);
    const top = parsed.slice(0, 5);

    cached = { date: dateKey, events: top };
    return top;
  } catch (e) {
    console.warn('On this day fetch failed', e);
    return cached?.events || [];
  }
}
