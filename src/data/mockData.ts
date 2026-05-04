import { TopicId } from '../constants/topics';
import { SituationStatus } from '../utils/helpers';

export type { SituationStatus };
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

export const mockMarketData: MarketData[] = [
  { symbol: 'BTC', name: 'Bitcoin', price: 95420.50, change: 3250.00, changePercent: 3.52 },
  { symbol: 'ETH', name: 'Ethereum', price: 3890.25, change: 145.30, changePercent: 3.88 },
  { symbol: 'SPY', name: 'S&P 500', price: 5892.40, change: 42.15, changePercent: 0.72 },
  { symbol: 'GOLD', name: 'Gold', price: 2385.60, change: -12.40, changePercent: -0.52 },
];

// Keep these helpers for screens that still use them
export const mockTopicStats: TopicStats[] = [];
export const mockSituations: Situation[] = [];

export const getSituationsByTopic = (topicId: TopicId): Situation[] => [];
export const getBreakingSituations = (): Situation[] => [];
export const getGlobalStatus = (): SituationStatus => 'normal';
