import { NewsItem } from './newsService';

export interface ExtractedKeyword {
  keyword: string;
  count: number;
  sampleHeadline?: string;
}

// Common English stopwords to filter out
const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
  'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be', 'been', 'being', 'have',
  'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may',
  'might', 'must', 'shall', 'can', 'need', 'dare', 'ought', 'used', 'that', 'this',
  'these', 'those', 'it', 'its', "it's", 'he', 'she', 'they', 'we', 'you', 'i',
  'me', 'him', 'her', 'them', 'us', 'my', 'your', 'his', 'their', 'our', 'who',
  'what', 'when', 'where', 'why', 'how', 'which', 'said', 'says', 'saying', 'after',
  'before', 'about', 'over', 'under', 'again', 'further', 'then', 'once', 'here',
  'there', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some',
  'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very',
  'just', 'now', 'new', 'news', 'report', 'reports', 'says', 'amid', 'into',
  'against', 'during', 'through', 'between', 'off', 'up', 'down', 'out', 'if',
  'because', 'until', 'while', 'also', 'still', 'get', 'got', 'see', 'make',
  'made', 'take', 'took', 'one', 'two', 'year', 'years', 'day', 'days', 'week',
  'time', 'back', 'first', 'last', 'top', 'big', 'full', 'live', 'breaking',
  'update', 'updates', 'latest', 'video', 'watch', 'call', 'calls', 'set', 'come',
  'go', 'goes', 'gone', 'way', 'world', 'us', 'u.s.', 'vs', 'vs.',
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s'-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w) && !/^\d+$/.test(w));
}

export function extractTrendingKeywords(items: NewsItem[], limit = 5): ExtractedKeyword[] {
  if (items.length === 0) return [];

  const bigramCounts = new Map<string, { count: number; headline: string }>();
  const unigramCounts = new Map<string, { count: number; headline: string }>();

  for (const item of items) {
    const tokens = tokenize(item.title);

    // Count bigrams (2-word phrases)
    for (let i = 0; i < tokens.length - 1; i++) {
      const bigram = `${tokens[i]} ${tokens[i + 1]}`;
      const entry = bigramCounts.get(bigram);
      if (entry) {
        entry.count++;
      } else {
        bigramCounts.set(bigram, { count: 1, headline: item.title });
      }
    }

    // Count unigrams (single words, capitalized)
    for (const token of tokens) {
      if (token.length < 4) continue;
      const entry = unigramCounts.get(token);
      if (entry) {
        entry.count++;
      } else {
        unigramCounts.set(token, { count: 1, headline: item.title });
      }
    }
  }

  // Collect bigrams that appear 2+ times (more meaningful than unigrams)
  const bigramResults: ExtractedKeyword[] = [];
  bigramCounts.forEach(({ count, headline }, phrase) => {
    if (count >= 2) {
      bigramResults.push({
        keyword: phrase,
        count: count * 2, // weight bigrams higher
        sampleHeadline: headline,
      });
    }
  });

  // Add unigrams that appear 3+ times to fill gaps
  const unigramResults: ExtractedKeyword[] = [];
  unigramCounts.forEach(({ count, headline }, word) => {
    if (count >= 3) {
      unigramResults.push({ keyword: word, count, sampleHeadline: headline });
    }
  });

  // Merge, dedupe (skip unigrams already covered by bigrams)
  const used = new Set<string>();
  bigramResults.forEach((b) => b.keyword.split(' ').forEach((w) => used.add(w)));

  const merged = [
    ...bigramResults,
    ...unigramResults.filter((u) => !used.has(u.keyword)),
  ];

  return merged
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}
