import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../constants/theme';

interface GlobeAnimationProps {
  size?: number;
  color?: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function GlobeAnimation({ size = 200, color = colors.primary }: GlobeAnimationProps) {
  const rotation = useSharedValue(0);
  const pulse = useSharedValue(1);
  const scanLine = useSharedValue(0);

  useEffect(() => {
    // Continuous rotation
    rotation.value = withRepeat(
      withTiming(360, { duration: 20000, easing: Easing.linear }),
      -1,
      false
    );

    // Pulse effect
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Scan line animation
    scanLine.value = withRepeat(
      withTiming(1, { duration: 3000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const globeStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: pulse.value },
      { rotateZ: `${rotation.value}deg` },
    ],
  }));

  const scanLineStyle = useAnimatedStyle(() => ({
    top: interpolate(scanLine.value, [0, 1], [-20, size + 20]),
    opacity: interpolate(scanLine.value, [0, 0.1, 0.9, 1], [0, 1, 1, 0]),
  }));

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: interpolate(pulse.value, [1, 1.05], [0.3, 0.5]),
  }));

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Outer glow */}
      <Animated.View
        style={[
          styles.glow,
          {
            width: size * 1.5,
            height: size * 1.5,
            borderRadius: size * 0.75,
            backgroundColor: color,
          },
          glowStyle,
        ]}
      />

      {/* Main globe */}
      <Animated.View style={[styles.globe, globeStyle, { width: size, height: size }]}>
        <View style={[styles.globeInner, { borderRadius: size / 2, borderColor: color }]}>
          {/* Latitude lines */}
          {[0.25, 0.5, 0.75].map((pos, i) => (
            <View
              key={`lat-${i}`}
              style={[
                styles.latitudeLine,
                {
                  top: size * pos,
                  borderColor: color + '40',
                },
              ]}
            />
          ))}

          {/* Longitude lines */}
          {[0.25, 0.5, 0.75].map((pos, i) => (
            <View
              key={`lng-${i}`}
              style={[
                styles.longitudeLine,
                {
                  left: size * pos,
                  borderColor: color + '40',
                },
              ]}
            />
          ))}

          {/* Center dot */}
          <View style={[styles.centerDot, { backgroundColor: color }]} />

          {/* Orbiting dots */}
          <OrbitingDot size={size} color={color} delay={0} />
          <OrbitingDot size={size} color={color} delay={2000} />
          <OrbitingDot size={size} color={color} delay={4000} />
        </View>
      </Animated.View>

      {/* Scan line */}
      <Animated.View
        style={[
          styles.scanLine,
          {
            width: size * 1.2,
            left: -size * 0.1,
          },
          scanLineStyle,
        ]}
      >
        <LinearGradient
          colors={['transparent', color + '60', 'transparent']}
          style={styles.scanLineGradient}
        />
      </Animated.View>
    </View>
  );
}

function OrbitingDot({ size, color, delay }: { size: number; color: string; delay: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      progress.value = withRepeat(
        withTiming(1, { duration: 6000, easing: Easing.linear }),
        -1,
        false
      );
    }, delay);

    return () => clearTimeout(timer);
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const angle = progress.value * Math.PI * 2;
    const radius = size * 0.35;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius * 0.3; // Elliptical orbit

    return {
      transform: [
        { translateX: x },
        { translateY: y },
      ],
      opacity: interpolate(Math.sin(angle), [-1, 1], [0.3, 1]),
    };
  });

  return (
    <Animated.View
      style={[
        styles.orbitingDot,
        { backgroundColor: color },
        animatedStyle,
      ]}
    />
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
  globe: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  globeInner: {
    width: '100%',
    height: '100%',
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  latitudeLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 0,
    borderTopWidth: 1,
    borderStyle: 'dashed',
  },
  longitudeLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 0,
    borderLeftWidth: 1,
    borderStyle: 'dashed',
  },
  centerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  orbitingDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  scanLine: {
    position: 'absolute',
    height: 2,
  },
  scanLineGradient: {
    flex: 1,
  },
});

export default GlobeAnimation;
