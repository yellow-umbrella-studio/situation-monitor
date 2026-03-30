import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { SituationStatus } from '../data/mockData';
import { getStatusColor } from '../utils/helpers';

interface StatusIndicatorProps {
  status: SituationStatus;
  size?: 'small' | 'medium' | 'large';
  animated?: boolean;
}

const sizes = {
  small: 8,
  medium: 12,
  large: 16,
};

export function StatusIndicator({
  status,
  size = 'medium',
  animated = true,
}: StatusIndicatorProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const glowOpacity = useSharedValue(0.4);

  const color = getStatusColor(status);
  const dotSize = sizes[size];

  useEffect(() => {
    if (animated && status !== 'normal') {
      // Pulse animation for non-normal statuses
      scale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 600, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );

      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 600, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.3, { duration: 600, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    } else {
      scale.value = withTiming(1);
      glowOpacity.value = withTiming(0.4);
    }
  }, [status, animated]);

  const animatedDotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <View style={[styles.container, { width: dotSize * 2.5, height: dotSize * 2.5 }]}>
      {/* Outer glow */}
      <Animated.View
        style={[
          styles.glow,
          animatedGlowStyle,
          {
            width: dotSize * 2.5,
            height: dotSize * 2.5,
            borderRadius: dotSize * 1.25,
            backgroundColor: color,
          },
        ]}
      />
      {/* Inner dot */}
      <Animated.View
        style={[
          styles.dot,
          animatedDotStyle,
          {
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow: {
    position: 'absolute',
  },
  dot: {
    zIndex: 1,
  },
});

export default StatusIndicator;
