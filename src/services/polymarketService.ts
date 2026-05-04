// ─── Types ───────────────────────────────────────────────────────

export interface Outcome {
  label: string;
  probability: number; // 0-1
}

export interface PredictionMarket {
  id: string;
  title: string;
  image: string;
  outcomes: Outcome[]; // top outcomes sorted by probability
  volume24h: number;
  volumeTotal: number;
}

// ─── Cache ───────────────────────────────────────────────────────

let cachedMarkets: PredictionMarket[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

// ─── API ─────────────────────────────────────────────────────────

const GAMMA_API = 'https://gamma-api.polymarket.com';

export async function fetchTrendingMarkets(limit = 6): Promise<PredictionMarket[]> {
  if (cachedMarkets && Date.now() - cacheTimestamp < CACHE_TTL) {
    return cachedMarkets;
  }

  try {
    const url = `${GAMMA_API}/events?limit=${limit}&active=true&closed=false&order=volume24hr&ascending=false`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const events: any[] = await response.json();

    const markets: PredictionMarket[] = events
      .map((event) => {
        const subMarkets = event.markets || [];
        const outcomes: Outcome[] = [];

        if (subMarkets.length === 1) {
          // Single yes/no market - show "Yes" probability
          try {
            const prices = JSON.parse(subMarkets[0].outcomePrices || '[]');
            const yesProb = parseFloat(prices[0] || '0');
            outcomes.push({ label: 'Yes', probability: yesProb });
            outcomes.push({ label: 'No', probability: 1 - yesProb });
          } catch {}
        } else {
          // Multi-outcome event - extract each sub-market's "Yes" price
          for (const m of subMarkets) {
            try {
              const prices = JSON.parse(m.outcomePrices || '[]');
              const yesProb = parseFloat(prices[0] || '0');
              // Use groupItemTitle (e.g. "Brazil", "March 31") or question
              const label = m.groupItemTitle || m.question || 'Unknown';
              outcomes.push({ label, probability: yesProb });
            } catch {}
          }
        }

        // Sort by probability descending, take top 4
        outcomes.sort((a, b) => b.probability - a.probability);

        return {
          id: event.id,
          title: event.title,
          image: event.image || event.icon || '',
          outcomes: outcomes.slice(0, 4),
          volume24h: event.volume24hr || 0,
          volumeTotal: event.volume || 0,
        };
      })
      .filter((m) => m.title && m.outcomes.length > 0);

    cachedMarkets = markets;
    cacheTimestamp = Date.now();
    return markets;
  } catch (error) {
    console.error('Failed to fetch Polymarket data:', error);
    return cachedMarkets || [];
  }
}

// ─── Helpers ─────────────────────────────────────────────────────

export function formatVolume(vol: number): string {
  if (vol >= 1_000_000) return `$${(vol / 1_000_000).toFixed(1)}M`;
  if (vol >= 1_000) return `$${(vol / 1_000).toFixed(0)}K`;
  return `$${vol.toFixed(0)}`;
}

export function formatProbability(prob: number): string {
  const pct = prob * 100;
  if (pct < 1 && pct > 0) return '<1%';
  return `${Math.round(pct)}%`;
}
