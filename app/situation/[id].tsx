import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInUp, FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { mockSituations } from '../../src/data/mockData';
import { getTopicById } from '../../src/constants/topics';
import { StatusIndicator } from '../../src/components';
import { formatTimeAgo, getStatusColor, getStatusLabel } from '../../src/utils/helpers';
import { colors, spacing, typography, borderRadius } from '../../src/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function SituationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const situation = mockSituations.find((s) => s.id === id);
  const topic = situation ? getTopicById(situation.topicId) : null;

  const handleShare = async () => {
    if (!situation) return;
    try {
      await Share.share({
        message: `🚨 ${situation.headline}\n\n${situation.summary}\n\nSource: ${situation.source}\n\n—\nI'm monitoring the situation 👁️\n#SituationMonitor`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  if (!situation || !topic) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <TouchableOpacity
          style={[styles.closeButton, { top: insets.top + spacing.md }]}
          onPress={() => router.back()}
        >
          <Feather name="x" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Situation not found</Text>
        </View>
      </View>
    );
  }

  const statusColor = getStatusColor(situation.status);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <Animated.View style={styles.header} entering={FadeIn}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <Feather name="x" size={22} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Feather name="bookmark" size={20} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Feather name="share-2" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero section */}
        <Animated.View style={styles.hero} entering={FadeInDown.delay(100)}>
          {/* Breaking banner */}
          {situation.isBreaking && (
            <LinearGradient
              colors={[statusColor, statusColor + '80']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.breakingBanner}
            >
              <Feather name="alert-circle" size={14} color={colors.background} />
              <Text style={styles.breakingText}>BREAKING NEWS</Text>
            </LinearGradient>
          )}

          {/* Meta info */}
          <View style={styles.metaRow}>
            <View style={[styles.topicBadge, { backgroundColor: topic.color + '20' }]}>
              <Feather name={topic.icon as any} size={14} color={topic.color} />
              <Text style={[styles.topicName, { color: topic.color }]}>{topic.name}</Text>
            </View>
            <View style={styles.statusBadge}>
              <StatusIndicator status={situation.status} size="small" />
              <Text style={[styles.statusText, { color: statusColor }]}>
                {getStatusLabel(situation.status)}
              </Text>
            </View>
          </View>

          {/* Headline */}
          <Text style={styles.headline}>{situation.headline}</Text>

          {/* Time and source */}
          <View style={styles.sourceRow}>
            <Text style={styles.source}>{situation.source}</Text>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.timestamp}>{formatTimeAgo(situation.timestamp)}</Text>
          </View>
        </Animated.View>

        {/* Content */}
        <Animated.View style={styles.content} entering={FadeInUp.delay(200)}>
          <Text style={styles.summary}>{situation.summary}</Text>

          {/* Location card */}
          {situation.location && (
            <View style={styles.locationCard}>
              <View style={styles.locationIcon}>
                <Feather name="map-pin" size={18} color={colors.primary} />
              </View>
              <View style={styles.locationContent}>
                <Text style={styles.locationLabel}>Location</Text>
                <Text style={styles.locationName}>{situation.location.name}</Text>
                <Text style={styles.locationCoords}>
                  {situation.location.lat.toFixed(4)}, {situation.location.lng.toFixed(4)}
                </Text>
              </View>
              <TouchableOpacity style={styles.mapButton}>
                <Feather name="external-link" size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>
          )}

          {/* Tags */}
          {situation.tags && situation.tags.length > 0 && (
            <View style={styles.tagsSection}>
              <Text style={styles.tagsLabel}>Related Topics</Text>
              <View style={styles.tagsContainer}>
                {situation.tags.map((tag) => (
                  <View key={tag} style={styles.tag}>
                    <Text style={styles.tagText}>#{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </Animated.View>

        {/* Share card */}
        <Animated.View style={styles.shareCard} entering={FadeInUp.delay(300)}>
          <Text style={styles.shareTitle}>Share this situation</Text>
          <Text style={styles.shareDescription}>
            Let others know you're monitoring this
          </Text>
          <View style={styles.shareButtons}>
            <TouchableOpacity style={styles.shareButtonPrimary} onPress={handleShare}>
              <Feather name="share-2" size={18} color={colors.background} />
              <Text style={styles.shareButtonText}>Share Update</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareButtonSecondary}>
              <Feather name="eye" size={18} color={colors.primary} />
              <Text style={styles.shareButtonTextSecondary}>I'm monitoring</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Related situations placeholder */}
        <Animated.View style={styles.relatedSection} entering={FadeInUp.delay(400)}>
          <Text style={styles.relatedTitle}>Related Situations</Text>
          <View style={styles.relatedPlaceholder}>
            <Feather name="grid" size={24} color={colors.textMuted} />
            <Text style={styles.relatedPlaceholderText}>
              More updates coming soon
            </Text>
          </View>
        </Animated.View>

        {/* Bottom padding */}
        <View style={{ height: 50 }} />
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
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    ...typography.body,
    color: colors.textMuted,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },
  hero: {
    marginBottom: spacing.xl,
  },
  breakingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.md,
  },
  breakingText: {
    ...typography.caption,
    color: colors.background,
    fontWeight: '700',
    letterSpacing: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  topicBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
  },
  topicName: {
    ...typography.caption,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '600',
  },
  headline: {
    ...typography.h2,
    color: colors.text,
    lineHeight: 32,
    marginBottom: spacing.md,
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  source: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '500',
  },
  dot: {
    color: colors.textMuted,
  },
  timestamp: {
    ...typography.body,
    color: colors.textMuted,
  },
  content: {
    marginBottom: spacing.xl,
  },
  summary: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 26,
    fontSize: 17,
    marginBottom: spacing.xl,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  locationIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryGlow,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  locationContent: {
    flex: 1,
  },
  locationLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: 2,
  },
  locationName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  locationCoords: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  mapButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryGlow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagsSection: {
    marginBottom: spacing.lg,
  },
  tagsLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    letterSpacing: 1,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tag: {
    backgroundColor: colors.card,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  tagText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  shareCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  shareTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  shareDescription: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  shareButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  shareButtonPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  shareButtonText: {
    ...typography.body,
    color: colors.background,
    fontWeight: '600',
  },
  shareButtonSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primaryGlow,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  shareButtonTextSecondary: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  relatedSection: {
    marginBottom: spacing.xl,
  },
  relatedTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.md,
  },
  relatedPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: spacing.sm,
  },
  relatedPlaceholderText: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
});
