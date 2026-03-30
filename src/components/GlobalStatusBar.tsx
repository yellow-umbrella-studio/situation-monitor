import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  useSharedValue,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import { SituationStatus, getGlobalStatus } from '../data/mockData';
import { StatusIndicator } from './StatusIndicator';
import { getStatusColor, getStatusLabel, getStatusDescription } from '../utils/helpers';
import { colors, borderRadius, spacing, typography } from '../constants/theme';

interface GlobalStatusBarProps {
  onPress?: () => void;
}

export function GlobalStatusBar({ onPress }: GlobalStatusBarProps) {
  const status = getGlobalStatus();
  const statusColor = getStatusColor(status);
  const statusLabel = getStatusLabel(status);
  const statusDescription = getStatusDescription(status);

  const glowOpacity = useSharedValue(0.2);

  React.useEffect(() => {
    if (status !== 'normal') {
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.4, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.2, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }
  }, [status]);

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Background glow */}
      <Animated.View
        style={[
          styles.glowBackground,
          { backgroundColor: statusColor },
          animatedGlowStyle,
        ]}
      />

      <LinearGradient
        colors={[colors.card, colors.backgroundSecondary]}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.statusSection}>
            <View style={styles.statusHeader}>
              <Text style={styles.label}>GLOBAL STATUS</Text>
              <StatusIndicator status={status} size="medium" />
            </View>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {statusLabel}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.descriptionSection}>
            <Text style={styles.description} numberOfLines={2}>
              {statusDescription}
            </Text>
            <View style={styles.monitoringBadge}>
              <Feather name="eye" size={12} color={colors.primary} />
              <Text style={styles.monitoringText}>MONITORING</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Border glow effect */}
      <View
        style={[
          styles.borderGlow,
          {
            borderColor: statusColor,
            shadowColor: statusColor,
          },
        ]}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  glowBackground: {
    position: 'absolute',
    top: -50,
    left: -50,
    right: -50,
    bottom: -50,
    borderRadius: 100,
  },
  gradient: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  content: {
    padding: spacing.lg,
    flexDirection: 'row',
  },
  statusSection: {
    flex: 1,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  label: {
    ...typography.caption,
    color: colors.textMuted,
    letterSpacing: 1,
  },
  statusText: {
    ...typography.h2,
    fontWeight: '800',
    letterSpacing: 1,
  },
  divider: {
    width: 1,
    backgroundColor: colors.cardBorder,
    marginHorizontal: spacing.md,
  },
  descriptionSection: {
    flex: 1.2,
    justifyContent: 'space-between',
  },
  description: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  monitoringBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryGlow,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    marginTop: spacing.sm,
  },
  monitoringText: {
    ...typography.ticker,
    color: colors.primary,
  },
  borderGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    pointerEvents: 'none',
  },
});

export default GlobalStatusBar;
