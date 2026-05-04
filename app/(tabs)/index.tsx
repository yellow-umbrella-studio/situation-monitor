import { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
  Dimensions,
  ActivityIndicator,
  Modal,
  Share,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInUp,
  SlideInDown,
  SlideOutDown,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { useAppContext } from '../../src/context/AppContext';
import { getTopicById } from '../../src/constants/topics';
import { useNews } from '../../src/hooks/useNews';
import { usePolymarket } from '../../src/hooks/usePolymarket';
import { useMarkets } from '../../src/hooks/useMarkets';
import { useTrends } from '../../src/hooks/useTrends';
import { formatTraffic } from '../../src/services/trendsService';
import { extractTrendingKeywords } from '../../src/services/keywordExtractor';
import { useSentiment } from '../../src/hooks/useSentiment';
import { fearGreedColor } from '../../src/services/sentimentService';
import { getWorldClock, CityTime } from '../../src/utils/worldClock';
import { useEarthquakes } from '../../src/hooks/useEarthquakes';
import { magnitudeColor } from '../../src/services/earthquakeService';
import { usePizzaIndex } from '../../src/hooks/usePizzaIndex';
import { defconColor } from '../../src/services/pizzaIndexService';
import { useConflicts } from '../../src/hooks/useConflicts';
import { Conflict, severityColor, statusArrow } from '../../src/services/conflictsService';
import { useMilitaryAircraft } from '../../src/hooks/useMilitaryAircraft';
import { aircraftTypeColor, formatAltitude } from '../../src/services/militaryAircraftService';
import { useGDELT } from '../../src/hooks/useGDELT';
import { useOnThisDay, useHackerNews } from '../../src/hooks/useExtras';
import { NewsItem } from '../../src/services/newsService';
import { PredictionMarket, formatVolume, formatProbability } from '../../src/services/polymarketService';
import { formatPrice } from '../../src/services/marketService';
import { formatTimeAgo } from '../../src/utils/helpers';
import { colors } from '../../src/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function DashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { selectedTopics } = useAppContext();
  const { newsByTopic, breaking, latest, isLoading, error, refresh } = useNews(selectedTopics);
  const { markets: predictions, refresh: refreshPredictions } = usePolymarket();
  const { tickers, commodities } = useMarkets();
  const { trends } = useTrends();
  const [trendSource, setTrendSource] = useState<'feed' | 'world'>('feed');
  const feedTrends = extractTrendingKeywords(latest, 5);
  const { fearGreed } = useSentiment();
  const { quakes } = useEarthquakes();
  const { pizza } = usePizzaIndex();
  const { conflicts } = useConflicts();
  const [expandedConflict, setExpandedConflict] = useState<string | null>(null);
  const { flights } = useMilitaryAircraft();
  const { events: gdeltEvents } = useGDELT();
  const { events: historicalEvents } = useOnThisDay();
  const { stories: hnStories } = useHackerNews();
  const [clock, setClock] = useState<CityTime[]>(getWorldClock());

  useEffect(() => {
    const interval = setInterval(() => setClock(getWorldClock()), 30 * 1000);
    return () => clearInterval(interval);
  }, []);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<NewsItem | null>(null);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refresh(), refreshPredictions()]);
    setRefreshing(false);
  }, [refresh]);

  const isAlertActive = breaking.length > 0;
  const dateStr = new Date().toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Monitor</Text>
          <Text style={styles.headerDate}>{dateStr}</Text>
        </View>
        <View style={styles.headerRight}>
          {isLoading && !refreshing && (
            <ActivityIndicator size="small" color="#333" />
          )}
          <View style={styles.statusBadge}>
            <View
              style={[
                styles.statusBadgeDot,
                { backgroundColor: isAlertActive ? '#F87171' : '#4ADE80' },
              ]}
            />
            <Text
              style={[
                styles.statusBadgeText,
                { color: isAlertActive ? '#F87171' : '#4ADE80' },
              ]}
            >
              {isAlertActive ? 'ALERT' : 'NORMAL'}
            </Text>
          </View>
        </View>
      </View>

      {/* World Clock */}
      <View style={styles.clockStrip}>
        {clock.map((c) => (
          <View key={c.label} style={styles.clockItem}>
            <Text style={styles.clockCity}>{c.label}</Text>
            <Text style={styles.clockTime}>{c.time}</Text>
          </View>
        ))}
      </View>

      {/* Market ticker */}
      {tickers.length > 0 && <ScrollingTicker tickers={tickers} />}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#333"
          />
        }
      >
        {/* Indices */}
        {(commodities.length > 0 || fearGreed || pizza) && (
          <Animated.View entering={FadeInUp.delay(80).duration(400)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>INDICES</Text>
              <Text style={styles.sectionMeta}>LIVE</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.commoditiesRow}
            >
              {pizza && (
                <View style={styles.commodityCard}>
                  <View style={styles.commodityTop}>
                    <Text style={styles.commodityLabel}>DEFCON {pizza.defconLevel}</Text>
                    <View style={styles.pizzaEmoji}>
                      <Text style={{ fontSize: 10 }}>🍕</Text>
                    </View>
                  </View>
                  <Text style={styles.commodityName}>Pentagon Pizza</Text>
                  <View style={styles.commodityPriceRow}>
                    <Text style={[styles.commodityPrice, { color: defconColor(pizza.defconLevel) }]}>
                      {pizza.index}
                    </Text>
                    <Text style={styles.commodityUnit}>idx</Text>
                  </View>
                  <Text style={[styles.fearGreedLabel, { color: defconColor(pizza.defconLevel) }]} numberOfLines={1}>
                    {pizza.defconLabel}
                  </Text>
                </View>
              )}
              {fearGreed && (
                <View style={styles.commodityCard}>
                  <View style={styles.commodityTop}>
                    <Text style={styles.commodityLabel}>CRYPTO</Text>
                  </View>
                  <Text style={styles.commodityName}>Fear & Greed</Text>
                  <View style={styles.commodityPriceRow}>
                    <Text style={[styles.commodityPrice, { color: fearGreedColor(fearGreed.value) }]}>
                      {fearGreed.value}
                    </Text>
                    <Text style={styles.commodityUnit}>/ 100</Text>
                  </View>
                  <Text style={[styles.fearGreedLabel, { color: fearGreedColor(fearGreed.value) }]} numberOfLines={1}>
                    {fearGreed.classification}
                  </Text>
                </View>
              )}
              {commodities.map((c) => (
                <View key={c.symbol} style={styles.commodityCard}>
                  <View style={styles.commodityTop}>
                    <Text style={styles.commodityLabel}>{c.label.toUpperCase()}</Text>
                    <Text
                      style={[
                        styles.commodityChange,
                        { color: c.changePercent >= 0 ? '#4ADE80' : '#F87171' },
                      ]}
                    >
                      {c.changePercent >= 0 ? '+' : ''}
                      {c.changePercent.toFixed(2)}%
                    </Text>
                  </View>
                  <Text style={styles.commodityName}>{c.name}</Text>
                  <View style={styles.commodityPriceRow}>
                    <Text style={styles.commodityPrice}>${formatPrice(c.price)}</Text>
                    {c.unit ? <Text style={styles.commodityUnit}>{c.unit}</Text> : null}
                  </View>
                </View>
              ))}
            </ScrollView>
          </Animated.View>
        )}

        {/* Top stories - breaking items or 3 most recent */}
        {(() => {
          const top = breaking.length > 0 ? breaking.slice(0, 3) : latest.slice(0, 3);
          const isBreaking = breaking.length > 0;
          if (top.length === 0) return null;
          return (
          <Animated.View entering={FadeInUp.delay(100).duration(400)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionLabelRow}>
                <View style={[styles.sectionDot, { backgroundColor: isBreaking ? '#F87171' : '#4ADE80' }]} />
                <Text style={styles.sectionLabel}>{isBreaking ? 'BREAKING' : 'TOP STORIES'}</Text>
              </View>
              <Text style={[styles.sectionMeta, { color: isBreaking ? '#F87171' : '#4ADE80' }]}>
                {isBreaking ? 'LIVE' : `${top.length}`}
              </Text>
            </View>

            {top.map((item, index) => (
              <Animated.View
                key={item.id}
                entering={FadeInUp.delay(150 + index * 60).duration(400)}
              >
                <BreakingItem item={item} onPress={() => setSelectedItem(item)} />
              </Animated.View>
            ))}
          </Animated.View>
          );
        })()}

        {/* Active Conflicts */}
        {conflicts.length > 0 && (
          <Animated.View entering={FadeInUp.delay(180).duration(400)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>ACTIVE CONFLICTS</Text>
              <Text style={styles.sectionMeta}>{conflicts.length}</Text>
            </View>
            <View style={styles.conflictsList}>
              {conflicts
                .slice(0, 8)
                .map((c) => (
                  <ConflictRow
                    key={c.id}
                    conflict={c}
                    expanded={expandedConflict === c.id}
                    onPress={() => setExpandedConflict(expandedConflict === c.id ? null : c.id)}
                  />
                ))}
            </View>
          </Animated.View>
        )}

        {/* Trending */}
        {(feedTrends.length > 0 || trends.length > 0) && (
          <Animated.View entering={FadeInUp.delay(250).duration(400)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>TRENDING</Text>
              <View style={styles.trendingToggle}>
                <Pressable
                  onPress={() => setTrendSource('feed')}
                  style={[styles.trendToggleBtn, trendSource === 'feed' && styles.trendToggleBtnActive]}
                >
                  <Text style={[styles.trendToggleText, trendSource === 'feed' && styles.trendToggleTextActive]}>
                    Feed
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setTrendSource('world')}
                  style={[styles.trendToggleBtn, trendSource === 'world' && styles.trendToggleBtnActive]}
                >
                  <Text style={[styles.trendToggleText, trendSource === 'world' && styles.trendToggleTextActive]}>
                    World
                  </Text>
                </Pressable>
              </View>
            </View>
            <View style={styles.trendsList}>
              {trendSource === 'feed'
                ? feedTrends.map((t, i) => (
                    <View key={t.keyword} style={styles.trendRow}>
                      <Text style={styles.trendRank}>{String(i + 1).padStart(2, '0')}</Text>
                      <View style={styles.trendContent}>
                        <Text style={styles.trendKeyword} numberOfLines={1}>{t.keyword}</Text>
                        {t.sampleHeadline && (
                          <Text style={styles.trendSubtitle} numberOfLines={1}>{t.sampleHeadline}</Text>
                        )}
                      </View>
                      <Text style={styles.trendTraffic}>{t.count}×</Text>
                    </View>
                  ))
                : trends.map((t, i) => (
                    <View key={t.keyword} style={styles.trendRow}>
                      <Text style={styles.trendRank}>{String(i + 1).padStart(2, '0')}</Text>
                      <View style={styles.trendContent}>
                        <Text style={styles.trendKeyword} numberOfLines={1}>{t.keyword}</Text>
                        {t.newsTitle && (
                          <Text style={styles.trendSubtitle} numberOfLines={1}>{t.newsTitle}</Text>
                        )}
                      </View>
                      <Text style={styles.trendTraffic}>{formatTraffic(t.traffixValue)}</Text>
                    </View>
                  ))}
            </View>
          </Animated.View>
        )}

        {/* Predictions */}
        {predictions.length > 0 && (
          <Animated.View entering={FadeInUp.delay(280).duration(400)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>PREDICTIONS</Text>
              <Text style={styles.sectionMeta}>POLYMARKET</Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.predictionsRow}
            >
              {predictions.map((market) => (
                <PredictionCard key={market.id} market={market} />
              ))}
            </ScrollView>
          </Animated.View>
        )}

        {/* Earthquakes */}
        {quakes.length > 0 && (
          <Animated.View entering={FadeInUp.delay(300).duration(400)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>SEISMIC</Text>
              <Text style={styles.sectionMeta}>{quakes.length}</Text>
            </View>
            <View style={styles.quakeList}>
              {quakes.slice(0, 4).map((q) => (
                <View key={q.id} style={styles.quakeRow}>
                  <View style={[styles.quakeMag, { borderColor: magnitudeColor(q.magnitude) }]}>
                    <Text style={[styles.quakeMagText, { color: magnitudeColor(q.magnitude) }]}>
                      {q.magnitude.toFixed(1)}
                    </Text>
                  </View>
                  <View style={styles.quakeContent}>
                    <Text style={styles.quakePlace} numberOfLines={1}>{q.place}</Text>
                    <Text style={styles.quakeTime}>{formatTimeAgo(q.time)}</Text>
                  </View>
                </View>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Military Aircraft */}
        {flights.length > 0 && (
          <Animated.View entering={FadeInUp.delay(380).duration(400)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>AIRBORNE</Text>
              <Text style={styles.sectionMeta}>{flights.length} TRACKED</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.militaryRow}
            >
              {flights.slice(0, 8).map((f) => (
                <View key={f.callsign} style={styles.militaryCard}>
                  <View style={[styles.militaryDot, { backgroundColor: aircraftTypeColor(f.type) }]} />
                  <Text style={[styles.militaryType, { color: aircraftTypeColor(f.type) }]}>
                    {f.type.toUpperCase()}
                  </Text>
                  <Text style={styles.militaryCallsign}>{f.callsign}</Text>
                  <View style={styles.militaryMeta}>
                    <Text style={styles.militaryMetaText}>{formatAltitude(f.altitude)}</Text>
                    <Text style={styles.militaryDot2}>·</Text>
                    <Text style={styles.militaryMetaText} numberOfLines={1}>
                      {f.country.substring(0, 12)}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </Animated.View>
        )}

        {/* GDELT Events */}
        {gdeltEvents.length > 0 && (
          <Animated.View entering={FadeInUp.delay(420).duration(400)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>GLOBAL PULSE</Text>
              <Text style={styles.sectionMeta}>GDELT</Text>
            </View>
            <View style={styles.gdeltList}>
              {gdeltEvents.slice(0, 5).map((e, i) => (
                <Pressable
                  key={`${e.url}-${i}`}
                  onPress={() => e.url && WebBrowser.openBrowserAsync(e.url, {
                    presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
                    toolbarColor: '#050508',
                    controlsColor: '#fff',
                  })}
                >
                  <View style={styles.gdeltItem}>
                    <Text style={styles.gdeltTitle} numberOfLines={2}>{e.title}</Text>
                    <View style={styles.gdeltMeta}>
                      <Text style={styles.gdeltSource}>{e.source}</Text>
                      <Text style={styles.gdeltDot}>·</Text>
                      <Text style={styles.gdeltCountry}>{e.country}</Text>
                      <Text style={styles.gdeltDot}>·</Text>
                      <Text style={styles.gdeltTime}>{formatTimeAgo(e.publishedAt)}</Text>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Hacker News */}
        {hnStories.length > 0 && (
          <Animated.View entering={FadeInUp.delay(440).duration(400)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionLabelRow}>
                <View style={[styles.sectionDot, { backgroundColor: '#FF6600', borderRadius: 2 }]} />
                <Text style={styles.sectionLabel}>HACKER NEWS</Text>
              </View>
              <Text style={styles.sectionMeta}>TOP 5</Text>
            </View>
            <View style={styles.hnList}>
              {hnStories.map((s, i) => (
                <Pressable
                  key={s.id}
                  onPress={() => WebBrowser.openBrowserAsync(s.url, {
                    presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
                    toolbarColor: '#050508',
                    controlsColor: '#fff',
                  })}
                >
                  <View style={styles.hnItem}>
                    <Text style={styles.hnRank}>{String(i + 1).padStart(2, '0')}</Text>
                    <View style={styles.hnContent}>
                      <Text style={styles.hnTitle} numberOfLines={2}>{s.title}</Text>
                      <View style={styles.hnMeta}>
                        <Text style={styles.hnScore}>▲ {s.score}</Text>
                        <Text style={styles.hnDotSep}>·</Text>
                        <Text style={styles.hnComments}>{s.comments} comments</Text>
                      </View>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          </Animated.View>
        )}

        {/* On This Day */}
        {historicalEvents.length > 0 && (
          <Animated.View entering={FadeInUp.delay(460).duration(400)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>ON THIS DAY</Text>
              <Text style={styles.sectionMeta}>HISTORY</Text>
            </View>
            <View style={styles.otdList}>
              {historicalEvents.map((e, i) => (
                <View key={`${e.year}-${i}`} style={styles.otdItem}>
                  <View style={styles.otdYearBox}>
                    <Text style={styles.otdYear}>{e.year}</Text>
                    <Text style={styles.otdAgo}>{e.yearsAgo}y ago</Text>
                  </View>
                  <Text style={styles.otdText} numberOfLines={3}>{e.text}</Text>
                </View>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Loading state */}
        {isLoading && breaking.length === 0 && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#333" />
            <Text style={styles.loadingText}>Loading feeds...</Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Article Modal */}
      <ArticleModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </View>
  );
}

// ─── Breaking Item ───────────────────────────────────────────────

function openArticle(url: string) {
  if (!url) return;
  WebBrowser.openBrowserAsync(url, {
    presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
    toolbarColor: '#050508',
    controlsColor: '#fff',
  });
}

function BreakingItem({ item, onPress }: { item: NewsItem; onPress: () => void }) {
  const topic = getTopicById(item.topicId);

  return (
    <Pressable style={styles.breakingItem} onPress={onPress}>
      <View style={styles.breakingItemLeft}>
        <View style={[styles.breakingItemBar, { backgroundColor: topic?.color || '#FF4D4D' }]} />
      </View>
      <View style={styles.breakingItemContent}>
        <Text style={styles.breakingItemTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={styles.breakingItemMeta}>
          <Text style={styles.breakingItemSource}>{item.source}</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.breakingItemTime}>{formatTimeAgo(item.publishedAt)}</Text>
        </View>
      </View>
    </Pressable>
  );
}

// ─── Conflict Row ────────────────────────────────────────────────

function ConflictRow({
  conflict,
  expanded,
  onPress,
}: {
  conflict: Conflict;
  expanded: boolean;
  onPress: () => void;
}) {
  const color = severityColor(conflict.severity);
  const arrow = statusArrow(conflict.status);

  const handleOpenLink = () => {
    if (conflict.link) {
      WebBrowser.openBrowserAsync(conflict.link, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
        toolbarColor: '#050508',
        controlsColor: '#fff',
      });
    }
  };

  return (
    <Pressable onPress={onPress}>
      <View style={styles.conflictRow}>
        <View style={[styles.conflictDot, { backgroundColor: color }]} />
        <View style={styles.conflictMain}>
          <View style={styles.conflictTopRow}>
            <Text style={styles.conflictName} numberOfLines={1}>{conflict.name}</Text>
            <Text style={[styles.conflictArrow, { color }]}>{arrow}</Text>
          </View>
          <Text style={styles.conflictMeta}>
            {conflict.rawSeverity}{conflict.region ? ` · ${conflict.region}` : ''}
          </Text>
        </View>
      </View>

      {expanded && (
        <View style={styles.conflictExpanded}>
          {conflict.type ? (
            <View style={styles.conflictStatRow}>
              <Text style={styles.conflictStatLabel}>Type</Text>
              <Text style={styles.conflictStatValue}>{conflict.type}</Text>
            </View>
          ) : null}
          {conflict.region ? (
            <View style={styles.conflictStatRow}>
              <Text style={styles.conflictStatLabel}>Region</Text>
              <Text style={styles.conflictStatValue}>{conflict.region}</Text>
            </View>
          ) : null}
          <View style={styles.conflictStatRow}>
            <Text style={styles.conflictStatLabel}>Severity</Text>
            <Text style={[styles.conflictStatValue, { color }]}>{conflict.rawSeverity}</Text>
          </View>
          <View style={styles.conflictStatRow}>
            <Text style={styles.conflictStatLabel}>Status</Text>
            <Text style={[styles.conflictStatValue, { color }]}>{conflict.status}</Text>
          </View>
          {conflict.link ? (
            <Pressable style={styles.conflictLinkBtn} onPress={handleOpenLink}>
              <Text style={styles.conflictLinkText}>Read CFR analysis</Text>
              <Feather name="external-link" size={12} color="#000" />
            </Pressable>
          ) : null}
        </View>
      )}
    </Pressable>
  );
}

// ─── Scrolling Ticker ────────────────────────────────────────────

function ScrollingTicker({ tickers }: { tickers: { symbol: string; price: number; changePercent: number }[] }) {
  const [contentWidth, setContentWidth] = useState(0);
  const translateX = useSharedValue(0);

  useEffect(() => {
    if (contentWidth === 0) return;
    // ~50 pixels per second
    const duration = (contentWidth / 50) * 1000;
    translateX.value = 0;
    translateX.value = withRepeat(
      withTiming(-contentWidth, { duration, easing: Easing.linear }),
      -1,
      false
    );
  }, [contentWidth]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={styles.tickerWrap}>
      <Animated.View style={[styles.tickerTrack, animatedStyle]}>
        {/* Render twice for seamless loop */}
        {[0, 1].map((copy) => (
          <View
            key={copy}
            style={styles.tickerRow}
            onLayout={copy === 0 ? (e) => setContentWidth(e.nativeEvent.layout.width) : undefined}
          >
            {tickers.map((t, i) => (
              <View key={`${copy}-${t.symbol}-${i}`} style={styles.tickerItem}>
                <Text style={styles.tickerSymbol}>{t.symbol}</Text>
                <Text style={styles.tickerPrice}>{formatPrice(t.price)}</Text>
                <Text
                  style={[
                    styles.tickerChange,
                    { color: t.changePercent >= 0 ? '#4ADE80' : '#F87171' },
                  ]}
                >
                  {t.changePercent >= 0 ? '+' : ''}
                  {t.changePercent.toFixed(2)}%
                </Text>
              </View>
            ))}
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

// ─── Article Modal ───────────────────────────────────────────────

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
    Share.share({
      message: `${item.title}\n\n${item.url}`,
    });
  };

  return (
    <Modal
      visible={!!item}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Animated.View
          entering={SlideInDown.springify().damping(20)}
          exiting={SlideOutDown.duration(200)}
          style={[styles.modalSheet, { paddingBottom: Math.max(insets.bottom, 20) }]}
        >
          <Pressable onPress={() => {}}>
            {/* Handle */}
            <View style={styles.modalHandle} />

            {/* Topic + time */}
            <View style={styles.modalTopRow}>
              <View style={styles.modalTopicRow}>
                <Feather name={topic?.icon as any || 'circle'} size={14} color={topic?.color} />
                <Text style={[styles.modalTopicName, { color: topic?.color }]}>
                  {topic?.name}
                </Text>
              </View>
              <Text style={styles.modalTime}>{formatTimeAgo(item.publishedAt)}</Text>
            </View>

            {/* Title */}
            <Text style={styles.modalTitle}>{item.title}</Text>

            {/* Description */}
            {item.description ? (
              <Text style={styles.modalDesc}>{item.description}</Text>
            ) : null}

            {/* Source */}
            <Text style={styles.modalSource}>{item.source}</Text>

            {/* Actions */}
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

// ─── Prediction Card ─────────────────────────────────────────────

const BAR_COLORS = ['#fff', '#888', '#555', '#333'];

function PredictionCard({ market }: { market: PredictionMarket }) {
  const isBinary = market.outcomes.length <= 2 && market.outcomes[0]?.label === 'Yes';
  const maxProb = Math.max(...market.outcomes.map((o) => o.probability), 0.01);

  return (
    <View style={styles.predictionCard}>
      <View style={styles.predictionHeader}>
        <Text style={styles.predictionTitle} numberOfLines={2}>
          {market.title}
        </Text>
        <Text style={styles.predictionVol}>
          {formatVolume(market.volume24h)}
        </Text>
      </View>

      {isBinary ? (
        <View style={styles.predictionBinaryWrap}>
          <View style={styles.predictionBinaryBar}>
            <View
              style={[
                styles.predictionBinaryFill,
                { width: `${Math.max(market.outcomes[0].probability * 100, 1)}%` },
              ]}
            />
          </View>
          <View style={styles.predictionBinaryLabels}>
            <Text style={styles.predictionBinaryYes}>
              Yes {formatProbability(market.outcomes[0].probability)}
            </Text>
            <Text style={styles.predictionBinaryNo}>
              No {formatProbability(1 - market.outcomes[0].probability)}
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.predictionBars}>
          {market.outcomes.map((o, i) => (
            <View key={i} style={styles.predictionBarRow}>
              <View style={styles.predictionBarLabelRow}>
                <Text
                  style={[styles.predictionBarLabel, i === 0 && styles.predictionBarLabelTop]}
                  numberOfLines={1}
                >
                  {o.label}
                </Text>
                <Text style={[styles.predictionBarPct, i === 0 && styles.predictionBarPctTop]}>
                  {formatProbability(o.probability)}
                </Text>
              </View>
              <View style={styles.predictionBarTrack}>
                <View
                  style={[
                    styles.predictionBarFill,
                    {
                      width: `${Math.max((o.probability / maxProb) * 100, 1)}%`,
                      backgroundColor: BAR_COLORS[i] || '#333',
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050508',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 14,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -1.2,
    lineHeight: 38,
  },
  headerDate: {
    fontSize: 11,
    fontWeight: '600',
    color: '#444',
    letterSpacing: 0.8,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 50,
    backgroundColor: '#0C0C12',
    borderWidth: 1,
    borderColor: '#1A1A24',
  },
  statusBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },

  // Unified section pattern
  section: {
    marginBottom: 36,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 14,
  },
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#777',
    letterSpacing: 1.5,
  },
  sectionMeta: {
    fontSize: 10,
    fontWeight: '700',
    color: '#444',
    letterSpacing: 1,
  },
  sectionDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },

  // World Clock
  clockStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 14,
  },
  clockItem: {
    alignItems: 'center',
  },
  clockCity: {
    fontSize: 9,
    fontWeight: '700',
    color: '#444',
    letterSpacing: 1,
    marginBottom: 2,
  },
  clockTime: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
  },

  // Ticker
  tickerWrap: {
    height: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#111118',
    marginBottom: 16,
    overflow: 'hidden',
  },
  tickerTrack: {
    flexDirection: 'row',
    height: '100%',
    alignItems: 'center',
  },
  tickerRow: {
    flexDirection: 'row',
    gap: 18,
    paddingRight: 18,
  },
  tickerItem: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  tickerSymbol: {
    fontSize: 11,
    fontWeight: '700',
    color: '#666',
    letterSpacing: 0.3,
  },
  tickerPrice: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ccc',
  },
  tickerChange: {
    fontSize: 11,
    fontWeight: '700',
  },

  // Scroll
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 0,
  },

  // Breaking
  breakingItem: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  breakingItemLeft: {
    paddingTop: 4,
    marginRight: 14,
  },
  breakingItemBar: {
    width: 3,
    borderRadius: 2,
    alignSelf: 'stretch',
  },
  breakingItemContent: {
    flex: 1,
  },
  breakingItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    lineHeight: 22,
    marginBottom: 6,
  },
  breakingItemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  breakingItemSource: {
    fontSize: 12,
    fontWeight: '500',
    color: '#555',
  },
  breakingItemTime: {
    fontSize: 12,
    fontWeight: '500',
    color: '#555',
  },
  metaDot: {
    fontSize: 8,
    color: '#333',
  },

  // Commodities
  commoditiesRow: {
    paddingHorizontal: 24,
    gap: 8,
  },
  commodityCard: {
    width: 116,
    backgroundColor: '#0C0C12',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#15151D',
  },
  commodityTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  commodityLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#555',
    letterSpacing: 1,
  },
  commodityChange: {
    fontSize: 10,
    fontWeight: '700',
  },
  commodityName: {
    fontSize: 11,
    fontWeight: '500',
    color: '#666',
    marginBottom: 4,
  },
  commodityPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
  },
  commodityPrice: {
    fontSize: 17,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.3,
  },
  commodityUnit: {
    fontSize: 9,
    fontWeight: '500',
    color: '#444',
  },
  fearGreedLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  pizzaEmoji: {
    opacity: 0.6,
  },

  // Trending
  trendingToggle: {
    flexDirection: 'row',
    backgroundColor: '#111118',
    borderRadius: 50,
    padding: 3,
  },
  trendToggleBtn: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 50,
  },
  trendToggleBtnActive: {
    backgroundColor: '#fff',
  },
  trendToggleText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
  },
  trendToggleTextActive: {
    color: '#000',
  },
  trendsList: {
    paddingHorizontal: 24,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 14,
  },
  trendRank: {
    fontSize: 11,
    fontWeight: '800',
    color: '#333',
    width: 20,
    letterSpacing: 0.5,
  },
  trendContent: {
    flex: 1,
  },
  trendKeyword: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'capitalize',
    marginBottom: 2,
  },
  trendSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    color: '#444',
  },
  trendTraffic: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4ADE80',
  },
  // Earthquakes
  quakeList: {
    paddingHorizontal: 24,
    gap: 8,
  },
  quakeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  quakeMag: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quakeMagText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  quakeContent: {
    flex: 1,
  },
  quakePlace: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ccc',
    marginBottom: 2,
  },
  quakeTime: {
    fontSize: 11,
    fontWeight: '500',
    color: '#444',
  },

  // Conflicts
  conflictsList: {
    paddingHorizontal: 24,
  },
  conflictRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  conflictDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  conflictMain: {
    flex: 1,
  },
  conflictTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  conflictName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ccc',
    flex: 1,
    marginRight: 8,
  },
  conflictArrow: {
    fontSize: 16,
    fontWeight: '700',
  },
  conflictMeta: {
    fontSize: 11,
    fontWeight: '500',
    color: '#444',
    marginTop: 2,
  },
  conflictLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 50,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  conflictLinkText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
  },
  conflictExpanded: {
    marginLeft: 20,
    marginBottom: 10,
    paddingLeft: 12,
    borderLeftWidth: 1,
    borderLeftColor: '#1A1A24',
    gap: 6,
  },
  conflictStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  conflictStatLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#444',
  },
  conflictStatValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
  },

  // Military Aircraft
  militaryRow: {
    paddingHorizontal: 24,
    gap: 10,
  },
  militaryCard: {
    width: 134,
    backgroundColor: '#0C0C12',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#15151D',
  },
  militaryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginBottom: 8,
  },
  militaryType: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  militaryCallsign: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
  },
  militaryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  militaryMetaText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#555',
  },
  militaryDot2: {
    fontSize: 8,
    color: '#333',
  },

  // GDELT
  gdeltList: {
    paddingHorizontal: 24,
  },
  gdeltItem: {
    paddingVertical: 10,
  },
  gdeltTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ccc',
    lineHeight: 19,
    marginBottom: 4,
  },
  gdeltMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  gdeltSource: {
    fontSize: 11,
    fontWeight: '500',
    color: '#444',
  },
  gdeltCountry: {
    fontSize: 11,
    fontWeight: '500',
    color: '#444',
  },
  gdeltTime: {
    fontSize: 11,
    fontWeight: '500',
    color: '#444',
  },
  gdeltDot: {
    fontSize: 8,
    color: '#333',
  },

  // Hacker News
  hnList: {
    paddingHorizontal: 24,
  },
  hnItem: {
    flexDirection: 'row',
    paddingVertical: 10,
    gap: 12,
  },
  hnRank: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333',
    width: 22,
    paddingTop: 2,
  },
  hnContent: {
    flex: 1,
  },
  hnTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ccc',
    lineHeight: 19,
    marginBottom: 4,
  },
  hnMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  hnScore: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FF6600',
  },
  hnComments: {
    fontSize: 11,
    fontWeight: '500',
    color: '#444',
  },
  hnDotSep: {
    fontSize: 8,
    color: '#333',
  },

  // On This Day
  otdList: {
    paddingHorizontal: 24,
  },
  otdItem: {
    flexDirection: 'row',
    paddingVertical: 10,
    gap: 14,
  },
  otdYearBox: {
    width: 54,
    alignItems: 'flex-start',
  },
  otdYear: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.3,
  },
  otdAgo: {
    fontSize: 10,
    fontWeight: '500',
    color: '#444',
    marginTop: 1,
  },
  otdText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: '#888',
    lineHeight: 18,
  },

  // Predictions
  predictionsRow: {
    paddingHorizontal: 24,
    gap: 10,
  },
  predictionCard: {
    width: SCREEN_WIDTH * 0.72,
    backgroundColor: '#0C0C12',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#15151D',
  },
  predictionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
    gap: 8,
  },
  predictionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 20,
    flex: 1,
  },
  predictionVol: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
    marginTop: 2,
  },

  // Binary yes/no
  predictionBinaryWrap: {
    gap: 6,
  },
  predictionBinaryBar: {
    height: 6,
    backgroundColor: '#1A1A24',
    borderRadius: 3,
    overflow: 'hidden',
  },
  predictionBinaryFill: {
    height: 6,
    backgroundColor: '#fff',
    borderRadius: 3,
  },
  predictionBinaryLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  predictionBinaryYes: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  predictionBinaryNo: {
    fontSize: 12,
    fontWeight: '500',
    color: '#444',
  },

  // Multi-outcome bars
  predictionBars: {
    gap: 8,
  },
  predictionBarRow: {
    gap: 4,
  },
  predictionBarLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  predictionBarLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#555',
    flex: 1,
    marginRight: 8,
  },
  predictionBarLabelTop: {
    color: '#fff',
    fontWeight: '600',
  },
  predictionBarPct: {
    fontSize: 13,
    fontWeight: '700',
    color: '#555',
  },
  predictionBarPctTop: {
    color: '#fff',
  },
  predictionBarTrack: {
    height: 4,
    backgroundColor: '#1A1A24',
    borderRadius: 2,
    overflow: 'hidden',
  },
  predictionBarFill: {
    height: 4,
    borderRadius: 2,
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

  // Loading
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
  },
});
