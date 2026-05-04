import { colors } from './theme';

export type TopicId =
  | 'war-conflicts'
  | 'security'
  | 'ai-tech'
  | 'finance'
  | 'politics'
  | 'military'
  | 'climate'
  | 'science';

export interface Topic {
  id: TopicId;
  name: string;
  shortName: string;
  icon: string;
  color: string;
  description: string;
  googleNewsQuery: string; // Google News RSS search query
}

export const topics: Topic[] = [
  {
    id: 'war-conflicts',
    name: 'War & Conflicts',
    shortName: 'War',
    icon: 'alert-triangle',
    color: '#FF4D4D',
    description: 'Armed conflicts, wars, escalations worldwide',
    googleNewsQuery: 'war OR conflict OR airstrike OR invasion OR ceasefire',
  },
  {
    id: 'security',
    name: 'Security',
    shortName: 'Security',
    icon: 'shield',
    color: '#FF8C42',
    description: 'Cybersecurity, terrorism, intelligence',
    googleNewsQuery: 'cybersecurity OR terrorism OR intelligence OR threat OR cyberattack',
  },
  {
    id: 'ai-tech',
    name: 'AI & Tech',
    shortName: 'AI',
    icon: 'cpu',
    color: '#A78BFA',
    description: 'Artificial intelligence, tech breakthroughs',
    googleNewsQuery: 'artificial intelligence OR AI OR machine learning OR tech breakthrough',
  },
  {
    id: 'finance',
    name: 'Finance & Economy',
    shortName: 'Finance',
    icon: 'trending-up',
    color: '#4ADE80',
    description: 'Markets, economy, central banks, crypto',
    googleNewsQuery: 'stock market OR economy OR federal reserve OR inflation OR cryptocurrency',
  },
  {
    id: 'politics',
    name: 'Politics',
    shortName: 'Politics',
    icon: 'flag',
    color: '#60A5FA',
    description: 'Elections, policy, diplomacy, governance',
    googleNewsQuery: 'politics OR election OR diplomacy OR sanctions OR summit',
  },
  {
    id: 'military',
    name: 'Military',
    shortName: 'Military',
    icon: 'crosshair',
    color: '#6B7280',
    description: 'Defense, weapons, military operations',
    googleNewsQuery: 'military OR defense OR NATO OR weapons OR deployment',
  },
  {
    id: 'climate',
    name: 'Climate & Weather',
    shortName: 'Climate',
    icon: 'cloud-lightning',
    color: '#38BDF8',
    description: 'Climate change, natural disasters, severe weather',
    googleNewsQuery: 'climate change OR hurricane OR earthquake OR wildfire OR flood disaster',
  },
  {
    id: 'science',
    name: 'Science & Space',
    shortName: 'Science',
    icon: 'zap',
    color: '#E879F9',
    description: 'Space missions, discoveries, research',
    googleNewsQuery: 'NASA OR SpaceX OR space mission OR scientific discovery OR research breakthrough',
  },
];

export const getTopicById = (id: TopicId): Topic | undefined => {
  return topics.find((topic) => topic.id === id);
};

export const getTopicColor = (id: TopicId): string => {
  return getTopicById(id)?.color ?? colors.primary;
};
