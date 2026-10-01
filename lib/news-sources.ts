// Fetches farming news from the network (no React Native imports, so it can run in Node too).
// - With EXPO_PUBLIC_NEWS_API_KEY set, it uses NewsAPI (https://newsapi.org). Its free Developer plan is
//   for development only and, in browsers, only answers requests from localhost; phones are fine.
// - Otherwise (or if NewsAPI fails) it uses the GDELT DOC API (https://api.gdeltproject.org), which needs
//   no key and allows browser requests, but is rate-limited (one request every 5 seconds per IP).
const newsApiKey = process.env.EXPO_PUBLIC_NEWS_API_KEY;

export interface NewsArticle {
  title: string;
  description: string | null;
  url: string;
  image: string | null;
  source: string;
  publishedAt: string;
  // Built-in example shown when no live news can be loaded; not a real story.
  isSample?: boolean;
}

// Both sources also match words in article text, so keep only headlines that are about farming or food.
const FARM_WORDS =
  /\b(farm\w*|agri\w*|crops?|harvest\w*|kharif|rabi|mandi|msp|fertili[sz]\w*|dairy|milk|vegetables?|fruits?|tomato\w*|onions?|wheat|rice|paddy|pulses|sugarcane|cotton|irrigation|monsoon|seeds?|horticulture|organic|food prices?|livestock|poultry|eggs?)\b/i;

async function fromNewsApi(key: string): Promise<NewsArticle[]> {
  const params = new URLSearchParams({
    q: "(agriculture OR farming OR farmers OR crops OR mandi OR kharif OR rabi) AND India",
    searchIn: "title,description",
    language: "en",
    sortBy: "publishedAt",
    // Fetch plenty, since the headline filter below drops about half.
    pageSize: "100",
    // In the query string rather than a header, so browsers don't need a CORS preflight.
    apiKey: key,
  });
  const response = await fetch(`https://newsapi.org/v2/everything?${params}`);
  const json = await response.json();
  if (json.status !== "ok") throw new Error(json.message ?? `NewsAPI responded ${response.status}`);

  return (json.articles as {
    source: { name: string | null };
    title: string | null;
    description: string | null;
    url: string | null;
    urlToImage: string | null;
    publishedAt: string;
  }[])
    // NewsAPI marks withdrawn stories as "[Removed]".
    .filter((a) => a.title && a.url && a.title !== "[Removed]" && FARM_WORDS.test(a.title))
    .slice(0, 20)
    .map((a) => ({
      title: a.title!,
      description: a.description,
      url: a.url!,
      image: a.urlToImage,
      source: a.source.name ?? "News",
      publishedAt: a.publishedAt,
    }));
}

// Turns a GDELT "artlist" JSON reply into farm headlines. Rate-limit and error replies are plain text.
export function parseGdelt(text: string): NewsArticle[] {
  let json: { articles?: { url: string; title: string; seendate: string; socialimage: string; domain: string }[] };
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`GDELT: ${text.slice(0, 120)}`);
  }

  const seen = new Set<string>();
  return (json.articles ?? [])
    // GDELT puts spaces around punctuation ("prices , oilseeds", "₹11 . 64 crore").
    .map((a) => ({
      ...a,
      title: a.title
        .replace(/\s+([,.;:!?%)])/g, "$1")
        .replace(/([(])\s+/g, "$1")
        .replace(/(\d)\.\s+(\d)/g, "$1.$2")
        .trim(),
    }))
    .filter((a) => {
      const key = a.title.toLowerCase();
      if (!FARM_WORDS.test(a.title) || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 20)
    .map((a) => ({
      title: a.title,
      description: null,
      url: a.url,
      image: a.socialimage || null,
      source: a.domain,
      // "20261001T114500Z" -> "2026-10-01T11:45:00Z"
      publishedAt: a.seendate.replace(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/, "$1-$2-$3T$4:$5:$6Z"),
    }));
}

async function fromGdelt(): Promise<NewsArticle[]> {
  const params = new URLSearchParams({
    query: "theme:AGRICULTURE sourcecountry:india sourcelang:english",
    mode: "artlist",
    format: "json",
    maxrecords: "75",
    sort: "datedesc",
    timespan: "7d",
  });
  const response = await fetch(`https://api.gdeltproject.org/api/v2/doc/doc?${params}`);
  return parseGdelt(await response.text());
}

// Latest farm headlines, or [] if every source fails.
export async function fetchFarmNews(): Promise<NewsArticle[]> {
  if (newsApiKey) {
    try {
      const articles = await fromNewsApi(newsApiKey);
      if (articles.length > 0) return articles;
    } catch (error) {
      console.warn("NewsAPI failed, falling back to GDELT:", error);
    }
  }
  try {
    return await fromGdelt();
  } catch (error) {
    console.warn("Could not load farm news:", error);
    return [];
  }
}
