import { TopicId } from '../constants/topics';

export type SituationStatus = 'normal' | 'elevated' | 'critical';
export type AlertPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Situation {
  id: string;
  topicId: TopicId;
  headline: string;
  summary: string;
  source: string;
  timestamp: Date;
  status: SituationStatus;
  priority: AlertPriority;
  isBreaking?: boolean;
  tags?: string[];
  location?: {
    lat: number;
    lng: number;
    name: string;
  };
}

export interface TopicStats {
  topicId: TopicId;
  activeCount: number;
  status: SituationStatus;
  trend: 'up' | 'down' | 'stable';
  latestHeadline: string;
}

export interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

const generateId = () => Math.random().toString(36).substring(2, 11);

const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * 60 * 1000);

export const mockSituations: Situation[] = [
  // World News
  {
    id: generateId(),
    topicId: 'world-news',
    headline: 'G7 Summit Reaches Historic Climate Agreement',
    summary: 'World leaders have announced a groundbreaking commitment to reduce emissions by 60% by 2035, with $500B in green investment pledges.',
    source: 'Reuters',
    timestamp: minutesAgo(12),
    status: 'elevated',
    priority: 'high',
    isBreaking: true,
    tags: ['climate', 'g7', 'politics'],
    location: { lat: 48.8566, lng: 2.3522, name: 'Paris, France' },
  },
  {
    id: generateId(),
    topicId: 'world-news',
    headline: 'Major Trade Deal Signed Between US and India',
    summary: 'A comprehensive trade agreement worth $200B annually has been finalized, marking a new era in economic cooperation.',
    source: 'Bloomberg',
    timestamp: minutesAgo(45),
    status: 'normal',
    priority: 'medium',
    tags: ['trade', 'economy'],
    location: { lat: 38.9072, lng: -77.0369, name: 'Washington DC' },
  },
  {
    id: generateId(),
    topicId: 'world-news',
    headline: 'UN Security Council Emergency Session Called',
    summary: 'Emergency meeting scheduled to address escalating humanitarian situation. Aid organizations mobilizing.',
    source: 'AP News',
    timestamp: minutesAgo(28),
    status: 'critical',
    priority: 'critical',
    isBreaking: true,
    tags: ['un', 'humanitarian'],
    location: { lat: 40.7489, lng: -73.968, name: 'New York, UN HQ' },
  },
  
  // Markets
  {
    id: generateId(),
    topicId: 'markets',
    headline: 'Bitcoin Surges Past $95,000 on ETF News',
    summary: 'Major institutional buying continues as new spot ETF approval rumors circulate. Trading volume hits 3-month high.',
    source: 'CoinDesk',
    timestamp: minutesAgo(8),
    status: 'elevated',
    priority: 'high',
    isBreaking: true,
    tags: ['crypto', 'bitcoin', 'etf'],
  },
  {
    id: generateId(),
    topicId: 'markets',
    headline: 'Fed Signals Potential Rate Cut in June',
    summary: 'Federal Reserve minutes reveal dovish stance, markets rally on expectations of monetary easing.',
    source: 'CNBC',
    timestamp: minutesAgo(67),
    status: 'elevated',
    priority: 'high',
    tags: ['fed', 'rates', 'economy'],
  },
  {
    id: generateId(),
    topicId: 'markets',
    headline: 'NVIDIA Hits New All-Time High',
    summary: 'Chipmaker continues AI-driven rally, now worth more than entire European stock market combined.',
    source: 'Yahoo Finance',
    timestamp: minutesAgo(120),
    status: 'normal',
    priority: 'medium',
    tags: ['stocks', 'nvidia', 'ai'],
  },
  
  // Tech
  {
    id: generateId(),
    topicId: 'tech',
    headline: 'OpenAI Announces GPT-5 Release Date',
    summary: 'Next-generation model promises 10x performance improvement. Enterprise beta starting next month.',
    source: 'TechCrunch',
    timestamp: minutesAgo(15),
    status: 'elevated',
    priority: 'high',
    isBreaking: true,
    tags: ['ai', 'openai', 'gpt5'],
    location: { lat: 37.7749, lng: -122.4194, name: 'San Francisco' },
  },
  {
    id: generateId(),
    topicId: 'tech',
    headline: 'AWS Experiencing Global Outage',
    summary: 'Multiple services affected including S3 and EC2. Thousands of websites reporting downtime.',
    source: 'The Verge',
    timestamp: minutesAgo(5),
    status: 'critical',
    priority: 'critical',
    isBreaking: true,
    tags: ['aws', 'outage', 'cloud'],
    location: { lat: 47.6062, lng: -122.3321, name: 'Seattle, WA' },
  },
  {
    id: generateId(),
    topicId: 'tech',
    headline: 'Apple Vision Pro 2 Leaks Reveal Lighter Design',
    summary: 'Next-gen headset reportedly 40% lighter with improved battery. Launch expected in fall.',
    source: 'MacRumors',
    timestamp: minutesAgo(180),
    status: 'normal',
    priority: 'low',
    tags: ['apple', 'vr', 'hardware'],
  },
  
  // Sports
  {
    id: generateId(),
    topicId: 'sports',
    headline: 'Champions League Final: Real Madrid vs Manchester City',
    summary: 'LIVE: 2-2 in extra time. Bellingham scores dramatic equalizer in 89th minute.',
    source: 'ESPN',
    timestamp: minutesAgo(2),
    status: 'elevated',
    priority: 'high',
    isBreaking: true,
    tags: ['soccer', 'ucl', 'live'],
    location: { lat: 51.5560, lng: -0.2795, name: 'Wembley Stadium, London' },
  },
  {
    id: generateId(),
    topicId: 'sports',
    headline: 'NBA Playoffs: Record-Breaking Performance',
    summary: 'Historic 60-point triple-double leads team to conference finals. First time in NBA history.',
    source: 'NBA.com',
    timestamp: minutesAgo(45),
    status: 'elevated',
    priority: 'medium',
    tags: ['nba', 'playoffs', 'record'],
  },
  
  // Entertainment
  {
    id: generateId(),
    topicId: 'entertainment',
    headline: 'Marvel Announces Phase 7 Slate with Major Surprises',
    summary: 'Secret Wars confirmed for 2027. Robert Downey Jr. returning in unexpected role.',
    source: 'Variety',
    timestamp: minutesAgo(90),
    status: 'elevated',
    priority: 'medium',
    tags: ['marvel', 'movies', 'mcu'],
    location: { lat: 34.0522, lng: -118.2437, name: 'Los Angeles' },
  },
  {
    id: generateId(),
    topicId: 'entertainment',
    headline: 'Taylor Swift Eras Tour Breaks Global Revenue Record',
    summary: 'Tour surpasses $2B in ticket sales, becoming highest-grossing concert tour in history.',
    source: 'Billboard',
    timestamp: minutesAgo(240),
    status: 'normal',
    priority: 'medium',
    tags: ['music', 'taylor swift', 'tour'],
  },
  
  // Memes
  {
    id: generateId(),
    topicId: 'memes',
    headline: '"Monitoring the Situation" Meme Goes Viral',
    summary: 'Meta-ironic meme about people who dramatically "monitor situations" takes over TikTok. 50M+ views.',
    source: 'KnowYourMeme',
    timestamp: minutesAgo(30),
    status: 'elevated',
    priority: 'medium',
    tags: ['viral', 'tiktok', 'meme'],
  },
  {
    id: generateId(),
    topicId: 'memes',
    headline: 'New AI-Generated Trend Spawns Thousands of Variants',
    summary: 'The "explain like I\'m a medieval peasant" prompt format dominates social feeds.',
    source: 'Twitter/X',
    timestamp: minutesAgo(120),
    status: 'normal',
    priority: 'low',
    tags: ['ai', 'trend', 'social'],
  },
  
  // Weather
  {
    id: generateId(),
    topicId: 'weather',
    headline: 'Category 4 Hurricane Approaching Florida Coast',
    summary: 'Hurricane Maria upgraded to Category 4. Mandatory evacuations ordered for coastal areas.',
    source: 'NOAA',
    timestamp: minutesAgo(20),
    status: 'critical',
    priority: 'critical',
    isBreaking: true,
    tags: ['hurricane', 'emergency', 'evacuation'],
    location: { lat: 25.7617, lng: -80.1918, name: 'Miami, Florida' },
  },
  {
    id: generateId(),
    topicId: 'weather',
    headline: 'Record Heat Wave Grips Southern Europe',
    summary: 'Temperatures exceed 45°C across Spain and Italy. Health warnings issued in 12 countries.',
    source: 'BBC Weather',
    timestamp: minutesAgo(180),
    status: 'elevated',
    priority: 'high',
    tags: ['heat', 'europe', 'climate'],
    location: { lat: 40.4168, lng: -3.7038, name: 'Madrid, Spain' },
  },
  
  // Science
  {
    id: generateId(),
    topicId: 'science',
    headline: 'SpaceX Starship Completes First Orbital Refueling Test',
    summary: 'Historic milestone achieved as two Starship vehicles successfully transfer fuel in orbit.',
    source: 'Space.com',
    timestamp: minutesAgo(60),
    status: 'elevated',
    priority: 'high',
    isBreaking: true,
    tags: ['spacex', 'starship', 'space'],
    location: { lat: 28.5721, lng: -80.6480, name: 'Cape Canaveral' },
  },
  {
    id: generateId(),
    topicId: 'science',
    headline: 'James Webb Telescope Discovers New Earth-Like Exoplanet',
    summary: 'Planet in habitable zone shows signs of water vapor in atmosphere. Scientists "cautiously excited."',
    source: 'NASA',
    timestamp: minutesAgo(300),
    status: 'normal',
    priority: 'medium',
    tags: ['jwst', 'exoplanet', 'discovery'],
  },
];

export const mockTopicStats: TopicStats[] = [
  {
    topicId: 'world-news',
    activeCount: 12,
    status: 'critical',
    trend: 'up',
    latestHeadline: 'UN Security Council Emergency Session Called',
  },
  {
    topicId: 'markets',
    activeCount: 8,
    status: 'elevated',
    trend: 'up',
    latestHeadline: 'Bitcoin Surges Past $95,000',
  },
  {
    topicId: 'tech',
    activeCount: 15,
    status: 'critical',
    trend: 'up',
    latestHeadline: 'AWS Experiencing Global Outage',
  },
  {
    topicId: 'sports',
    activeCount: 6,
    status: 'elevated',
    trend: 'stable',
    latestHeadline: 'Champions League Final LIVE',
  },
  {
    topicId: 'entertainment',
    activeCount: 4,
    status: 'normal',
    trend: 'stable',
    latestHeadline: 'Marvel Announces Phase 7',
  },
  {
    topicId: 'memes',
    activeCount: 3,
    status: 'elevated',
    trend: 'up',
    latestHeadline: '"Monitoring the Situation" Goes Viral',
  },
  {
    topicId: 'weather',
    activeCount: 7,
    status: 'critical',
    trend: 'up',
    latestHeadline: 'Category 4 Hurricane Approaching',
  },
  {
    topicId: 'science',
    activeCount: 5,
    status: 'elevated',
    trend: 'up',
    latestHeadline: 'SpaceX Orbital Refueling Success',
  },
];

export const mockMarketData: MarketData[] = [
  { symbol: 'BTC', name: 'Bitcoin', price: 95420.50, change: 3250.00, changePercent: 3.52 },
  { symbol: 'ETH', name: 'Ethereum', price: 3890.25, change: 145.30, changePercent: 3.88 },
  { symbol: 'SPY', name: 'S&P 500', price: 5892.40, change: 42.15, changePercent: 0.72 },
  { symbol: 'NVDA', name: 'NVIDIA', price: 1245.80, change: 87.50, changePercent: 7.56 },
  { symbol: 'GOLD', name: 'Gold', price: 2385.60, change: -12.40, changePercent: -0.52 },
  { symbol: 'DXY', name: 'Dollar Index', price: 104.25, change: 0.35, changePercent: 0.34 },
];

export const getSituationsByTopic = (topicId: TopicId): Situation[] => {
  return mockSituations
    .filter((s) => s.topicId === topicId)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

export const getBreakingSituations = (): Situation[] => {
  return mockSituations
    .filter((s) => s.isBreaking)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

export const getGlobalStatus = (): SituationStatus => {
  const criticalCount = mockTopicStats.filter((s) => s.status === 'critical').length;
  const elevatedCount = mockTopicStats.filter((s) => s.status === 'elevated').length;
  
  if (criticalCount >= 2) return 'critical';
  if (criticalCount >= 1 || elevatedCount >= 3) return 'elevated';
  return 'normal';
};
