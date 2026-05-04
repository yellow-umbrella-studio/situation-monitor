export interface Conflict {
  id: string;
  name: string;
  type: string; // "Civil War", "Interstate", etc.
  region: string;
  severity: 'critical' | 'high' | 'moderate';
  rawSeverity: string; // "Critical" | "Significant" | "Limited"
  status: string; // "Worsening" | "Unchanging" | "Improving"
  coordinates: [number, number] | null;
  link: string;
  image: string;
}

let cached: Conflict[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour (data updates every 12h on server)

/**
 * Fetches conflicts from the refreshConflicts Firebase endpoint.
 * Falls back to Firestore REST API if the function URL is configured.
 */
export async function fetchConflicts(functionUrl: string): Promise<Conflict[]> {
  if (cached && Date.now() - cacheTimestamp < CACHE_TTL) return cached;

  try {
    const res = await fetch(functionUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const conflicts: Conflict[] = (data.conflicts || []).map((c: any) => ({
      id: c.id || '',
      name: c.name || '',
      type: c.type || '',
      region: c.region || '',
      severity: c.severity || 'moderate',
      rawSeverity: c.rawSeverity || '',
      status: c.status || 'Unchanging',
      coordinates: c.coordinates || null,
      link: c.link || '',
      image: c.image || '',
    }));

    if (conflicts.length > 0) {
      cached = conflicts;
      cacheTimestamp = Date.now();
    }
    return conflicts;
  } catch (e) {
    console.warn('Conflicts fetch failed', e);
    return cached || [];
  }
}

export function severityColor(severity: string): string {
  switch (severity) {
    case 'critical': return '#F87171';
    case 'high': return '#FB923C';
    case 'moderate':
    default: return '#FBBF24';
  }
}

export function statusArrow(status: string): string {
  if (status.toLowerCase().includes('worsen')) return '↑';
  if (status.toLowerCase().includes('improv')) return '↓';
  return '→';
}

