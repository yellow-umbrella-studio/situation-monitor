import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
  Modal,
  Share,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInUp, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { useAppContext } from '../../src/context/AppContext';
import { getTopicById, topics, TopicId } from '../../src/constants/topics';
import { useNews } from '../../src/hooks/useNews';
import { NewsItem } from '../../src/services/newsService';
import { formatTimeAgo } from '../../src/utils/helpers';

export default function FeedScreen() {
  const insets = useSafeAreaInsets();
  const { selectedTopics } = useAppContext();
  const { latest, isLoading, refresh } = useNews(selectedTopics);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<TopicId | 'all'>('all');
  const [selectedItem, setSelectedItem] = useState<NewsItem | null>(null);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const filtered = activeFilter === 'all'
    ? latest
    : latest.filter((item) => item.topicId === activeFilter);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Feed</Text>
        <Text style={styles.headerCount}>{filtered.length} stories</Text>
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersRow}
      >
        <Pressable
          onPress={() => setActiveFilter('all')}
          style={[styles.filterChip, activeFilter === 'all' && styles.filterChipActive]}
        >
          <Text style={[styles.filterChipText, activeFilter === 'all' && styles.filterChipTextActive]}>
            All
          </Text>
        </Pressable>
        {selectedTopics.map((topicId) => {
          const topic = getTopicById(topicId);
          const isActive = activeFilter === topicId;
          return (
            <Pressable
              key={topicId}
              onPress={() => setActiveFilter(topicId)}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
            >
              <Feather
                name={topic?.icon as any || 'circle'}
                size={12}
                color={isActive ? '#000' : '#777'}
              />
              <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                {topic?.shortName}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* News list */}
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#333" />
        }
      >
        {filtered.slice(0, 50).map((item, index) => (
          <Animated.View key={item.id} entering={FadeInUp.delay(index * 20).duration(300)}>
            <Pressable style={styles.newsItem} onPress={() => setSelectedItem(item)}>
              <View style={styles.newsItemContent}>
                <View style={styles.newsItemTopRow}>
                  <Feather
                    name={getTopicById(item.topicId)?.icon as any || 'circle'}
                    size={12}
                    color={getTopicById(item.topicId)?.color || '#666'}
                  />
                  <Text style={[styles.newsItemTopic, { color: getTopicById(item.topicId)?.color }]}>
                    {getTopicById(item.topicId)?.shortName}
                  </Text>
                  <Text style={styles.newsItemTime}>{formatTimeAgo(item.publishedAt)}</Text>
                </View>
                <Text style={styles.newsItemTitle} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={styles.newsItemSource}>{item.source}</Text>
              </View>
            </Pressable>
          </Animated.View>
        ))}

        {!isLoading && filtered.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No stories</Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Article Modal */}
      <ArticleModal item={selectedItem} onClose={() => setSelectedItem(null)} />
    </View>
  );
}

function ArticleModal({ item, onClose }: { item: NewsItem | null; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  if (!item) return null;

  const topic = getTopicById(item.topicId);

  const handleReadMore = () => {
    if (!item.url) return;
    WebBrowser.openBrowserAsync(item.url, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
      toolbarColor: '#050508',
      controlsColor: '#fff',
    });
  };

  const handleShare = () => {
    Share.share({ message: `${item.title}\n\n${item.url}` });
  };

  return (
    <Modal visible={!!item} transparent animationType="none" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Animated.View
          entering={SlideInDown.springify().damping(20)}
          exiting={SlideOutDown.duration(200)}
          style={[styles.modalSheet, { paddingBottom: Math.max(insets.bottom, 20) }]}
        >
          <Pressable onPress={() => {}}>
            <View style={styles.modalHandle} />

            <View style={styles.modalTopRow}>
              <View style={styles.modalTopicRow}>
                <Feather name={topic?.icon as any || 'circle'} size={14} color={topic?.color} />
                <Text style={[styles.modalTopicName, { color: topic?.color }]}>{topic?.name}</Text>
              </View>
              <Text style={styles.modalTime}>{formatTimeAgo(item.publishedAt)}</Text>
            </View>

            <Text style={styles.modalTitle}>{item.title}</Text>
            {item.description ? <Text style={styles.modalDesc}>{item.description}</Text> : null}
            <Text style={styles.modalSource}>{item.source}</Text>

            <View style={styles.modalActions}>
              <Pressable style={styles.modalActionPrimary} onPress={handleReadMore}>
                <Text style={styles.modalActionPrimaryText}>Read full article</Text>
                <Feather name="external-link" size={14} color="#000" />
              </Pressable>
              <Pressable style={styles.modalActionSecondary} onPress={handleShare}>
                <Feather name="share" size={16} color="#888" />
              </Pressable>
              <Pressable style={styles.modalActionSecondary} onPress={onClose}>
                <Feather name="x" size={16} color="#888" />
              </Pressable>
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050508',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -1,
  },
  headerCount: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
  },

  // Filters
  filtersRow: {
    paddingHorizontal: 24,
    gap: 8,
    paddingBottom: 16,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 50,
    backgroundColor: '#111118',
  },
  filterChipActive: {
    backgroundColor: '#fff',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#777',
  },
  filterChipTextActive: {
    color: '#000',
  },

  // Scroll
  scroll: {
    flex: 1,
  },

  // News item
  newsItem: {
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  newsItemContent: {
    flex: 1,
  },
  newsItemTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 6,
  },
  newsItemTopic: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  newsItemTime: {
    fontSize: 11,
    fontWeight: '500',
    color: '#333',
  },
  newsItemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#B0B0BE',
    lineHeight: 21,
    marginBottom: 4,
  },
  newsItemSource: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },

  // Empty
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#111118',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 8,
    maxHeight: '80%',
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#2A2A38',
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTopicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modalTopicName: {
    fontSize: 13,
    fontWeight: '600',
  },
  modalTime: {
    fontSize: 12,
    fontWeight: '500',
    color: '#444',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 27,
    marginBottom: 12,
  },
  modalDesc: {
    fontSize: 15,
    fontWeight: '400',
    color: '#888',
    lineHeight: 22,
    marginBottom: 12,
  },
  modalSource: {
    fontSize: 13,
    fontWeight: '500',
    color: '#444',
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalActionPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 50,
  },
  modalActionPrimaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
  modalActionSecondary: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#1A1A24',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
