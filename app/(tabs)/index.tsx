import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import {
  GlobalStatusBar,
  LiveTicker,
  TopicCard,
  SituationCard,
} from '../../src/components';
import { useAppContext } from '../../src/context/AppContext';
import {
  mockTopicStats,
  mockSituations,
  getBreakingSituations,
} from '../../src/data/mockData';
import { colors, spacing, typography, borderRadius } from '../../src/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function DashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { selectedTopics } = useAppContext();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate refresh
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setRefreshing(false);
  }, []);

  // Filter stats for selected topics
  const filteredStats = mockTopicStats.filter((stat) =>
    selectedTopics.includes(stat.topicId)
  );

  // Get breaking situations
  const breakingSituations = getBreakingSituations().slice(0, 3);

  // Get recent situations from selected topics
  const recentSituations = mockSituations
    .filter((s) => selectedTopics.includes(s.topicId))
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 5);

  const handleTopicPress = (topicId: string) => {
    router.push(`/topic/${topicId}`);
  };

  const handleSituationPress = (situationId: string) => {
    router.push(`/situation/${situationId}`);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <Animated.View style={styles.header} entering={FadeIn.delay(100)}>
        <View>
          <Text style={styles.greeting}>Situation Monitor</Text>
          <Text style={styles.date}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
            })}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.shareButton}
          onPress={() => {
            // Share functionality
          }}
        >
          <Feather name="share-2" size={20} color={colors.text} />
        </TouchableOpacity>
      </Animated.View>

      {/* Live ticker */}
      <LiveTicker />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Global status */}
        <GlobalStatusBar />

        {/* Breaking section */}
        {breakingSituations.length > 0 && (
          <Animated.View
            style={styles.section}
            entering={FadeInDown.delay(200)}
          >
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <View style={styles.breakingDot} />
                <Text style={styles.sectionTitle}>BREAKING</Text>
              </View>
              <TouchableOpacity>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.breakingScroll}
            >
              {breakingSituations.map((situation, index) => (
                <TouchableOpacity
                  key={situation.id}
                  style={styles.breakingCard}
                  onPress={() => handleSituationPress(situation.id)}
                >
                  <BreakingCard situation={situation} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>
        )}

        {/* Topics grid */}
        <Animated.View
          style={styles.section}
          entering={FadeInDown.delay(300)}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>MONITORING</Text>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/settings')}
            >
              <Feather name="edit-2" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <View style={styles.topicsGrid}>
            {filteredStats.map((stats, index) => (
              <TopicCard
                key={stats.topicId}
                stats={stats}
                index={index}
                onPress={() => handleTopicPress(stats.topicId)}
              />
            ))}
          </View>
        </Animated.View>

        {/* Recent situations */}
        <Animated.View
          style={styles.section}
          entering={FadeInDown.delay(400)}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>RECENT</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>

          {recentSituations.map((situation) => (
            <SituationCard
              key={situation.id}
              situation={situation}
              compact
              onPress={() => handleSituationPress(situation.id)}
            />
          ))}
        </Animated.View>

        {/* Bottom padding */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

function BreakingCard({ situation }: { situation: any }) {
  const topic = require('../../src/constants/topics').getTopicById(situation.topicId);

  return (
    <View style={[styles.breakingCardInner, { borderColor: topic?.color || colors.alert }]}>
      <View style={styles.breakingCardHeader}>
        <View style={[styles.topicBadge, { backgroundColor: topic?.color + '20' }]}>
          <Feather
            name={topic?.icon || 'alert-circle'}
            size={12}
            color={topic?.color}
          />
          <Text style={[styles.topicBadgeText, { color: topic?.color }]}>
            {topic?.shortName}
          </Text>
        </View>
        <Text style={styles.breakingTime}>
          {require('../../src/utils/helpers').formatTimeAgo(situation.timestamp)}
        </Text>
      </View>
      <Text style={styles.breakingHeadline} numberOfLines={3}>
        {situation.headline}
      </Text>
      <View style={styles.breakingFooter}>
        <Text style={styles.breakingSource}>{situation.source}</Text>
        <Feather name="chevron-right" size={14} color={colors.textMuted} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  greeting: {
    ...typography.h2,
    color: colors.text,
  },
  date: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginTop: 2,
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacing.sm,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  breakingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.alert,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.textMuted,
    letterSpacing: 1.5,
  },
  seeAll: {
    ...typography.bodySmall,
    color: colors.primary,
  },
  breakingScroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  breakingCard: {
    width: SCREEN_WIDTH * 0.75,
  },
  breakingCardInner: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderLeftWidth: 3,
  },
  breakingCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  topicBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  topicBadgeText: {
    ...typography.caption,
    fontWeight: '600',
  },
  breakingTime: {
    ...typography.caption,
    color: colors.textMuted,
  },
  breakingHeadline: {
    ...typography.h4,
    color: colors.text,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  breakingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakingSource: {
    ...typography.caption,
    color: colors.textMuted,
  },
  topicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    justifyContent: 'space-between',
  },
});
