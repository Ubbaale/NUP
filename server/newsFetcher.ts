import Parser from "rss-parser";
import { storage } from "./storage";
import { log } from "./index";

const parser = new Parser({
  customFields: {
    item: [["media:content", "media"]],
  },
});

const SEARCH_QUERIES = [
  "NUP Uganda",
  "Bobi Wine",
  "National Unity Platform Uganda",
  "Kyagulanyi Ssentamu",
  "Bobi Wine event",
  "Bobi Wine visit",
  "Bobi Wine diaspora",
  "Bobi Wine tour",
];

const FETCH_INTERVAL_MS = 30 * 60 * 1000;

function buildGoogleNewsUrl(query: string): string {
  const encoded = encodeURIComponent(query);
  return `https://news.google.com/rss/search?q=${encoded}&hl=en&gl=US&ceid=US:en`;
}

function extractSourceFromTitle(title: string): { cleanTitle: string; source: string } {
  const match = title.match(/^(.*)\s+-\s+([^-]+)$/);
  if (match) {
    return { cleanTitle: match[1].trim(), source: match[2].trim() };
  }
  return { cleanTitle: title, source: "Google News" };
}

function cleanExcerpt(snippet: string | undefined, cleanTitle: string, source: string): string | null {
  if (!snippet) return null;
  let cleaned = snippet.trim();
  const suffixPattern = new RegExp(`\\s*${source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'i');
  cleaned = cleaned.replace(suffixPattern, '').trim();
  const titlePattern = new RegExp(`^${cleanTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*`, 'i');
  cleaned = cleaned.replace(titlePattern, '').trim();
  if (cleaned.length < 20 || cleaned.toLowerCase() === cleanTitle.toLowerCase()) return null;
  return cleaned.slice(0, 300);
}

function categorizeArticle(title: string, content?: string): string {
  const text = `${title} ${content || ""}`.toLowerCase();
  if (text.includes("visit") || text.includes("tour") || text.includes("event") || text.includes("appearance") || text.includes("host") || text.includes("meet") || text.includes("welcome") || text.includes("reception") || text.includes("fundrais") || text.includes("gala") || text.includes("dinner") || text.includes("concert") || text.includes("convention") || text.includes("conference") || text.includes("gathering")) return "Events";
  if (text.includes("election") || text.includes("vote") || text.includes("poll") || text.includes("campaign")) return "Elections";
  if (text.includes("court") || text.includes("arrest") || text.includes("rights") || text.includes("protest")) return "Human Rights";
  if (text.includes("diaspora") || text.includes("abroad") || text.includes("overseas")) return "Diaspora";
  if (text.includes("parliament") || text.includes("mp") || text.includes("law") || text.includes("bill")) return "Parliament";
  if (text.includes("diplomat") || text.includes("ambassador") || text.includes("united nations") || text.includes("eu ") || text.includes("international")) return "International";
  if (text.includes("rally") || text.includes("opposition") || text.includes("manifesto") || text.includes("party")) return "Politics";
  return "Politics";
}

export async function fetchNewsFromRSS(): Promise<number> {
  let totalAdded = 0;
  const existingNews = await storage.getAllNewsItems();
  const existingTitles = new Set(existingNews.map(n => n.title.toLowerCase().trim()));

  for (const query of SEARCH_QUERIES) {
    try {
      const url = buildGoogleNewsUrl(query);
      const feed = await parser.parseURL(url);

      for (const item of feed.items || []) {
        if (!item.title) continue;

        const { cleanTitle, source } = extractSourceFromTitle(item.title);

        if (existingTitles.has(cleanTitle.toLowerCase().trim())) continue;

        const category = categorizeArticle(cleanTitle, item.contentSnippet);
        const publishedAt = item.pubDate ? new Date(item.pubDate) : new Date();
        const excerpt = cleanExcerpt(item.contentSnippet, cleanTitle, source);

        try {
          await storage.createNewsItem({
            title: cleanTitle,
            source,
            url: item.link || null,
            excerpt,
            imageUrl: null,
            category,
            publishedAt,
          });

          existingTitles.add(cleanTitle.toLowerCase().trim());
          totalAdded++;
        } catch (err) {
        }
      }
    } catch (err) {
      log(`Failed to fetch news for query "${query}": ${err}`, "news-fetcher");
    }
  }

  return totalAdded;
}

export function startNewsFetcher(): void {
  log("Starting live news fetcher (runs every 30 minutes)", "news-fetcher");

  fetchNewsFromRSS()
    .then((count) => {
      if (count > 0) {
        log(`Initial fetch: added ${count} new articles`, "news-fetcher");
      } else {
        log("Initial fetch: no new articles found", "news-fetcher");
      }
    })
    .catch((err) => {
      log(`Initial fetch failed: ${err}`, "news-fetcher");
    });

  setInterval(() => {
    fetchNewsFromRSS()
      .then((count) => {
        if (count > 0) {
          log(`Periodic fetch: added ${count} new articles`, "news-fetcher");
        }
      })
      .catch((err) => {
        log(`Periodic fetch failed: ${err}`, "news-fetcher");
      });
  }, FETCH_INTERVAL_MS);
}
