import { colors } from './theme';

export type TopicId = 
  | 'world-news'
  | 'markets'
  | 'tech'
  | 'sports'
  | 'entertainment'
  | 'memes'
  | 'weather'
  | 'science';

export interface Topic {
  id: TopicId;
  name: string;
  shortName: string;
  icon: string;
  color: string;
  description: string;
}

export const topics: Topic[] = [
  {
    id: 'world-news',
    name: 'World News',
    shortName: 'News',
    icon: 'globe',
    color: colors.topicNews,
    description: 'Breaking stories & geopolitical events',
  },
  {
    id: 'markets',
    name: 'Markets',
    shortName: 'Markets',
    icon: 'trending-up',
    color: colors.topicMarkets,
    description: 'Stocks, crypto, commodities',
  },
  {
    id: 'tech',
    name: 'Tech',
    shortName: 'Tech',
    icon: 'cpu',
    color: colors.topicTech,
    description: 'AI news, product launches, outages',
  },
  {
    id: 'sports',
    name: 'Sports',
    shortName: 'Sports',
    icon: 'activity',
    color: colors.topicSports,
    description: 'Live scores & trending games',
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    shortName: 'Ent',
    icon: 'film',
    color: colors.topicEntertainment,
    description: 'Viral content, celebrity news, releases',
  },
  {
    id: 'memes',
    name: 'Memes & Culture',
    shortName: 'Memes',
    icon: 'smile',
    color: colors.topicMemes,
    description: 'Trending memes & viral moments',
  },
  {
    id: 'weather',
    name: 'Weather',
    shortName: 'Weather',
    icon: 'cloud-lightning',
    color: colors.topicWeather,
    description: 'Severe alerts & natural disasters',
  },
  {
    id: 'science',
    name: 'Science',
    shortName: 'Science',
    icon: 'zap',
    color: colors.topicScience,
    description: 'Space launches & discoveries',
  },
];

export const getTopicById = (id: TopicId): Topic | undefined => {
  return topics.find((topic) => topic.id === id);
};

export const getTopicColor = (id: TopicId): string => {
  return getTopicById(id)?.color ?? colors.primary;
};
