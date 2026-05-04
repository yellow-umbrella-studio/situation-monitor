export interface MilitaryFlight {
  callsign: string;
  type: string; // e.g. "Doomsday", "Refueler", "Surveillance", "Fighter"
  country: string;
  altitude: number; // meters
  velocity: number; // m/s
}

let cached: MilitaryFlight[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000;

// Known military callsign prefixes/patterns and their categories
const MILITARY_PATTERNS: Array<{ pattern: RegExp; type: string }> = [
  // US strategic / VIP
  { pattern: /^E4B|NIGHTWATCH|GORDO/, type: 'Doomsday' },
  { pattern: /^AF1|AF2|EXEC1F|VENUS/, type: 'Air Force One' },
  // Refuelers
  { pattern: /^GOLD|TROY|QUID|SHELL|BLOSM|REACH|RCH/, type: 'Refueler' },
  // Surveillance
  { pattern: /^FORTE|SNTRY|HMER|HOMER|SHADO|JAKE|RVT/, type: 'Surveillance' },
  { pattern: /^RRR|ASCOT/, type: 'RAF Transport' },
  // Bombers
  { pattern: /^DOOM|JEEP|CASTL|RNGR/, type: 'Bomber' },
  // Generic military
  { pattern: /^USAF|USA[FN]|NATO|ZULU|MIKE|KILO|ARMY/, type: 'Military' },
  { pattern: /^SAM[0-9]/, type: 'Military VIP' },
  // Russian
  { pattern: /^RFF|RA-/, type: 'Russian Mil' },
];

function classifyCallsign(callsign: string): string | null {
  if (!callsign) return null;
  for (const { pattern, type } of MILITARY_PATTERNS) {
    if (pattern.test(callsign)) return type;
  }
  return null;
}

export async function fetchMilitaryAircraft(): Promise<MilitaryFlight[]> {
  if (cached && Date.now() - cacheTimestamp < CACHE_TTL) return cached;

  try {
    // Global query - all aircraft with valid callsigns
    const res = await fetch('https://opensky-network.org/api/states/all');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const states: any[][] = data?.states || [];

    const military: MilitaryFlight[] = [];
    for (const s of states) {
      // OpenSky state vector positions:
      // 0=icao24, 1=callsign, 2=origin_country, 5=longitude, 6=latitude, 7=baro_altitude, 9=velocity
      const callsign = (s[1] || '').trim();
      if (!callsign) continue;
      const type = classifyCallsign(callsign);
      if (!type) continue;

      military.push({
        callsign,
        type,
        country: s[2] || 'Unknown',
        altitude: s[7] || 0,
        velocity: s[9] || 0,
      });
    }

    // Dedupe by callsign
    const seen = new Set<string>();
    const unique = military.filter((m) => {
      if (seen.has(m.callsign)) return false;
      seen.add(m.callsign);
      return true;
    });

    // Sort by type priority (most interesting first)
    const priority: Record<string, number> = {
      'Doomsday': 0,
      'Air Force One': 1,
      'Bomber': 2,
      'Surveillance': 3,
      'Refueler': 4,
      'Russian Mil': 5,
      'Military VIP': 6,
      'RAF Transport': 7,
      'Military': 8,
    };
    unique.sort((a, b) => (priority[a.type] ?? 99) - (priority[b.type] ?? 99));

    cached = unique.slice(0, 10);
    cacheTimestamp = Date.now();
    return cached;
  } catch (e) {
    console.warn('Military aircraft fetch failed', e);
    return cached || [];
  }
}

export function aircraftTypeColor(type: string): string {
  if (type === 'Doomsday' || type === 'Air Force One') return '#F87171';
  if (type === 'Bomber') return '#FB923C';
  if (type === 'Surveillance') return '#FBBF24';
  if (type === 'Refueler') return '#A78BFA';
  return '#9CA3AF';
}

export function formatAltitude(meters: number): string {
  if (!meters) return '—';
  const ft = Math.round(meters * 3.281);
  if (ft >= 1000) return `${(ft / 1000).toFixed(0)}k ft`;
  return `${ft} ft`;
}
