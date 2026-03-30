import { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { GlobeAnimation } from '../src/components';
import { useAppContext } from '../src/context/AppContext';
import { colors, typography, spacing } from '../src/constants/theme';

export default function SplashScreen() {
  const router = useRouter();
  const { hasOnboarded, isLoading } = useAppContext();

  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(20);
  const subtitleOpacity = useSharedValue(0);
  const globeScale = useSharedValue(0.8);
  const globeOpacity = useSharedValue(0);

  const navigate = () => {
    if (hasOnboarded) {
      router.replace('/(tabs)');
    } else {
      router.replace('/onboarding');
    }
  };

  useEffect(() => {
    if (isLoading) return;

    // Start animations
    globeOpacity.value = withTiming(1, { duration: 800 });
    globeScale.value = withTiming(1, { duration: 1000, easing: Easing.out(Easing.back) });

    titleOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));
    titleTranslateY.value = withDelay(400, withTiming(0, { duration: 600, easing: Easing.out(Easing.ease) }));

    subtitleOpacity.value = withDelay(800, withTiming(1, { duration: 600 }));

    // Navigate after animations
    const timer = setTimeout(navigate, 2500);
    return () => clearTimeout(timer);
  }, [isLoading, hasOnboarded]);

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  const globeStyle = useAnimatedStyle(() => ({
    opacity: globeOpacity.value,
    transform: [{ scale: globeScale.value }],
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.globeContainer, globeStyle]}>
        <GlobeAnimation size={180} />
      </Animated.View>

      <Animated.View style={[styles.titleContainer, titleStyle]}>
        <Text style={styles.title}>SITUATION</Text>
        <Text style={styles.titleAccent}>MONITOR</Text>
      </Animated.View>

      <Animated.View style={[styles.subtitleContainer, subtitleStyle]}>
        <View style={styles.statusDot} />
        <Text style={styles.subtitle}>Monitoring the situation</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  globeContainer: {
    marginBottom: spacing.xxxl,
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    ...typography.h1,
    fontSize: 36,
    color: colors.text,
    letterSpacing: 8,
    fontWeight: '300',
  },
  titleAccent: {
    ...typography.h1,
    fontSize: 36,
    color: colors.primary,
    letterSpacing: 8,
    fontWeight: '800',
  },
  subtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginRight: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    letterSpacing: 1,
  },
});
