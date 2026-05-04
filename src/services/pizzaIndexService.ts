export interface PizzaIndex {
  index: number; // 0-100 overall activity
  defconLevel: number; // 1-5
  defconLabel: string; // "COCKED PISTOL" etc.
  activeSpikes: number;
  placesOpen: number;
  placesTotal: number;
  freshness: 'fresh' | 'stale';
  updatedAt: Date;
}

const DEFCON_LABELS: Record<number, string> = {
  1: 'COCKED PISTOL',
  2: 'FAST PACE',
  3: 'ROUND HOUSE',
  4: 'DOUBLE TAKE',
  5: 'FADE OUT',
};

let cached: PizzaIndex | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 10 * 60 * 1000; // 10 min

export async function fetchPizzaIndex(): Promise<PizzaIndex | null> {
  if (cached && Date.now() - cacheTimestamp < CACHE_TTL) return cached;

  try {
    const res = await fetch('https://www.pizzint.watch/api/dashboard-data', {
      headers: { 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const defconLevel = data.defcon_level ?? 5;
    const result: PizzaIndex = {
      index: Math.round(data.overall_index ?? 0),
      defconLevel,
      defconLabel: DEFCON_LABELS[defconLevel] || 'UNKNOWN',
      activeSpikes: data.active_spikes ?? 0,
      placesOpen: data.defcon_details?.open_places ?? 0,
      placesTotal: data.defcon_details?.total_places ?? 0,
      freshness: data.data_freshness === 'fresh' ? 'fresh' : 'stale',
      updatedAt: new Date(),
    };

    cached = result;
    cacheTimestamp = Date.now();
    return result;
  } catch (e) {
    console.warn('Pizza index fetch failed', e);
    return cached;
  }
}

export function defconColor(level: number): string {
  switch (level) {
    case 1: return '#F87171'; // red - cocked pistol
    case 2: return '#FB923C'; // orange - fast pace
    case 3: return '#FBBF24'; // yellow - round house
    case 4: return '#9CA3AF'; // grey - double take
    case 5:
    default: return '#4ADE80'; // green - fade out (calm)
  }
}
