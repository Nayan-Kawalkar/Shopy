import AsyncStorage from "@react-native-async-storage/async-storage";

import { fetchFarmNews, NewsArticle } from "./news-sources";

export type { NewsArticle } from "./news-sources";

// Headlines are kept on the device: reused for 30 minutes (so reopening the tab doesn't hit the
// rate-limited news APIs again), and shown as a fallback whenever a fresh fetch fails.
const CACHE_KEY = "digital-farm/news-cache/v1";
const FRESH_FOR_MS = 30 * 60 * 1000;

// Last resort when no live or saved news is available. Flagged isSample so the UI labels them
// and doesn't open them as real stories.
const sampleNews = (): NewsArticle[] =>
  [
    "Tomato arrivals rise in Nashik markets as the harvest picks up",
    "Onion prices hold steady at Lasalgaon ahead of the festive season",
    "Farmers prepare fields for rabi wheat sowing after a patchy monsoon",
    "Groundnut crushing picks up in Saurashtra as new crop reaches mills",
    "Potato cold-storage stocks run low before the new crop arrives",
  ].map((title) => ({
    title,
    description: null,
    url: "",
    image: null,
    source: "Sample headline",
    publishedAt: new Date().toISOString(),
    isSample: true,
  }));

interface CachedNews {
  savedAt: number;
  articles: NewsArticle[];
}

async function readCache(): Promise<CachedNews | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as CachedNews) : null;
  } catch {
    return null;
  }
}

export async function getFarmNews(): Promise<NewsArticle[]> {
  const cached = await readCache();
  if (cached && Date.now() - cached.savedAt < FRESH_FOR_MS) return cached.articles;

  const articles = await fetchFarmNews();
  if (articles.length > 0) {
    const entry: CachedNews = { savedAt: Date.now(), articles };
    AsyncStorage.setItem(CACHE_KEY, JSON.stringify(entry)).catch(() => {});
    return articles;
  }
  return cached?.articles.length ? cached.articles : sampleNews();
}
