import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
  withRepeat,
  useAnimatedScrollHandler,
  FadeIn,
  FadeInUp,
  FadeInDown,
  FadeInLeft,
  FadeInRight,
  FadeOut,
  SharedValue,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { StatusIndicator } from '../../src/components';
import { useAppContext } from '../../src/context/AppContext';
import { topics, TopicId } from '../../src/constants/topics';
import { colors, borderRadius, spacing, typography } from '../../src/constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const PAGES = ['welcome', 'topics', 'notifications', 'summary', 'paywall'] as const;
type PageType = (typeof PAGES)[number];

export default function OnboardingScreen() {
  const router = useRouter();
  const {
    selectedTopics,
    toggleTopic,
    setNotificationsEnabled,
    setHasOnboarded,
  } = useAppContext();

  const [currentPage, setCurrentPage] = useState<PageType>('welcome');
  const [notificationsChoice, setNotificationsChoice] = useState(true);
  const scrollX = useSharedValue(0);
  const flatListRef = useRef<FlatList>(null);

  const currentIndex = PAGES.indexOf(currentPage);

  const goToPage = (index: number) => {
    if (index >= 0 && index < PAGES.length) {
      flatListRef.current?.scrollToIndex({ index, animated: true });
      setCurrentPage(PAGES[index]);
    }
  };

  const handleNext = async () => {
    if (currentIndex < PAGES.length - 1) {
      goToPage(currentIndex + 1);
    } else {
      await setNotificationsEnabled(notificationsChoice);
      await setHasOnboarded(true);
      router.replace('/(tabs)');
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      goToPage(currentIndex - 1);
    }
  };

  const canProceed = () => {
    if (currentPage === 'topics') return selectedTopics.length >= 1;
    return true;
  };

  const renderPage = ({ item }: { item: PageType }) => {
    switch (item) {
      case 'welcome':
        return <WelcomePage />;
      case 'topics':
        return (
          <TopicsPage
            selectedTopics={selectedTopics}
            onToggle={toggleTopic}
          />
        );
      case 'notifications':
        return (
          <NotificationsPage
            enabled={notificationsChoice}
            onToggle={() => setNotificationsChoice(!notificationsChoice)}
          />
        );
      case 'summary':
        return <SummaryPage selectedTopics={selectedTopics} notificationsEnabled={notificationsChoice} />;
      case 'paywall':
        return <PaywallPage />;
    }
  };

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const getButtonLabel = () => {
    switch (currentPage) {
      case 'welcome': return 'Get started';
      case 'topics': return 'Continue';
      case 'notifications': return 'Next';
      case 'summary': return 'Next';
      case 'paywall': return 'Start free trial';
    }
  };

  return (
    <View style={styles.container}>
      {/* Pages */}
      <Animated.FlatList
        ref={flatListRef}
        data={PAGES}
        renderItem={renderPage}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        onScroll={scrollHandler}
        keyExtractor={(item) => item}
        scrollEventThrottle={16}
      />

      {/* Bottom area */}
      <View style={styles.bottomArea}>
        {currentPage !== 'paywall' && (
          <View style={styles.progressRow}>
            {PAGES.slice(0, -1).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.progressPill,
                  i === currentIndex && styles.progressPillActive,
                  i < currentIndex && styles.progressPillDone,
                ]}
              />
            ))}
          </View>
        )}

        {currentPage === 'paywall' ? (
          <View style={styles.paywallNav}>
            <TouchableOpacity
              style={styles.paywallCta}
              onPress={handleNext}
              activeOpacity={0.85}
            >
              <Text style={styles.paywallCtaLabel}>Start free trial</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleNext} activeOpacity={0.6}>
              <Text style={styles.paywallSkip}>No thanks, continue with free</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.navRow}>
            {currentIndex > 0 ? (
              <TouchableOpacity onPress={handleBack} activeOpacity={0.6}>
                <Text style={styles.backLabel}>Back</Text>
              </TouchableOpacity>
            ) : (
              <View />
            )}

            <TouchableOpacity
              style={[
                styles.ctaButton,
                !canProceed() && styles.ctaButtonDisabled,
              ]}
              onPress={handleNext}
              disabled={!canProceed()}
              activeOpacity={0.85}
            >
              <Text style={[styles.ctaLabel, !canProceed() && styles.ctaLabelDisabled]}>
                {getButtonLabel()}
              </Text>
              <Feather
                name="arrow-right"
                size={16}
                color={canProceed() ? '#000' : colors.textDark}
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

// ─── Welcome ─────────────────────────────────────────────────────

function WelcomePage() {
  const gradientPos = useSharedValue(0);

  useEffect(() => {
    gradientPos.value = withRepeat(
      withTiming(1, { duration: 6000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const meshStyle1 = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(gradientPos.value, [0, 1], [-20, 30]) },
      { translateY: interpolate(gradientPos.value, [0, 1], [0, 20]) },
    ],
  }));

  const meshStyle2 = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(gradientPos.value, [0, 1], [20, -30]) },
      { translateY: interpolate(gradientPos.value, [0, 1], [10, -15]) },
    ],
  }));

  return (
    <View style={styles.page}>
      {/* Mesh gradient background */}
      <View style={styles.welcomeGradientWrap}>
        <Animated.View style={[styles.meshBlob1, meshStyle1]}>
          <LinearGradient
            colors={['#00FF8818', '#00C9FF10', 'transparent']}
            style={styles.meshGradient}
            start={{ x: 0.2, y: 0 }}
            end={{ x: 0.8, y: 1 }}
          />
        </Animated.View>
        <Animated.View style={[styles.meshBlob2, meshStyle2]}>
          <LinearGradient
            colors={['#7B61FF12', '#00FF8810', 'transparent']}
            style={styles.meshGradient}
            start={{ x: 0.8, y: 0.2 }}
            end={{ x: 0.2, y: 0.8 }}
          />
        </Animated.View>
        {/* Bottom fade to black */}
        <LinearGradient
          colors={['transparent', '#050508']}
          style={styles.welcomeBottomFade}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 0.5, y: 1 }}
        />
      </View>

      <View style={styles.welcomeLayout}>
        <View style={styles.welcomeTop}>
          <Animated.View entering={FadeInUp.delay(200).duration(700)}>
            <Text style={styles.heroTitle}>
              Situation{'\n'}Monitor
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(400).duration(600)}>
            <Text style={styles.heroTagline}>
              Real-time intelligence.{'\n'}Zero noise.
            </Text>
          </Animated.View>
        </View>

        {/* Bottom section - floating tags */}
        <Animated.View
          style={styles.welcomeBottom}
          entering={FadeInUp.delay(650).duration(600)}
        >
          <View style={styles.tagRow}>
            <FloatingTag label="Breaking News" delay={0} />
            <FloatingTag label="Markets" delay={80} />
            <FloatingTag label="Tech" delay={160} />
          </View>
          <View style={styles.tagRow}>
            <FloatingTag label="Sports" delay={240} />
            <FloatingTag label="Culture" delay={320} />
            <FloatingTag label="Science" delay={400} />
            <FloatingTag label="Weather" delay={480} />
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

function FloatingTag({ label, delay }: { label: string; delay: number }) {
  return (
    <Animated.View
      entering={FadeInUp.delay(700 + delay).duration(400)}
      style={styles.floatingTag}
    >
      <Text style={styles.floatingTagText}>{label}</Text>
    </Animated.View>
  );
}

// ─── Topics ──────────────────────────────────────────────────────

function TopicsPage({
  selectedTopics,
  onToggle,
}: {
  selectedTopics: TopicId[];
  onToggle: (id: TopicId) => void;
}) {
  const maxReached = selectedTopics.length >= 3;

  return (
    <View style={styles.page}>
      <View style={styles.topicsLayout}>
        <Animated.Text
          style={styles.sectionHeading}
          entering={FadeInUp.delay(150).duration(500)}
        >
          What are you{'\n'}tracking?
        </Animated.Text>
        <Animated.Text
          style={styles.topicsSubtext}
          entering={FadeInUp.delay(250).duration(500)}
        >
          Choose up to 3
        </Animated.Text>

        <View style={styles.topicCloud}>
          {topics.map((topic, index) => {
            const selected = selectedTopics.includes(topic.id);
            const disabled = maxReached && !selected;
            return (
              <Animated.View
                key={topic.id}
                entering={FadeInUp.delay(80 + index * 40).duration(350)}
              >
                <TopicPill
                  topic={topic}
                  selected={selected}
                  disabled={disabled}
                  onPress={() => onToggle(topic.id)}
                />
              </Animated.View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

function TopicPill({
  topic,
  selected,
  disabled,
  onPress,
}: {
  topic: (typeof topics)[0];
  selected: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  const handlePress = () => {
    if (disabled) return;
    onPress();
  };

  return (
    <Pressable onPress={handlePress}>
      <View
        style={[
          styles.topicPill,
          selected && styles.topicPillSelected,
          disabled && styles.topicPillDisabled,
        ]}
      >
        <Feather
          name={topic.icon as any}
          size={15}
          color={selected ? '#000' : disabled ? '#444' : '#9090A0'}
        />
        <Text
          style={[
            styles.topicPillText,
            selected && styles.topicPillTextSelected,
            disabled && styles.topicPillTextDisabled,
          ]}
        >
          {topic.shortName}
        </Text>
      </View>
    </Pressable>
  );
}

// ─── Notifications ───────────────────────────────────────────────

function NotificationsPage({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <View style={styles.page}>
      <View style={styles.notifLayout}>
        <Animated.Text
          style={styles.sectionHeading}
          entering={FadeInUp.delay(150).duration(500)}
        >
          Never miss a{'\n'}situation
        </Animated.Text>
        <Animated.Text
          style={styles.notifSubtext}
          entering={FadeInUp.delay(250).duration(500)}
        >
          Get alerted on critical events
        </Animated.Text>

        <Animated.View
          entering={FadeInUp.delay(350).duration(500)}
          style={styles.notifCards}
        >
          <Pressable onPress={() => !enabled && onToggle()}>
            <View style={[styles.notifCard, enabled && styles.notifCardActive]}>
              <View style={styles.notifCardHeader}>
                <Feather name="bell" size={18} color={enabled ? '#000' : '#9090A0'} />
                <Text style={[styles.notifCardTitle, enabled && styles.notifCardTitleActive]}>
                  Enable alerts
                </Text>
              </View>
              <Text style={[styles.notifCardDesc, enabled && styles.notifCardDescActive]}>
                Breaking news, market shifts, critical events
              </Text>
            </View>
          </Pressable>

          <Pressable onPress={() => enabled && onToggle()}>
            <View style={[styles.notifCard, !enabled && styles.notifCardActive]}>
              <View style={styles.notifCardHeader}>
                <Feather name="bell-off" size={18} color={!enabled ? '#000' : '#9090A0'} />
                <Text style={[styles.notifCardTitle, !enabled && styles.notifCardTitleActive]}>
                  Not now
                </Text>
              </View>
              <Text style={[styles.notifCardDesc, !enabled && styles.notifCardDescActive]}>
                You can turn this on later in settings
              </Text>
            </View>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

// ─── Summary ────────────────────────────────────────────────────

function SummaryPage({
  selectedTopics,
  notificationsEnabled,
}: {
  selectedTopics: TopicId[];
  notificationsEnabled: boolean;
}) {
  return (
    <View style={styles.page}>
      <View style={styles.summaryLayout}>
        <Animated.Text
          style={styles.sectionHeading}
          entering={FadeInUp.delay(150).duration(500)}
        >
          Your setup
        </Animated.Text>

        <View style={styles.summaryCards}>
          {/* Topics card */}
          <Animated.View entering={FadeInUp.delay(250).duration(450)}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryCardLabel}>TRACKING</Text>
              <View style={styles.summaryTopics}>
                {selectedTopics.map((topicId) => {
                  const topic = topics.find((t) => t.id === topicId);
                  if (!topic) return null;
                  return (
                    <View key={topicId} style={styles.summaryTopicPill}>
                      <Feather name={topic.icon as any} size={13} color="#000" />
                      <Text style={styles.summaryTopicText}>{topic.shortName}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </Animated.View>

          {/* Notifications card */}
          <Animated.View entering={FadeInUp.delay(350).duration(450)}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryCardLabel}>ALERTS</Text>
              <View style={styles.summaryAlertRow}>
                <Feather
                  name={notificationsEnabled ? 'bell' : 'bell-off'}
                  size={16}
                  color="#000"
                />
                <Text style={styles.summaryAlertText}>
                  {notificationsEnabled ? 'Enabled' : 'Disabled'}
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Stats preview */}
          <Animated.View entering={FadeInUp.delay(450).duration(450)}>
            <View style={styles.summaryStatsRow}>
              <View style={styles.summaryStat}>
                <Text style={styles.summaryStatNumber}>{selectedTopics.length}</Text>
                <Text style={styles.summaryStatLabel}>Feeds</Text>
              </View>
              <View style={styles.summaryStatDivider} />
              <View style={styles.summaryStat}>
                <Text style={styles.summaryStatNumber}>24/7</Text>
                <Text style={styles.summaryStatLabel}>Monitoring</Text>
              </View>
              <View style={styles.summaryStatDivider} />
              <View style={styles.summaryStat}>
                <Text style={styles.summaryStatNumber}>Live</Text>
                <Text style={styles.summaryStatLabel}>Updates</Text>
              </View>
            </View>
          </Animated.View>
        </View>
      </View>
    </View>
  );
}

// ─── Paywall ─────────────────────────────────────────────────────

function PaywallPage() {
  const drift = useSharedValue(0);

  useEffect(() => {
    drift.value = withRepeat(
      withTiming(1, { duration: 6000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const meshStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(drift.value, [0, 1], [-20, 20]) },
      { translateY: interpolate(drift.value, [0, 1], [0, 15]) },
    ],
  }));

  return (
    <View style={styles.page}>
      {/* Gradient bg */}
      <View style={styles.paywallGradientWrap}>
        <Animated.View style={[styles.paywallGradientBlob, meshStyle]}>
          <LinearGradient
            colors={['#FFB80015', '#FF6B6B10', '#9B59B60C', 'transparent']}
            style={styles.meshGradient}
            start={{ x: 0.2, y: 0 }}
            end={{ x: 0.8, y: 1 }}
          />
        </Animated.View>
        <LinearGradient
          colors={['transparent', '#050508']}
          style={styles.paywallGradientFade}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 0.5, y: 1 }}
        />
      </View>

      <View style={styles.paywallLayout}>
        <Animated.Text
          style={styles.paywallTitle}
          entering={FadeInUp.delay(150).duration(500)}
        >
          Unlock{'\n'}everything
        </Animated.Text>
        <Animated.Text
          style={styles.paywallSubtext}
          entering={FadeInUp.delay(250).duration(500)}
        >
          7 days free, then $4.99/month
        </Animated.Text>

        <Animated.View
          entering={FadeInUp.delay(350).duration(500)}
          style={styles.paywallFeatures}
        >
          <PaywallFeature icon="zap" text="Unlimited real-time alerts" />
          <PaywallFeature icon="globe" text="All topics & global coverage" />
          <PaywallFeature icon="trending-up" text="Live market data & analysis" />
          <PaywallFeature icon="share-2" text="Export & share situation cards" />
          <PaywallFeature icon="sliders" text="Custom monitoring filters" />
        </Animated.View>

        <Animated.View
          entering={FadeIn.delay(550).duration(400)}
          style={styles.paywallBadge}
        >
          <Text style={styles.paywallBadgeText}>Cancel anytime</Text>
        </Animated.View>
      </View>
    </View>
  );
}

function PaywallFeature({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.paywallFeatureRow}>
      <Feather name={icon as any} size={16} color="#fff" />
      <Text style={styles.paywallFeatureText}>{text}</Text>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050508',
  },
  page: {
    width: SCREEN_WIDTH,
    flex: 1,
  },

  // Bottom area
  bottomArea: {
    paddingHorizontal: 24,
    paddingBottom: 42,
    gap: 20,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  progressPill: {
    width: 20,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#1A1A24',
  },
  progressPillActive: {
    width: 32,
    backgroundColor: colors.primary,
  },
  progressPillDone: {
    backgroundColor: colors.primary + '50',
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backLabel: {
    fontSize: 15,
    color: colors.textDark,
    fontWeight: '500',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 50,
  },
  ctaButtonDisabled: {
    backgroundColor: '#1A1A24',
  },
  ctaLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
  ctaLabelDisabled: {
    color: colors.textDark,
  },

  // ─── Welcome ─────────────────────────────────────

  welcomeGradientWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.55,
    overflow: 'hidden',
  },
  meshBlob1: {
    position: 'absolute',
    top: -40,
    left: -60,
    width: SCREEN_WIDTH * 1.2,
    height: SCREEN_WIDTH * 1.2,
  },
  meshBlob2: {
    position: 'absolute',
    top: 40,
    right: -80,
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
  },
  meshGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
  },
  welcomeBottomFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 160,
  },
  welcomeLayout: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingTop: SCREEN_HEIGHT * 0.18,
    paddingBottom: 24,
  },
  welcomeTop: {
    gap: 16,
  },
  heroTitle: {
    fontSize: 52,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -2,
    lineHeight: 56,
  },
  heroTagline: {
    fontSize: 17,
    fontWeight: '400',
    color: '#777',
    lineHeight: 24,
  },
  welcomeBottom: {
    gap: 8,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  floatingTag: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#111118',
    borderWidth: 1,
    borderColor: '#1E1E28',
  },
  floatingTagText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textMuted,
  },

  // ─── Topics ──────────────────────────────────────

  topicsLayout: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 70,
  },
  sectionEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 2,
    marginBottom: 8,
  },
  sectionHeading: {
    fontSize: 34,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -1,
    lineHeight: 40,
  },
  topicsSubtext: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    marginTop: 8,
    marginBottom: 32,
  },
  topicCloud: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  topicPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 50,
    backgroundColor: '#16161F',
    borderWidth: 1.5,
    borderColor: '#2A2A38',
  },
  topicPillSelected: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  topicPillDisabled: {
    opacity: 0.35,
  },
  topicPillText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#B0B0BE',
  },
  topicPillTextSelected: {
    color: '#000',
  },
  topicPillTextDisabled: {
    color: '#666',
  },

  // ─── Notifications ───────────────────────────────

  notifLayout: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 70,
  },
  notifSubtext: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    marginTop: 8,
    marginBottom: 32,
  },
  notifCards: {
    gap: 10,
  },
  notifCard: {
    backgroundColor: '#16161F',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#2A2A38',
  },
  notifCardActive: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  notifCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  notifCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#B0B0BE',
  },
  notifCardTitleActive: {
    color: '#000',
  },
  notifCardDesc: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginLeft: 28,
  },
  notifCardDescActive: {
    color: '#555',
  },

  // ─── Summary ─────────────────────────────────────

  summaryLayout: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 70,
  },
  summaryCards: {
    gap: 12,
    marginTop: 32,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
  },
  summaryCardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#999',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  summaryTopics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  summaryTopicPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 50,
  },
  summaryTopicText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  summaryAlertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryAlertText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  summaryStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16161F',
    borderRadius: 16,
    padding: 20,
  },
  summaryStat: {
    flex: 1,
    alignItems: 'center',
  },
  summaryStatNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 2,
  },
  summaryStatLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  summaryStatDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#2A2A38',
  },

  // ─── Paywall ─────────────────────────────────────

  paywallGradientWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.5,
    overflow: 'hidden',
  },
  paywallGradientBlob: {
    position: 'absolute',
    top: -30,
    left: -50,
    width: SCREEN_WIDTH * 1.2,
    height: SCREEN_WIDTH * 1.2,
  },
  paywallGradientFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 180,
  },
  paywallLayout: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 70,
  },
  paywallTitle: {
    fontSize: 38,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -1.5,
    lineHeight: 44,
  },
  paywallSubtext: {
    fontSize: 15,
    fontWeight: '500',
    color: '#666',
    marginTop: 10,
    marginBottom: 36,
  },
  paywallFeatures: {
    gap: 20,
  },
  paywallFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  paywallFeatureText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ccc',
  },
  paywallBadge: {
    alignSelf: 'flex-start',
    marginTop: 32,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 50,
    backgroundColor: '#16161F',
    borderWidth: 1,
    borderColor: '#2A2A38',
  },
  paywallBadgeText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#888',
  },
  paywallNav: {
    alignItems: 'center',
    gap: 14,
  },
  paywallCta: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 50,
    alignItems: 'center',
    width: '100%',
  },
  paywallCtaLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  paywallSkip: {
    fontSize: 13,
    fontWeight: '500',
    color: '#555',
  },
});
