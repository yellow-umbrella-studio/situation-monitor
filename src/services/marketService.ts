export interface MarketTicker {
  symbol: string;
  price: number;
  changePercent: number;
}

export interface Commodity {
  symbol: string;
  name: string;
  label: string; // context tag e.g. "Energy"
  price: number;
  changePercent: number;
  unit: string;
}

// ─── Cache ───────────────────────────────────────────────────────

let cached: MarketTicker[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60 * 1000; // 1 minute

// ─── Fetch ───────────────────────────────────────────────────────

export async function fetchMarketTickers(): Promise<MarketTicker[]> {
  if (cached && Date.now() - cacheTimestamp < CACHE_TTL) {
    return cached;
  }

  const [crypto, stocks] = await Promise.all([
    fetchCrypto(),
    fetchStocks(),
  ]);

  const result = [...crypto, ...stocks];
  if (result.length > 0) {
    cached = result;
    cacheTimestamp = Date.now();
  }
  return result.length > 0 ? result : (cached || []);
}

async function fetchCrypto(): Promise<MarketTicker[]> {
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,ripple,dogecoin&vs_currencies=usd&include_24hr_change=true'
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return [
      { symbol: 'BTC', price: data.bitcoin?.usd ?? 0, changePercent: data.bitcoin?.usd_24h_change ?? 0 },
      { symbol: 'ETH', price: data.ethereum?.usd ?? 0, changePercent: data.ethereum?.usd_24h_change ?? 0 },
      { symbol: 'SOL', price: data.solana?.usd ?? 0, changePercent: data.solana?.usd_24h_change ?? 0 },
      { symbol: 'XRP', price: data.ripple?.usd ?? 0, changePercent: data.ripple?.usd_24h_change ?? 0 },
      { symbol: 'DOGE', price: data.dogecoin?.usd ?? 0, changePercent: data.dogecoin?.usd_24h_change ?? 0 },
    ];
  } catch (e) {
    console.warn('Crypto fetch failed', e);
    return [];
  }
}

async function fetchYahooChart(symbol: string): Promise<{ price: number; changePercent: number } | null> {
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=5d`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
        },
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const meta = data?.chart?.result?.[0]?.meta;
    if (!meta) return null;

    const price = meta.regularMarketPrice ?? 0;
    const prevClose = meta.chartPreviousClose ?? meta.previousClose ?? price;
    const changePercent = prevClose > 0 ? ((price - prevClose) / prevClose) * 100 : 0;

    return { price, changePercent };
  } catch {
    return null;
  }
}

async function fetchStocks(): Promise<MarketTicker[]> {
  const symbols: Array<{ symbol: string; label: string }> = [
    { symbol: '^GSPC', label: 'S&P' },
    { symbol: '^IXIC', label: 'NASDAQ' },
    { symbol: 'DX-Y.NYB', label: 'DXY' },
  ];
  const results = await Promise.all(
    symbols.map(async ({ symbol, label }) => {
      const data = await fetchYahooChart(symbol);
      if (!data) return null;
      return { symbol: label, price: data.price, changePercent: data.changePercent };
    })
  );
  return results.filter((r): r is MarketTicker => r !== null);
}

// ─── Commodities ─────────────────────────────────────────────────

let commoditiesCache: Commodity[] | null = null;
let commoditiesTimestamp = 0;

const COMMODITY_SYMBOLS: Array<{ symbol: string; name: string; label: string; unit: string }> = [
  { symbol: 'CL=F', name: 'Oil WTI', label: 'Energy', unit: '/bbl' },
  { symbol: 'NG=F', name: 'Nat Gas', label: 'Energy', unit: '/MMBtu' },
  { symbol: 'GC=F', name: 'Gold', label: 'Metals', unit: '/oz' },
  { symbol: 'ZW=F', name: 'Wheat', label: 'Food', unit: '/bu' },
  { symbol: '^VIX', name: 'VIX', label: 'Fear', unit: '' },
];

export async function fetchCommodities(): Promise<Commodity[]> {
  if (commoditiesCache && Date.now() - commoditiesTimestamp < CACHE_TTL) {
    return commoditiesCache;
  }

  try {
    const results = await Promise.all(
      COMMODITY_SYMBOLS.map(async (meta) => {
        const data = await fetchYahooChart(meta.symbol);
        if (!data || data.price === 0) return null;
        return {
          symbol: meta.symbol,
          name: meta.name,
          label: meta.label,
          unit: meta.unit,
          price: data.price,
          changePercent: data.changePercent,
        };
      })
    );
    const filtered = results.filter((r): r is Commodity => r !== null);

    if (filtered.length > 0) {
      commoditiesCache = filtered;
      commoditiesTimestamp = Date.now();
    }
    return filtered.length > 0 ? filtered : (commoditiesCache || []);
  } catch (e) {
    console.warn('Commodities fetch failed', e);
    return commoditiesCache || [];
  }
}

// ─── Helpers ─────────────────────────────────────────────────────

export function formatPrice(price: number): string {
  if (price >= 10000) return `${Math.round(price).toLocaleString()}`;
  if (price >= 100) return price.toFixed(0);
  if (price >= 10) return price.toFixed(1);
  return price.toFixed(2);
}
