import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppContext } from '../../src/context/AppContext';
import { mockSituations } from '../../src/data/mockData';
import { topics, TopicId, getTopicById } from '../../src/constants/topics';
import { StatusIndicator } from '../../src/components';
import { formatTimeAgo, getStatusColor } from '../../src/utils/helpers';
import { colors, spacing, typography, borderRadius } from '../../src/constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const { selectedTopics } = useAppContext();
  const [activeFilter, setActiveFilter] = useState<TopicId | 'all'>('all');

  // Get situations with locations
  const situationsWithLocations = mockSituations.filter(
    (s) =>
      s.location &&
      (activeFilter === 'all' || s.topicId === activeFilter) &&
      selectedTopics.includes(s.topicId)
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <Animated.View style={styles.header} entering={FadeIn}>
        <Text style={styles.title}>Live Map</Text>
        <Text style={styles.subtitle}>
          {situationsWithLocations.length} active situations
        </Text>
      </Animated.View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        <FilterChip
          label="All"
          active={activeFilter === 'all'}
          onPress={() => setActiveFilter('all')}
        />
        {topics
          .filter((t) => selectedTopics.includes(t.id))
          .map((topic) => (
            <FilterChip
              key={topic.id}
              label={topic.shortName}
              active={activeFilter === topic.id}
              color={topic.color}
              icon={topic.icon}
              onPress={() => setActiveFilter(topic.id)}
            />
          ))}
      </ScrollView>

      {/* Map placeholder with artistic representation */}
      <Animated.View style={styles.mapContainer} entering={FadeIn.delay(200)}>
        <LinearGradient
          colors={[colors.card, colors.backgroundSecondary]}
          style={styles.mapGradient}
        >
          {/* Globe grid lines */}
          <View style={styles.globeGrid}>
            {[...Array(5)].map((_, i) => (
              <View
                key={`h-${i}`}
                style={[
                  styles.gridLineH,
                  { top: `${(i + 1) * 16.6}%` },
                ]}
              />
            ))}
            {[...Array(7)].map((_, i) => (
              <View
                key={`v-${i}`}
                style={[
                  styles.gridLineV,
                  { left: `${(i + 1) * 12.5}%` },
                ]}
              />
            ))}
          </View>

          {/* Situation pins */}
          {situationsWithLocations.map((situation, index) => (
            <MapPin
              key={situation.id}
              situation={situation}
              index={index}
              total={situationsWithLocations.length}
            />
          ))}

          {/* Central pulse */}
          <View style={styles.centerPulse}>
            <View style={styles.centerDot} />
          </View>

          {/* Map legend */}
          <View style={styles.mapLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
              <Text style={styles.legendText}>Normal</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.warning }]} />
              <Text style={styles.legendText}>Elevated</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.alert }]} />
              <Text style={styles.legendText}>Critical</Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Situations list */}
      <Animated.View style={styles.listContainer} entering={FadeInUp.delay(300)}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Active Situations</Text>
          <Text style={styles.listCount}>{situationsWithLocations.length}</Text>
        </View>

        <ScrollView
          style={styles.list}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {situationsWithLocations.map((situation) => (
            <SituationListItem key={situation.id} situation={situation} />
          ))}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

function FilterChip({
  label,
  active,
  color,
  icon,
  onPress,
}: {
  label: string;
  active: boolean;
  color?: string;
  icon?: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.filterChip,
        active && { backgroundColor: color || colors.primary, borderColor: color || colors.primary },
      ]}
      onPress={onPress}
    >
      {icon && (
        <Feather
          name={icon as any}
          size={14}
          color={active ? colors.background : colors.textMuted}
        />
      )}
      <Text
        style={[
          styles.filterText,
          active && { color: colors.background },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function MapPin({
  situation,
  index,
  total,
}: {
  situation: any;
  index: number;
  total: number;
}) {
  const topic = getTopicById(situation.topicId);
  const statusColor = getStatusColor(situation.status);

  // Distribute pins across the map
  const angle = (index / total) * Math.PI * 2;
  const radius = 25 + Math.random() * 20;
  const left = 50 + Math.cos(angle) * radius;
  const top = 50 + Math.sin(angle) * radius * 0.6;

  return (
    <Animated.View
      style={[
        styles.mapPin,
        {
          left: `${Math.max(10, Math.min(90, left))}%`,
          top: `${Math.max(15, Math.min(85, top))}%`,
        },
      ]}
      entering={FadeIn.delay(index * 100)}
    >
      <View style={[styles.pinOuter, { backgroundColor: statusColor + '40' }]}>
        <View style={[styles.pinInner, { backgroundColor: statusColor }]}>
          <Feather
            name={topic?.icon as any || 'circle'}
            size={10}
            color={colors.background}
          />
        </View>
      </View>
    </Animated.View>
  );
}

function SituationListItem({ situation }: { situation: any }) {
  const topic = getTopicById(situation.topicId);
  const statusColor = getStatusColor(situation.status);

  return (
    <TouchableOpacity style={styles.listItem}>
      <View style={[styles.listItemAccent, { backgroundColor: statusColor }]} />
      <View style={styles.listItemContent}>
        <View style={styles.listItemHeader}>
          <View style={styles.listItemTopic}>
            <Feather
              name={topic?.icon as any || 'circle'}
              size={12}
              color={topic?.color}
            />
            <Text style={[styles.listItemTopicText, { color: topic?.color }]}>
              {topic?.shortName}
            </Text>
          </View>
          <Text style={styles.listItemTime}>
            {formatTimeAgo(situation.timestamp)}
          </Text>
        </View>
        <Text style={styles.listItemHeadline} numberOfLines={2}>
          {situation.headline}
        </Text>
        <View style={styles.listItemLocation}>
          <Feather name="map-pin" size={10} color={colors.textMuted} />
          <Text style={styles.listItemLocationText}>
            {situation.location?.name}
          </Text>
        </View>
      </View>
      <StatusIndicator status={situation.status} size="small" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginTop: 2,
  },
  filterContainer: {
    maxHeight: 50,
  },
  filterContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    alignItems: 'center',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  filterText: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '600',
  },
  mapContainer: {
    margin: spacing.lg,
    height: SCREEN_HEIGHT * 0.35,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  mapGradient: {
    flex: 1,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  globeGrid: {
    ...StyleSheet.absoluteFillObject,
  },
  gridLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.cardBorder,
    opacity: 0.3,
  },
  gridLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: colors.cardBorder,
    opacity: 0.3,
  },
  centerPulse: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -20,
    marginTop: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  mapLegend: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.md,
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.background + 'CC',
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 10,
  },
  mapPin: {
    position: 'absolute',
  },
  pinOuter: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    flex: 1,
    backgroundColor: colors.card,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    marginTop: -spacing.md,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  listTitle: {
    ...typography.h4,
    color: colors.text,
  },
  listCount: {
    ...typography.caption,
    color: colors.primary,
    backgroundColor: colors.primaryGlow,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  list: {
    flex: 1,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    paddingLeft: 0,
    marginHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  listItemAccent: {
    width: 3,
    alignSelf: 'stretch',
    borderRadius: 2,
    marginRight: spacing.md,
  },
  listItemContent: {
    flex: 1,
  },
  listItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  listItemTopic: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  listItemTopicText: {
    ...typography.caption,
    fontWeight: '600',
  },
  listItemTime: {
    ...typography.caption,
    color: colors.textMuted,
  },
  listItemHeadline: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '500',
    marginBottom: 4,
  },
  listItemLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  listItemLocationText: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 11,
  },
});
