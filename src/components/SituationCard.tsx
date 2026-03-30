import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  FadeIn,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { Situation } from '../data/mockData';
import { getTopicById, TopicId } from '../constants/topics';
import { StatusIndicator } from './StatusIndicator';
import { formatTimeAgo, getStatusColor } from '../utils/helpers';
import { colors, borderRadius, spacing, typography, shadows } from '../constants/theme';

interface SituationCardProps {
  situation: Situation;
  onPress?: () => void;
  compact?: boolean;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function SituationCard({ situation, onPress, compact = false }: SituationCardProps) {
  const scale = useSharedValue(1);
  const topic = getTopicById(situation.topicId);

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const statusColor = getStatusColor(situation.status);
  const isBreaking = situation.isBreaking;

  return (
    <AnimatedTouchable
      style={[styles.container, animatedStyle]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
      entering={FadeIn.duration(300)}
    >
      {/* Glow effect for breaking/critical */}
      {(isBreaking || situation.status === 'critical') && (
        <View
          style={[
            styles.glowBorder,
            { shadowColor: statusColor, borderColor: statusColor },
          ]}
        />
      )}

      <View style={[styles.card, isBreaking && { borderColor: statusColor }]}>
        {/* Breaking banner */}
        {isBreaking && (
          <LinearGradient
            colors={[statusColor, 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.breakingBanner}
          >
            <Feather name="alert-circle" size={12} color={colors.background} />
            <Text style={styles.breakingText}>BREAKING</Text>
          </LinearGradient>
        )}

        <View style={styles.header}>
          <View style={styles.topicBadge}>
            <View style={[styles.topicIcon, { backgroundColor: topic?.color + '20' }]}>
              <Feather
                name={(topic?.icon as any) || 'circle'}
                size={14}
                color={topic?.color || colors.primary}
              />
            </View>
            <Text style={[styles.topicName, { color: topic?.color }]}>
              {topic?.shortName || 'Unknown'}
            </Text>
          </View>
          <View style={styles.statusContainer}>
            <StatusIndicator status={situation.status} size="small" />
            <Text style={[styles.timestamp, { color: colors.textMuted }]}>
              {formatTimeAgo(situation.timestamp)}
            </Text>
          </View>
        </View>

        <Text style={styles.headline} numberOfLines={compact ? 2 : 3}>
          {situation.headline}
        </Text>

        {!compact && (
          <Text style={styles.summary} numberOfLines={2}>
            {situation.summary}
          </Text>
        )}

        <View style={styles.footer}>
          <View style={styles.sourceContainer}>
            <Text style={styles.source}>{situation.source}</Text>
            {situation.location && (
              <>
                <Text style={styles.dot}>•</Text>
                <Feather name="map-pin" size={10} color={colors.textMuted} />
                <Text style={styles.location}>{situation.location.name}</Text>
              </>
            )}
          </View>
          <Feather name="chevron-right" size={16} color={colors.textMuted} />
        </View>
      </View>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  glowBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: borderRadius.lg + 2,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
  },
  breakingBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderTopLeftRadius: borderRadius.lg - 1,
    borderBottomRightRadius: borderRadius.sm,
  },
  breakingText: {
    ...typography.caption,
    color: colors.background,
    marginLeft: 4,
    fontWeight: '700',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  topicBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topicIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topicName: {
    ...typography.caption,
    marginLeft: spacing.xs,
    fontWeight: '600',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  timestamp: {
    ...typography.caption,
  },
  headline: {
    ...typography.h4,
    color: colors.text,
    lineHeight: 24,
    marginBottom: spacing.sm,
  },
  summary: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  sourceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  source: {
    ...typography.caption,
    color: colors.textMuted,
  },
  dot: {
    color: colors.textMuted,
    fontSize: 8,
  },
  location: {
    ...typography.caption,
    color: colors.textMuted,
    marginLeft: 2,
  },
});

export default SituationCard;
