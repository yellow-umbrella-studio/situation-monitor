export interface Earthquake {
  id: string;
  magnitude: number;
  place: string;
  time: Date;
  url: string;
}

let cached: Earthquake[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function fetchRecentEarthquakes(): Promise<Earthquake[]> {
  if (cached && Date.now() - cacheTimestamp < CACHE_TTL) return cached;

  try {
    const res = await fetch(
      'https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&limit=5&minmagnitude=4.5&orderby=time'
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const features = data?.features || [];

    const result: Earthquake[] = features.map((f: any) => ({
      id: f.id,
      magnitude: f.properties?.mag ?? 0,
      place: f.properties?.place ?? 'Unknown',
      time: new Date(f.properties?.time ?? Date.now()),
      url: f.properties?.url ?? '',
    }));

    if (result.length > 0) {
      cached = result;
      cacheTimestamp = Date.now();
    }
    return result.length > 0 ? result : (cached || []);
  } catch (e) {
    console.warn('Earthquake fetch failed', e);
    return cached || [];
  }
}

export function magnitudeColor(mag: number): string {
  if (mag >= 7) return '#F87171'; // red - major
  if (mag >= 6) return '#FB923C'; // orange - strong
  if (mag >= 5) return '#FBBF24'; // yellow - moderate
  return '#9CA3AF'; // grey - light
}
