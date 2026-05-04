import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Share,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, SlideInRight } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { getTopicById, TopicId } from '../../src/constants/topics';
import { getSituationsByTopic, mockTopicStats } from '../../src/data/mockData';
import { SituationCard, StatusIndicator } from '../../src/components';
import { getStatusColor, getStatusLabel } from '../../src/utils/helpers';
import { colors, spacing, typography, borderRadius } from '../../src/constants/theme';

export default function TopicDetailScreen() {
  const { id } = useLocalSearchParams<{ id: TopicId }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);

  const topic = getTopicById(id);
  const situations = getSituationsByTopic(id);
  const stats = mockTopicStats.find((s) => s.topicId === id);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setRefreshing(false);
  }, []);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `I'm monitoring ${topic?.name} on Situation Monitor 👁️\n${situations.length} active situations right now.\n\n#MonitoringTheSituation`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  if (!topic) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>Topic not found</Text>
      </View>
    );
  }

  const statusColor = getStatusColor(stats?.status || 'normal');

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <Animated.View style={styles.header} entering={FadeIn}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Feather name="share-2" size={20} color={colors.text} />
        </TouchableOpacity>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Topic hero */}
        <Animated.View style={styles.hero} entering={FadeInDown.delay(100)}>
          <LinearGradient
            colors={[topic.color + '20', 'transparent']}
            style={styles.heroGradient}
          />

          <View style={[styles.topicIcon, { backgroundColor: topic.color + '25' }]}>
            <Feather name={topic.icon as any} size={32} color={topic.color} />
          </View>

          <Text style={styles.topicName}>{topic.name}</Text>
          <Text style={styles.topicDescription}>{topic.description}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats?.activeCount || 0}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <StatusIndicator status={stats?.status || 'normal'} size="medium" />
              <Text style={[styles.statLabel, { color: statusColor }]}>
                {getStatusLabel(stats?.status || 'normal')}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Feather
                name={
                  stats?.trend === 'up'
                    ? 'trending-up'
                    : stats?.trend === 'down'
                    ? 'trending-down'
                    : 'minus'
                }
                size={24}
                color={
                  stats?.trend === 'up'
                    ? colors.primary
                    : stats?.trend === 'down'
                    ? colors.alert
                    : colors.textMuted
                }
              />
              <Text style={styles.statLabel}>
                {stats?.trend === 'up'
                  ? 'Rising'
                  : stats?.trend === 'down'
                  ? 'Falling'
                  : 'Stable'}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* AI Summary */}
        <Animated.View style={styles.aiSummary} entering={FadeInDown.delay(200)}>
          <View style={styles.aiHeader}>
            <View style={styles.aiBadge}>
              <Feather name="zap" size={12} color={colors.primary} />
              <Text style={styles.aiBadgeText}>AI Summary</Text>
            </View>
          </View>
          <Text style={styles.aiText}>
            {`${topic.name} sector showing mixed signals. Multiple active situations being tracked with varying priority levels.`}
          </Text>
        </Animated.View>

        {/* Situations */}
        <View style={styles.situationsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>LATEST UPDATES</Text>
            <Text style={styles.sectionCount}>{situations.length}</Text>
          </View>

          {situations.map((situation, index) => (
            <Animated.View
              key={situation.id}
              entering={SlideInRight.delay(index * 50 + 300).springify()}
            >
              <SituationCard
                situation={situation}
                onPress={() => router.push(`/situation/${situation.id}`)}
              />
            </Animated.View>
          ))}
        </View>

        {/* Bottom padding */}
        <View style={{ height: 100 }} />
      </ScrollView>
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
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
  errorText: {
    ...typography.body,
    color: colors.text,
    textAlign: 'center',
    marginTop: spacing.xxxl,
  },
  hero: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
    marginBottom: spacing.lg,
  },
  heroGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  topicIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  topicName: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  topicDescription: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: '100%',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  statValue: {
    ...typography.h2,
    color: colors.primary,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.cardBorder,
  },
  aiSummary: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    padding: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  aiHeader: {
    marginBottom: spacing.sm,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryGlow,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  aiBadgeText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  aiText: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  situationsSection: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.textMuted,
    letterSpacing: 1.5,
  },
  sectionCount: {
    ...typography.caption,
    color: colors.primary,
    backgroundColor: colors.primaryGlow,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
});
