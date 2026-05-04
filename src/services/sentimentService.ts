export interface FearGreedIndex {
  value: number; // 0-100
  classification: string; // "Extreme Fear" | "Fear" | "Neutral" | "Greed" | "Extreme Greed"
}

let cached: FearGreedIndex | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour (updates daily)

export async function fetchFearGreed(): Promise<FearGreedIndex | null> {
  if (cached && Date.now() - cacheTimestamp < CACHE_TTL) return cached;

  try {
    const res = await fetch('https://api.alternative.me/fng/?limit=1');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const item = data?.data?.[0];
    if (!item) return cached;

    const result: FearGreedIndex = {
      value: parseInt(item.value, 10) || 0,
      classification: item.value_classification || '',
    };
    cached = result;
    cacheTimestamp = Date.now();
    return result;
  } catch (e) {
    console.warn('Fear & Greed fetch failed', e);
    return cached;
  }
}

export function fearGreedColor(value: number): string {
  if (value <= 25) return '#F87171'; // extreme fear - red
  if (value <= 45) return '#FBBF24'; // fear - yellow
  if (value <= 55) return '#9CA3AF'; // neutral - grey
  if (value <= 75) return '#86EFAC'; // greed - light green
  return '#4ADE80'; // extreme greed - green
}
