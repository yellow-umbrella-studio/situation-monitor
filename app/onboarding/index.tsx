import { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  useAnimatedScrollHandler,
  FadeIn,
  FadeInUp,
  FadeOut,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { GlobeAnimation, TopicChip, StatusIndicator } from '../../src/components';
import { useAppContext } from '../../src/context/AppContext';
import { topics, TopicId } from '../../src/constants/topics';
import { colors, borderRadius, spacing, typography } from '../../src/constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const PAGES = ['welcome', 'topics', 'notifications', 'ready'] as const;
type PageType = typeof PAGES[number];

export default function OnboardingScreen() {
  const router = useRouter();
  const {
    selectedTopics,
    setSelectedTopics,
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
      // Finish onboarding
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
    if (currentPage === 'topics') {
      return selectedTopics.length >= 1;
    }
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
      case 'ready':
        return <ReadyPage selectedTopics={selectedTopics} />;
    }
  };

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  return (
    <View style={styles.container}>
      {/* Progress dots */}
      <View style={styles.progressContainer}>
        {PAGES.map((_, index) => (
          <ProgressDot
            key={index}
            index={index}
            scrollX={scrollX}
            currentIndex={currentIndex}
          />
        ))}
      </View>

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

      {/* Navigation buttons */}
      <View style={styles.navigation}>
        {currentIndex > 0 ? (
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Feather name="arrow-left" size={20} color={colors.textMuted} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.backButton} />
        )}

        <TouchableOpacity
          style={[
            styles.nextButton,
            !canProceed() && styles.nextButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={!canProceed()}
        >
          <Text style={styles.nextText}>
            {currentPage === 'ready' ? 'Start Monitoring' : 'Continue'}
          </Text>
          <Feather
            name={currentPage === 'ready' ? 'check' : 'arrow-right'}
            size={18}
            color={colors.background}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function ProgressDot({
  index,
  scrollX,
  currentIndex,
}: {
  index: number;
  scrollX: Animated.SharedValue<number>;
  currentIndex: number;
}) {
  const isActive = index === currentIndex;

  return (
    <Animated.View
      style={[
        styles.dot,
        isActive && styles.dotActive,
      ]}
    />
  );
}

function WelcomePage() {
  return (
    <View style={styles.page}>
      <Animated.View
        style={styles.welcomeContent}
        entering={FadeInUp.delay(200).springify()}
      >
        <GlobeAnimation size={160} />
        
        <Text style={styles.welcomeTitle}>Welcome to</Text>
        <Text style={styles.welcomeTitleAccent}>SITUATION MONITOR</Text>
        
        <Text style={styles.welcomeDescription}>
          Your command center for staying informed on everything that matters.
          Monitor global events, markets, tech, sports, and more — all in one place.
        </Text>

        <View style={styles.featureList}>
          <FeatureItem icon="globe" text="Real-time global updates" />
          <FeatureItem icon="trending-up" text="Live market data" />
          <FeatureItem icon="bell" text="Smart notifications" />
          <FeatureItem icon="share-2" text="Share-worthy cards" />
        </View>
      </Animated.View>
    </View>
  );
}

function FeatureItem({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureIcon}>
        <Feather name={icon as any} size={16} color={colors.primary} />
      </View>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

function TopicsPage({
  selectedTopics,
  onToggle,
}: {
  selectedTopics: TopicId[];
  onToggle: (id: TopicId) => void;
}) {
  return (
    <View style={styles.page}>
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>What do you want to monitor?</Text>
        <Text style={styles.pageSubtitle}>
          Select at least one topic to get started
        </Text>
      </View>

      <ScrollView
        style={styles.topicsList}
        contentContainerStyle={styles.topicsContent}
        showsVerticalScrollIndicator={false}
      >
        {topics.map((topic, index) => (
          <Animated.View
            key={topic.id}
            entering={FadeInUp.delay(index * 50).springify()}
          >
            <TopicChip
              topic={topic}
              selected={selectedTopics.includes(topic.id)}
              onPress={() => onToggle(topic.id)}
            />
          </Animated.View>
        ))}
      </ScrollView>

      <View style={styles.selectionCount}>
        <Text style={styles.selectionText}>
          {selectedTopics.length} topic{selectedTopics.length !== 1 ? 's' : ''} selected
        </Text>
      </View>
    </View>
  );
}

function NotificationsPage({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <View style={styles.page}>
      <Animated.View
        style={styles.notificationsContent}
        entering={FadeInUp.delay(200).springify()}
      >
        <View style={styles.bellContainer}>
          <View style={styles.bellIcon}>
            <Feather name="bell" size={48} color={colors.primary} />
          </View>
          {enabled && (
            <Animated.View
              style={styles.bellBadge}
              entering={FadeIn.delay(300)}
            >
              <StatusIndicator status="elevated" size="small" />
            </Animated.View>
          )}
        </View>

        <Text style={styles.pageTitle}>Stay in the loop</Text>
        <Text style={styles.pageSubtitle}>
          Get notified when critical situations develop in your monitored topics.
        </Text>

        <View style={styles.notificationOptions}>
          <TouchableOpacity
            style={[
              styles.notificationOption,
              enabled && styles.notificationOptionActive,
            ]}
            onPress={() => !enabled && onToggle()}
          >
            <View style={styles.notificationOptionHeader}>
              <Feather
                name="check-circle"
                size={20}
                color={enabled ? colors.primary : colors.textMuted}
              />
              <Text
                style={[
                  styles.notificationOptionTitle,
                  enabled && { color: colors.primary },
                ]}
              >
                Enable notifications
              </Text>
            </View>
            <Text style={styles.notificationOptionDesc}>
              Breaking news, critical alerts, market movements
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.notificationOption,
              !enabled && styles.notificationOptionActive,
            ]}
            onPress={() => enabled && onToggle()}
          >
            <View style={styles.notificationOptionHeader}>
              <Feather
                name="bell-off"
                size={20}
                color={!enabled ? colors.primary : colors.textMuted}
              />
              <Text
                style={[
                  styles.notificationOptionTitle,
                  !enabled && { color: colors.primary },
                ]}
              >
                Maybe later
              </Text>
            </View>
            <Text style={styles.notificationOptionDesc}>
              You can enable notifications anytime in settings
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

function ReadyPage({ selectedTopics }: { selectedTopics: TopicId[] }) {
  return (
    <View style={styles.page}>
      <Animated.View
        style={styles.readyContent}
        entering={FadeInUp.delay(200).springify()}
      >
        <View style={styles.readyBadge}>
          <StatusIndicator status="normal" size="large" animated />
        </View>

        <Text style={styles.readyTitle}>You're all set</Text>
        <Text style={styles.readySubtitle}>
          You are now monitoring {selectedTopics.length} topic
          {selectedTopics.length !== 1 ? 's' : ''}
        </Text>

        <View style={styles.selectedTopicsPreview}>
          {selectedTopics.slice(0, 4).map((topicId) => {
            const topic = topics.find((t) => t.id === topicId);
            if (!topic) return null;
            return (
              <View
                key={topicId}
                style={[styles.topicPreviewChip, { backgroundColor: topic.color + '20' }]}
              >
                <Feather name={topic.icon as any} size={14} color={topic.color} />
                <Text style={[styles.topicPreviewText, { color: topic.color }]}>
                  {topic.shortName}
                </Text>
              </View>
            );
          })}
          {selectedTopics.length > 4 && (
            <View style={styles.topicPreviewMore}>
              <Text style={styles.topicPreviewMoreText}>
                +{selectedTopics.length - 4}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.readyMessage}>
          <Feather name="eye" size={20} color={colors.primary} />
          <Text style={styles.readyMessageText}>
            I'm monitoring the situation
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.cardBorder,
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.primary,
  },
  page: {
    width: SCREEN_WIDTH,
    paddingHorizontal: spacing.lg,
  },
  pageHeader: {
    marginBottom: spacing.xl,
  },
  pageTitle: {
    ...typography.h2,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  pageSubtitle: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: 40,
    paddingTop: spacing.lg,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minWidth: 80,
  },
  backText: {
    ...typography.body,
    color: colors.textMuted,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.full,
  },
  nextButtonDisabled: {
    backgroundColor: colors.cardBorder,
  },
  nextText: {
    ...typography.h4,
    color: colors.background,
  },

  // Welcome page
  welcomeContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 80,
  },
  welcomeTitle: {
    ...typography.h3,
    color: colors.textMuted,
    marginTop: spacing.xxl,
  },
  welcomeTitleAccent: {
    ...typography.h1,
    color: colors.primary,
    letterSpacing: 2,
  },
  welcomeDescription: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
    lineHeight: 24,
  },
  featureList: {
    width: '100%',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryGlow,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  featureText: {
    ...typography.body,
    color: colors.text,
  },

  // Topics page
  topicsList: {
    flex: 1,
  },
  topicsContent: {
    paddingBottom: spacing.lg,
  },
  selectionCount: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  selectionText: {
    ...typography.body,
    color: colors.primary,
  },

  // Notifications page
  notificationsContent: {
    flex: 1,
    alignItems: 'center',
    paddingTop: spacing.xxxl,
  },
  bellContainer: {
    marginBottom: spacing.xxl,
  },
  bellIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primaryGlow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bellBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  notificationOptions: {
    width: '100%',
    marginTop: spacing.xxl,
    gap: spacing.md,
  },
  notificationOption: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: colors.cardBorder,
  },
  notificationOptionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryGlow,
  },
  notificationOptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  notificationOptionTitle: {
    ...typography.h4,
    color: colors.text,
  },
  notificationOptionDesc: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginLeft: 28,
  },

  // Ready page
  readyContent: {
    flex: 1,
    alignItems: 'center',
    paddingTop: spacing.xxxl * 2,
  },
  readyBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xxl,
    borderWidth: 2,
    borderColor: colors.primary + '40',
  },
  readyTitle: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  readySubtitle: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  selectedTopicsPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xxl,
  },
  topicPreviewChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
  },
  topicPreviewText: {
    ...typography.caption,
    fontWeight: '600',
  },
  topicPreviewMore: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.card,
  },
  topicPreviewMoreText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  readyMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primaryGlow,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.primary + '40',
  },
  readyMessageText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
});
