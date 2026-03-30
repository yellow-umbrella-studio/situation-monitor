import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  FadeInUp,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { TopicStats } from '../data/mockData';
import { getTopicById } from '../constants/topics';
import { StatusIndicator } from './StatusIndicator';
import { colors, borderRadius, spacing, typography } from '../constants/theme';

interface TopicCardProps {
  stats: TopicStats;
  onPress?: () => void;
  index?: number;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function TopicCard({ stats, onPress, index = 0 }: TopicCardProps) {
  const scale = useSharedValue(1);
  const topic = getTopicById(stats.topicId);

  const handlePressIn = () => {
    scale.value = withSpring(0.97);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (!topic) return null;

  const trendIcon = stats.trend === 'up' ? 'trending-up' : stats.trend === 'down' ? 'trending-down' : 'minus';
  const trendColor = stats.trend === 'up' ? colors.primary : stats.trend === 'down' ? colors.alert : colors.textMuted;

  return (
    <AnimatedTouchable
      style={[styles.container, animatedStyle]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
      entering={FadeInUp.delay(index * 50).springify()}
    >
      <LinearGradient
        colors={[topic.color + '15', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      />

      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: topic.color + '25' }]}>
          <Feather name={topic.icon as any} size={20} color={topic.color} />
        </View>
        <StatusIndicator status={stats.status} size="small" />
      </View>

      <Text style={styles.topicName}>{topic.name}</Text>
      
      <Text style={styles.headline} numberOfLines={2}>
        {stats.latestHeadline}
      </Text>

      <View style={styles.footer}>
        <View style={styles.statsContainer}>
          <Text style={styles.activeCount}>{stats.activeCount}</Text>
          <Text style={styles.activeLabel}>active</Text>
        </View>
        <View style={styles.trendContainer}>
          <Feather name={trendIcon as any} size={14} color={trendColor} />
        </View>
      </View>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    width: '48%',
    marginBottom: spacing.md,
    overflow: 'hidden',
    minHeight: 160,
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topicName: {
    ...typography.caption,
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  headline: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
    lineHeight: 18,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: spacing.sm,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  activeCount: {
    ...typography.h3,
    color: colors.primary,
  },
  activeLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  trendContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TopicCard;
