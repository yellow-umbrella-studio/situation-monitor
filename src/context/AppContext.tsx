import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TopicId, topics as allTopics } from '../constants/topics';

const validTopicIds = new Set(allTopics.map((t) => t.id));

interface AppState {
  hasOnboarded: boolean;
  selectedTopics: TopicId[];
  notificationsEnabled: boolean;
  darkMode: boolean;
  isLoading: boolean;
}

interface AppContextType extends AppState {
  setHasOnboarded: (value: boolean) => void;
  setSelectedTopics: (topics: TopicId[]) => void;
  toggleTopic: (topicId: TopicId) => void;
  setNotificationsEnabled: (value: boolean) => void;
  setDarkMode: (value: boolean) => void;
  resetOnboarding: () => void;
}

const defaultState: AppState = {
  hasOnboarded: false,
  selectedTopics: [],
  notificationsEnabled: true,
  darkMode: true,
  isLoading: true,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  HAS_ONBOARDED: '@situation_monitor_onboarded',
  SELECTED_TOPICS: '@situation_monitor_topics',
  NOTIFICATIONS: '@situation_monitor_notifications',
  DARK_MODE: '@situation_monitor_dark_mode',
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);

  useEffect(() => {
    loadStoredState();
  }, []);

  const loadStoredState = async () => {
    try {
      const [onboarded, topics, notifications, darkMode] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.HAS_ONBOARDED),
        AsyncStorage.getItem(STORAGE_KEYS.SELECTED_TOPICS),
        AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS),
        AsyncStorage.getItem(STORAGE_KEYS.DARK_MODE),
      ]);

      const parsedTopics: TopicId[] = topics ? JSON.parse(topics) : [];
      const validatedTopics = parsedTopics.filter((id) => validTopicIds.has(id));

      // If all stored topics were invalid (old IDs), reset onboarding
      const shouldResetOnboarding = onboarded === 'true' && parsedTopics.length > 0 && validatedTopics.length === 0;

      setState({
        hasOnboarded: shouldResetOnboarding ? false : onboarded === 'true',
        selectedTopics: validatedTopics,
        notificationsEnabled: notifications !== 'false',
        darkMode: darkMode !== 'false',
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to load state:', error);
      setState({ ...defaultState, isLoading: false });
    }
  };

  const setHasOnboarded = async (value: boolean) => {
    setState((prev) => ({ ...prev, hasOnboarded: value }));
    await AsyncStorage.setItem(STORAGE_KEYS.HAS_ONBOARDED, String(value));
  };

  const setSelectedTopics = async (topics: TopicId[]) => {
    setState((prev) => ({ ...prev, selectedTopics: topics }));
    await AsyncStorage.setItem(STORAGE_KEYS.SELECTED_TOPICS, JSON.stringify(topics));
  };

  const toggleTopic = async (topicId: TopicId) => {
    const removing = state.selectedTopics.includes(topicId);
    if (!removing && state.selectedTopics.length >= 3) return;
    const newTopics = removing
      ? state.selectedTopics.filter((t) => t !== topicId)
      : [...state.selectedTopics, topicId];
    await setSelectedTopics(newTopics);
  };

  const setNotificationsEnabled = async (value: boolean) => {
    setState((prev) => ({ ...prev, notificationsEnabled: value }));
    await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, String(value));
  };

  const setDarkMode = async (value: boolean) => {
    setState((prev) => ({ ...prev, darkMode: value }));
    await AsyncStorage.setItem(STORAGE_KEYS.DARK_MODE, String(value));
  };

  const resetOnboarding = async () => {
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.HAS_ONBOARDED),
      AsyncStorage.removeItem(STORAGE_KEYS.SELECTED_TOPICS),
    ]);
    setState((prev) => ({
      ...prev,
      hasOnboarded: false,
      selectedTopics: [],
    }));
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        setHasOnboarded,
        setSelectedTopics,
        toggleTopic,
        setNotificationsEnabled,
        setDarkMode,
        resetOnboarding,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

export default AppContext;
