import { SituationStatus } from '../data/mockData';
import { colors } from '../constants/theme';

export const formatTimeAgo = (date: Date): string => {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'Just now';
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
};

export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

export const formatCurrency = (num: number, decimals = 2): string => {
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

export const formatPercent = (num: number): string => {
  const sign = num >= 0 ? '+' : '';
  return `${sign}${num.toFixed(2)}%`;
};

export const getStatusColor = (status: SituationStatus): string => {
  switch (status) {
    case 'critical':
      return colors.alert;
    case 'elevated':
      return colors.warning;
    case 'normal':
    default:
      return colors.success;
  }
};

export const getStatusLabel = (status: SituationStatus): string => {
  switch (status) {
    case 'critical':
      return 'CRITICAL';
    case 'elevated':
      return 'ELEVATED';
    case 'normal':
    default:
      return 'NORMAL';
  }
};

export const getStatusDescription = (status: SituationStatus): string => {
  switch (status) {
    case 'critical':
      return 'Multiple critical situations require attention';
    case 'elevated':
      return 'Some situations showing elevated activity';
    case 'normal':
    default:
      return 'All systems nominal, situation stable';
  }
};

export const hapticFeedback = {
  light: () => {
    // Will be implemented with expo-haptics
  },
  medium: () => {
    // Will be implemented with expo-haptics
  },
  heavy: () => {
    // Will be implemented with expo-haptics
  },
};

export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
