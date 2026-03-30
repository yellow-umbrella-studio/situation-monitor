// Situation Monitor - Design System
export const colors = {
  // Backgrounds
  background: '#0A0A0F',
  backgroundSecondary: '#0F0F14',
  card: '#14141A',
  cardHover: '#1A1A22',
  cardBorder: '#1E1E28',
  
  // Primary accent (monitoring green)
  primary: '#00FF88',
  primaryDim: '#00CC6A',
  primaryGlow: 'rgba(0, 255, 136, 0.15)',
  primaryGlowStrong: 'rgba(0, 255, 136, 0.3)',
  
  // Status colors
  success: '#00FF88',
  warning: '#FFB800',
  warningDim: '#CC9300',
  alert: '#FF3B3B',
  alertDim: '#CC2F2F',
  info: '#00B4FF',
  
  // Text
  text: '#FFFFFF',
  textSecondary: '#B4B4C0',
  textMuted: '#8B8B9A',
  textDark: '#5A5A68',
  
  // Gradients
  gradientStart: '#0A0A0F',
  gradientEnd: '#14141A',
  
  // Topic colors
  topicNews: '#FF6B6B',
  topicMarkets: '#4ECDC4',
  topicTech: '#9B59B6',
  topicSports: '#F39C12',
  topicEntertainment: '#E91E63',
  topicMemes: '#00BCD4',
  topicWeather: '#3498DB',
  topicScience: '#8E44AD',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    letterSpacing: -0.2,
  },
  h4: {
    fontSize: 17,
    fontWeight: '600' as const,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  bodySmall: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 18,
  },
  caption: {
    fontSize: 12,
    fontWeight: '500' as const,
    letterSpacing: 0.5,
  },
  ticker: {
    fontSize: 11,
    fontWeight: '600' as const,
    letterSpacing: 0.3,
  },
};

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  glow: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  alertGlow: {
    shadowColor: colors.alert,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
};

export default {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
};
