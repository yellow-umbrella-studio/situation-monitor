import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { MarketData, mockMarketData } from '../data/mockData';
import { formatCurrency, formatPercent } from '../utils/helpers';
import { colors, spacing, typography, borderRadius } from '../constants/theme';

interface LiveTickerProps {
  data?: MarketData[];
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function LiveTicker({ data = mockMarketData }: LiveTickerProps) {
  const translateX = useSharedValue(0);

  // Calculate content width (approximate)
  const itemWidth = 140;
  const totalWidth = data.length * itemWidth;

  useEffect(() => {
    translateX.value = withRepeat(
      withTiming(-totalWidth, {
        duration: data.length * 5000,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, [data.length]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  // Duplicate data for seamless loop
  const duplicatedData = [...data, ...data];

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <View style={styles.liveDot} />
        <Text style={styles.liveText}>LIVE</Text>
      </View>
      
      <View style={styles.tickerContainer}>
        <Animated.View style={[styles.tickerContent, animatedStyle]}>
          {duplicatedData.map((item, index) => (
            <TickerItem key={`${item.symbol}-${index}`} data={item} />
          ))}
        </Animated.View>
      </View>
    </View>
  );
}

function TickerItem({ data }: { data: MarketData }) {
  const isPositive = data.change >= 0;

  return (
    <View style={styles.tickerItem}>
      <Text style={styles.symbol}>{data.symbol}</Text>
      <Text style={styles.price}>${formatCurrency(data.price, data.price > 1000 ? 0 : 2)}</Text>
      <View style={[styles.changeBadge, isPositive ? styles.changeBadgePositive : styles.changeBadgeNegative]}>
        <Text style={[styles.changeText, isPositive ? styles.changeTextPositive : styles.changeTextNegative]}>
          {formatPercent(data.changePercent)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingRight: spacing.sm,
    borderRightWidth: 1,
    borderRightColor: colors.cardBorder,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.alert,
    marginRight: 6,
  },
  liveText: {
    ...typography.ticker,
    color: colors.alert,
  },
  tickerContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  tickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  symbol: {
    ...typography.ticker,
    color: colors.textMuted,
    fontWeight: '700',
  },
  price: {
    ...typography.ticker,
    color: colors.text,
  },
  changeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  changeBadgePositive: {
    backgroundColor: colors.success + '20',
  },
  changeBadgeNegative: {
    backgroundColor: colors.alert + '20',
  },
  changeText: {
    ...typography.ticker,
    fontSize: 10,
  },
  changeTextPositive: {
    color: colors.success,
  },
  changeTextNegative: {
    color: colors.alert,
  },
});

export default LiveTicker;
