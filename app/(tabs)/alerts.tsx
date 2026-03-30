import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, SlideInRight } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { useAppContext } from '../../src/context/AppContext';
import { mockSituations, Situation } from '../../src/data/mockData';
import { getTopicById } from '../../src/constants/topics';
import { StatusIndicator } from '../../src/components';
import { formatTimeAgo, getStatusColor } from '../../src/utils/helpers';
import { colors, spacing, typography, borderRadius } from '../../src/constants/theme';

// Mock alerts data
const mockAlerts = mockSituations
  .filter((s) => s.isBreaking || s.status === 'critical')
  .map((s, i) => ({
    ...s,
    read: i > 2,
    alertId: `alert-${s.id}`,
  }))
  .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

export default function AlertsScreen() {
  const insets = useSafeAreaInsets();
  const { selectedTopics, notificationsEnabled, setNotificationsEnabled } = useAppContext();
  const [alerts, setAlerts] = useState(mockAlerts);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredAlerts = alerts.filter((alert) => {
    const topicMatch = selectedTopics.includes(alert.topicId);
    const readMatch = filter === 'all' || !alert.read;
    return topicMatch && readMatch;
  });

  const unreadCount = alerts.filter(
    (a) => !a.read && selectedTopics.includes(a.topicId)
  ).length;

  const markAsRead = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.alertId === alertId ? { ...a, read: true } : a))
    );
  };

  const markAllAsRead = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <Animated.View style={styles.header} entering={FadeIn}>
        <View>
          <Text style={styles.title}>Alerts</Text>
          <Text style={styles.subtitle}>
            {unreadCount} unread alert{unreadCount !== 1 ? 's' : ''}
          </Text>
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity style={styles.markAllButton} onPress={markAllAsRead}>
            <Feather name="check-circle" size={16} color={colors.primary} />
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </Animated.View>

      {/* Notification toggle */}
      <Animated.View style={styles.notificationToggle} entering={FadeInDown.delay(100)}>
        <View style={styles.toggleContent}>
          <View style={styles.toggleIcon}>
            <Feather
              name={notificationsEnabled ? 'bell' : 'bell-off'}
              size={20}
              color={notificationsEnabled ? colors.primary : colors.textMuted}
            />
          </View>
          <View style={styles.toggleTextContainer}>
            <Text style={styles.toggleTitle}>Push Notifications</Text>
            <Text style={styles.toggleDescription}>
              {notificationsEnabled
                ? 'You will receive breaking alerts'
                : 'Notifications are disabled'}
            </Text>
          </View>
        </View>
        <Switch
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
          trackColor={{ false: colors.cardBorder, true: colors.primaryGlow }}
          thumbColor={notificationsEnabled ? colors.primary : colors.textMuted}
        />
      </Animated.View>

      {/* Filter tabs */}
      <Animated.View style={styles.filterTabs} entering={FadeInDown.delay(150)}>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
          onPress={() => setFilter('all')}
        >
          <Text
            style={[
              styles.filterTabText,
              filter === 'all' && styles.filterTabTextActive,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'unread' && styles.filterTabActive]}
          onPress={() => setFilter('unread')}
        >
          <Text
            style={[
              styles.filterTabText,
              filter === 'unread' && styles.filterTabTextActive,
            ]}
          >
            Unread
          </Text>
          {unreadCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* Alerts list */}
      <ScrollView
        style={styles.alertsList}
        contentContainerStyle={styles.alertsContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredAlerts.length === 0 ? (
          <Animated.View style={styles.emptyState} entering={FadeIn.delay(200)}>
            <View style={styles.emptyIcon}>
              <Feather name="bell-off" size={48} color={colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>No alerts</Text>
            <Text style={styles.emptyDescription}>
              {filter === 'unread'
                ? "You've read all your alerts"
                : "No alerts for your monitored topics yet"}
            </Text>
          </Animated.View>
        ) : (
          filteredAlerts.map((alert, index) => (
            <AlertItem
              key={alert.alertId}
              alert={alert}
              index={index}
              onPress={() => markAsRead(alert.alertId)}
            />
          ))
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

function AlertItem({
  alert,
  index,
  onPress,
}: {
  alert: any;
  index: number;
  onPress: () => void;
}) {
  const topic = getTopicById(alert.topicId);
  const statusColor = getStatusColor(alert.status);

  return (
    <Animated.View entering={SlideInRight.delay(index * 50).springify()}>
      <TouchableOpacity
        style={[
          styles.alertItem,
          !alert.read && styles.alertItemUnread,
        ]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {/* Unread indicator */}
        {!alert.read && <View style={[styles.unreadDot, { backgroundColor: statusColor }]} />}

        {/* Icon */}
        <View style={[styles.alertIcon, { backgroundColor: topic?.color + '20' }]}>
          <Feather
            name={topic?.icon as any || 'alert-circle'}
            size={18}
            color={topic?.color}
          />
        </View>

        {/* Content */}
        <View style={styles.alertContent}>
          <View style={styles.alertHeader}>
            <View style={styles.alertMeta}>
              <Text style={[styles.alertTopic, { color: topic?.color }]}>
                {topic?.shortName}
              </Text>
              <Text style={styles.alertDot}>•</Text>
              <StatusIndicator status={alert.status} size="small" />
            </View>
            <Text style={styles.alertTime}>
              {formatTimeAgo(alert.timestamp)}
            </Text>
          </View>
          <Text
            style={[styles.alertHeadline, !alert.read && styles.alertHeadlineUnread]}
            numberOfLines={2}
          >
            {alert.headline}
          </Text>
          <Text style={styles.alertSource}>{alert.source}</Text>
        </View>

        {/* Action */}
        <View style={styles.alertAction}>
          <Feather name="chevron-right" size={16} color={colors.textMuted} />
        </View>
      </TouchableOpacity>
    </Animated.View>
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
  title: {
    ...typography.h2,
    color: colors.text,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginTop: 2,
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primaryGlow,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
  },
  markAllText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  notificationToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  toggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  toggleIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  toggleTextContainer: {
    flex: 1,
  },
  toggleTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  toggleDescription: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  filterTabs: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: 4,
  },
  filterTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    gap: 6,
  },
  filterTabActive: {
    backgroundColor: colors.backgroundSecondary,
  },
  filterTabText: {
    ...typography.body,
    color: colors.textMuted,
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: colors.text,
  },
  filterBadge: {
    backgroundColor: colors.alert,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  filterBadgeText: {
    ...typography.caption,
    color: colors.text,
    fontSize: 10,
    fontWeight: '700',
  },
  alertsList: {
    flex: 1,
  },
  alertsContent: {
    paddingHorizontal: spacing.lg,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  alertItemUnread: {
    backgroundColor: colors.backgroundSecondary,
    borderColor: colors.primary + '30',
  },
  unreadDot: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.sm,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  alertIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  alertContent: {
    flex: 1,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  alertMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  alertTopic: {
    ...typography.caption,
    fontWeight: '600',
  },
  alertDot: {
    color: colors.textMuted,
    fontSize: 8,
  },
  alertTime: {
    ...typography.caption,
    color: colors.textMuted,
  },
  alertHeadline: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 4,
  },
  alertHeadlineUnread: {
    color: colors.text,
    fontWeight: '500',
  },
  alertSource: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 11,
  },
  alertAction: {
    marginLeft: spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl * 2,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptyDescription: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
