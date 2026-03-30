import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  withSequence,
  runOnJS,
  SlideInUp,
  SlideOutUp,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import { Situation } from '../data/mockData';
import { getTopicById } from '../constants/topics';
import { formatTimeAgo, getStatusColor } from '../utils/helpers';
import { colors, borderRadius, spacing, typography } from '../constants/theme';

interface AlertBannerProps {
  situation: Situation;
  onPress?: () => void;
  onDismiss?: () => void;
  autoDismiss?: number; // milliseconds
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function AlertBanner({
  situation,
  onPress,
  onDismiss,
  autoDismiss = 5000,
}: AlertBannerProps) {
  const progress = useSharedValue(0);
  const topic = getTopicById(situation.topicId);
  const statusColor = getStatusColor(situation.status);

  useEffect(() => {
    if (autoDismiss > 0) {
      progress.value = withTiming(1, { duration: autoDismiss }, (finished) => {
        if (finished && onDismiss) {
          runOnJS(onDismiss)();
        }
      });
    }
  }, [autoDismiss]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${(1 - progress.value) * 100}%`,
  }));

  return (
    <Animated.View
      style={styles.container}
      entering={SlideInUp.springify().damping(15)}
      exiting={SlideOutUp.springify()}
    >
      <TouchableOpacity
        style={styles.content}
        onPress={onPress}
        activeOpacity={0.9}
      >
        {/* Colored accent bar */}
        <View style={[styles.accentBar, { backgroundColor: statusColor }]} />

        {/* Alert icon */}
        <View style={[styles.iconContainer, { backgroundColor: statusColor + '20' }]}>
          <Feather
            name={topic?.icon as any || 'alert-circle'}
            size={18}
            color={statusColor}
          />
        </View>

        {/* Content */}
        <View style={styles.textContainer}>
          <View style={styles.header}>
            <Text style={[styles.topicName, { color: topic?.color }]}>
              {topic?.shortName || 'Alert'}
            </Text>
            <Text style={styles.timestamp}>{formatTimeAgo(situation.timestamp)}</Text>
          </View>
          <Text style={styles.headline} numberOfLines={2}>
            {situation.headline}
          </Text>
        </View>

        {/* Dismiss button */}
        <TouchableOpacity
          style={styles.dismissButton}
          onPress={onDismiss}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather name="x" size={16} color={colors.textMuted} />
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Progress bar */}
      {autoDismiss > 0 && (
        <Animated.View
          style={[styles.progressBar, { backgroundColor: statusColor }, progressStyle]}
        />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    paddingLeft: 0,
  },
  accentBar: {
    width: 4,
    alignSelf: 'stretch',
    marginRight: spacing.md,
    borderTopLeftRadius: borderRadius.lg,
    borderBottomLeftRadius: borderRadius.lg,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  textContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  topicName: {
    ...typography.caption,
    fontWeight: '700',
  },
  timestamp: {
    ...typography.caption,
    color: colors.textMuted,
  },
  headline: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '500',
    lineHeight: 18,
  },
  dismissButton: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
  progressBar: {
    height: 2,
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
});

export default AlertBanner;
