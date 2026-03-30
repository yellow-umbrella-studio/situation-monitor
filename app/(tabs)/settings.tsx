import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { useAppContext } from '../../src/context/AppContext';
import { topics, TopicId } from '../../src/constants/topics';
import { TopicChip } from '../../src/components';
import { colors, spacing, typography, borderRadius } from '../../src/constants/theme';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    selectedTopics,
    toggleTopic,
    notificationsEnabled,
    setNotificationsEnabled,
    darkMode,
    setDarkMode,
    resetOnboarding,
  } = useAppContext();

  const handleResetOnboarding = async () => {
    await resetOnboarding();
    router.replace('/onboarding');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <Animated.View style={styles.header} entering={FadeIn}>
        <Text style={styles.title}>Settings</Text>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Topics Section */}
        <Animated.View style={styles.section} entering={FadeInDown.delay(100)}>
          <View style={styles.sectionHeader}>
            <Feather name="grid" size={18} color={colors.primary} />
            <Text style={styles.sectionTitle}>Monitored Topics</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Select the topics you want to monitor. At least one topic is required.
          </Text>

          <View style={styles.topicsContainer}>
            {topics.map((topic) => (
              <TopicChip
                key={topic.id}
                topic={topic}
                selected={selectedTopics.includes(topic.id)}
                onPress={() => {
                  // Prevent deselecting the last topic
                  if (
                    selectedTopics.includes(topic.id) &&
                    selectedTopics.length === 1
                  ) {
                    return;
                  }
                  toggleTopic(topic.id);
                }}
              />
            ))}
          </View>
        </Animated.View>

        {/* Notifications Section */}
        <Animated.View style={styles.section} entering={FadeInDown.delay(150)}>
          <View style={styles.sectionHeader}>
            <Feather name="bell" size={18} color={colors.primary} />
            <Text style={styles.sectionTitle}>Notifications</Text>
          </View>

          <SettingRow
            icon="bell"
            title="Push Notifications"
            description="Receive alerts for breaking news"
            type="switch"
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
          />

          <SettingRow
            icon="alert-circle"
            title="Critical Alerts Only"
            description="Only notify for critical situations"
            type="switch"
            value={false}
            disabled={!notificationsEnabled}
          />

          <SettingRow
            icon="volume-2"
            title="Sound"
            description="Play sound for notifications"
            type="switch"
            value={true}
            disabled={!notificationsEnabled}
          />
        </Animated.View>

        {/* Appearance Section */}
        <Animated.View style={styles.section} entering={FadeInDown.delay(200)}>
          <View style={styles.sectionHeader}>
            <Feather name="eye" size={18} color={colors.primary} />
            <Text style={styles.sectionTitle}>Appearance</Text>
          </View>

          <SettingRow
            icon="moon"
            title="Dark Mode"
            description="Use dark theme (recommended)"
            type="switch"
            value={darkMode}
            onValueChange={setDarkMode}
          />

          <SettingRow
            icon="activity"
            title="Animations"
            description="Enable smooth animations"
            type="switch"
            value={true}
          />
        </Animated.View>

        {/* About Section */}
        <Animated.View style={styles.section} entering={FadeInDown.delay(250)}>
          <View style={styles.sectionHeader}>
            <Feather name="info" size={18} color={colors.primary} />
            <Text style={styles.sectionTitle}>About</Text>
          </View>

          <SettingRow
            icon="help-circle"
            title="What is Situation Monitor?"
            description="Learn about the app"
            type="link"
            onPress={() => {}}
          />

          <SettingRow
            icon="share-2"
            title="Share App"
            description="Spread the monitoring vibes"
            type="link"
            onPress={() => {}}
          />

          <SettingRow
            icon="star"
            title="Rate Us"
            description="Leave a review on the App Store"
            type="link"
            onPress={() => {}}
          />

          <SettingRow
            icon="twitter"
            title="Follow @SituationMonitor"
            description="Stay updated on Twitter/X"
            type="link"
            onPress={() => Linking.openURL('https://twitter.com')}
          />
        </Animated.View>

        {/* Debug Section */}
        <Animated.View style={styles.section} entering={FadeInDown.delay(300)}>
          <View style={styles.sectionHeader}>
            <Feather name="tool" size={18} color={colors.textMuted} />
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
              Developer
            </Text>
          </View>

          <SettingRow
            icon="refresh-cw"
            title="Reset Onboarding"
            description="Go through the setup again"
            type="link"
            onPress={handleResetOnboarding}
            danger
          />

          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>Situation Monitor v1.0.0</Text>
            <Text style={styles.buildText}>Build 2024.03.30</Text>
          </View>
        </Animated.View>

        {/* Bottom padding */}
        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

function SettingRow({
  icon,
  title,
  description,
  type = 'link',
  value,
  onValueChange,
  onPress,
  disabled,
  danger,
}: {
  icon: string;
  title: string;
  description: string;
  type?: 'switch' | 'link';
  value?: boolean;
  onValueChange?: (value: boolean) => void;
  onPress?: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  const content = (
    <View style={[styles.settingRow, disabled && styles.settingRowDisabled]}>
      <View style={[styles.settingIcon, danger && { backgroundColor: colors.alert + '20' }]}>
        <Feather
          name={icon as any}
          size={18}
          color={danger ? colors.alert : colors.textSecondary}
        />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, danger && { color: colors.alert }]}>
          {title}
        </Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      {type === 'switch' ? (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: colors.cardBorder, true: colors.primaryGlow }}
          thumbColor={value ? colors.primary : colors.textMuted}
          disabled={disabled}
        />
      ) : (
        <Feather name="chevron-right" size={18} color={colors.textMuted} />
      )}
    </View>
  );

  if (type === 'link') {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text,
  },
  sectionDescription: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  topicsContainer: {
    gap: spacing.xs,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  settingRowDisabled: {
    opacity: 0.5,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingDescription: {
    ...typography.caption,
    color: colors.textMuted,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  versionText: {
    ...typography.body,
    color: colors.textMuted,
    marginBottom: 4,
  },
  buildText: {
    ...typography.caption,
    color: colors.textDark,
  },
});
