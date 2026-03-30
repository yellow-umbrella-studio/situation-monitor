import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { Topic } from '../constants/topics';
import { colors, borderRadius, spacing, typography } from '../constants/theme';

interface TopicChipProps {
  topic: Topic;
  selected: boolean;
  onPress: () => void;
  size?: 'small' | 'medium' | 'large';
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function TopicChip({
  topic,
  selected,
  onPress,
  size = 'medium',
}: TopicChipProps) {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isSmall = size === 'small';
  const isLarge = size === 'large';

  return (
    <AnimatedTouchable
      style={[
        styles.container,
        animatedStyle,
        selected && styles.containerSelected,
        selected && { borderColor: topic.color },
        isSmall && styles.containerSmall,
        isLarge && styles.containerLarge,
      ]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.8}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: selected ? topic.color : colors.cardHover },
          isSmall && styles.iconContainerSmall,
        ]}
      >
        <Feather
          name={topic.icon as any}
          size={isSmall ? 12 : 16}
          color={selected ? colors.background : colors.textMuted}
        />
      </View>
      <View style={styles.textContainer}>
        <Text
          style={[
            styles.name,
            selected && styles.nameSelected,
            isSmall && styles.nameSmall,
          ]}
          numberOfLines={1}
        >
          {isSmall ? topic.shortName : topic.name}
        </Text>
        {!isSmall && (
          <Text style={styles.description} numberOfLines={1}>
            {topic.description}
          </Text>
        )}
      </View>
      {selected && (
        <View style={[styles.checkmark, { backgroundColor: topic.color }]}>
          <Feather name="check" size={12} color={colors.background} />
        </View>
      )}
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.cardBorder,
    marginBottom: spacing.sm,
  },
  containerSelected: {
    backgroundColor: colors.backgroundSecondary,
  },
  containerSmall: {
    padding: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: 0,
    marginRight: spacing.sm,
  },
  containerLarge: {
    padding: spacing.lg,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  iconContainerSmall: {
    width: 24,
    height: 24,
    marginRight: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    ...typography.h4,
    color: colors.text,
  },
  nameSelected: {
    color: colors.primary,
  },
  nameSmall: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
  description: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginTop: 2,
  },
  checkmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TopicChip;
