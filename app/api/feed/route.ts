import { NextResponse } from "next/server";
import { z } from "zod";

// ─── Root cause of off-topic results ─────────────────────────────────────────
//
// 1. NewsAPI searched the full article BODY (q=), so a political article
//    mentioning "environment" once would match. Fix: use `qInTitle` so only
//    articles whose HEADLINE is about eco topics pass.
//
// 2. The old query joined 16 keywords with " OR " — after URL-encoding this
//    often silently exceeded NewsAPI's 500-char limit, causing broad fallback.
//    Fix: tight, grouped boolean query well under the limit.
//
// 3. GNews requires multi-word phrases in double-quotes ("climate change"),
//    otherwise a bare space means AND — "renewable energy" without quotes
//    matched "renewable" AND "energy" appearing anywhere separately.
//    Fix: quote all multi-word terms in the GNews query.
//
// 4. sortBy=publishedAt surfaces any recent loose match first.
//    Fix: sortBy=relevancy (NewsAPI) / sortby=relevance (GNews).

/** NewsAPI qInTitle query — title-only search, well under 500-char limit. */
const NEWS_API_TITLE_QUERY =
  "(recycling OR recycle OR sustainability OR \"climate change\" OR " +
  "\"plastic pollution\" OR \"renewable energy\" OR \"clean energy\" OR " +
  "\"carbon emission\" OR \"global warming\" OR upcycling OR " +
  "\"circular economy\" OR \"e-waste\")";

/** GNews query — quoted multi-word phrases, OR has higher precedence than AND. */
const GNEWS_QUERY =
  "recycling OR sustainability OR \"climate change\" OR \"plastic pollution\" OR " +
  "\"renewable energy\" OR \"carbon emission\" OR upcycling OR \"global warming\"";

// ─── Secondary safety filter ──────────────────────────────────────────────────
// Even with title-only search, a small number of off-topic articles can slip
// through (e.g. "green energy policy" in a political headline). This filter
// drops articles whose combined title+description contain none of our signals.

const ECO_SIGNALS = [
  "recycl", "sustainab", "climate", "plastic", "environment", "waste",
  "renewable", "carbon", "emission", "green energy", "clean energy",
  "solar", "eco", "upcycl", "circular economy", "e-waste", "biodegradable",
  "pollution", "conservation", "global warming",
];

function isEcoArticle(title: string, description: string | null): boolean {
  const combined = `${title} ${description ?? ""}`.toLowerCase();
  return ECO_SIGNALS.some((s) => combined.includes(s));
}

// ─── Response schemas ─────────────────────────────────────────────────────────

const NewsAPISchema = z.object({
  status: z.string(),
  articles: z.array(z.object({
    title: z.string().nullable(),
    description: z.string().nullable(),
    url: z.string(),
    urlToImage: z.string().nullable().optional(),
    publishedAt: z.string(),
    source: z.object({ name: z.string().nullable() }).optional(),
  })).optional(),
  code: z.string().optional(),
  message: z.string().optional(),
});

const GNewsSchema = z.object({
  totalArticles: z.number().optional(),
  articles: z.array(z.object({
    title: z.string(),
    description: z.string().nullable(),
    url: z.string(),
    image: z.string().nullable().optional(),
    publishedAt: z.string(),
    source: z.object({ name: z.string() }).optional(),
  })).optional(),
  errors: z.array(z.string()).optional(),
});

type FeedItem = {
  title: string;
  description: string | null;
  image: string | null;
  url: string;
  source: string;
  publishedAt: string;
};

// ─── Route handler ────────────────────────────────────────────────────────────

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const limit = 5;

  // NewsAPI: qInTitle restricts match to headline only — far more precise
  // than q (full body). sortBy=relevancy ranks best matches first.
  const newsApiUrl =
    `https://newsapi.org/v2/everything` +
    `?qInTitle=${encodeURIComponent(NEWS_API_TITLE_QUERY)}` +
    `&sortBy=relevancy` +
    `&language=en` +
    `&pageSize=50` +
    `&apiKey=${process.env.NEWSAPI_KEY}`;

  // GNews: quoted phrases prevent AND-splitting of multi-word terms.
  // sortby=relevance (GNews spelling, no 'c' at end) ranks on-topic first.
  const gnewsUrl =
    `https://gnews.io/api/v4/search` +
    `?q=${encodeURIComponent(GNEWS_QUERY)}` +
    `&lang=en` +
    `&sortby=relevance` +
    `&max=10` +
    `&apikey=${process.env.GNEWS_API_KEY}`;

  try {
    const [newsRes, gnewsRes] = await Promise.all([
      fetch(newsApiUrl),
      fetch(gnewsUrl),
    ]);
    const [newsJson, gnewsJson] = await Promise.all([
      newsRes.json(),
      gnewsRes.json(),
    ]);

    let combined: FeedItem[] = [];

    // ── NewsAPI ───────────────────────────────────────────────────────────
    const news = NewsAPISchema.safeParse(newsJson);
    if (news.success && news.data.articles) {
      combined.push(...news.data.articles.map((a) => ({
        title: a.title ?? "",
        description: a.description,
        image: a.urlToImage ?? null,
        url: a.url,
        source: a.source?.name ?? "NewsAPI",
        publishedAt: a.publishedAt,
      })));
    } else {
      console.error(
        "NewsAPI error/invalid:",
        news.success ? news.data : news.error?.issues,
        newsJson,
      );
    }

    // ── GNews ─────────────────────────────────────────────────────────────
    const gnews = GNewsSchema.safeParse(gnewsJson);
    if (gnews.success && gnews.data.articles) {
      combined.push(...gnews.data.articles.map((a) => ({
        title: a.title,
        description: a.description,
        image: a.image ?? null,
        url: a.url,
        source: a.source?.name ?? "GNews",
        publishedAt: a.publishedAt,
      })));
    } else {
      console.error(
        "GNews error/invalid:",
        gnews.success ? gnews.data : gnews.error?.issues,
        gnewsJson,
      );
    }

    // ── Safety filter → deduplicate → sort ───────────────────────────────
    combined = combined.filter(
      (i) => i.title && i.url && isEcoArticle(i.title, i.description),
    );
    combined = Array.from(new Map(combined.map((i) => [i.url, i])).values());
    combined.sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );

    // ── Paginate ──────────────────────────────────────────────────────────
    const start = (page - 1) * limit;
    const paginated = combined.slice(start, start + limit);

    return NextResponse.json({
      page,
      limit,
      total: combined.length,
      hasMore: start + limit < combined.length,
      data: paginated,
    });
  } catch (err) {
    console.error("Feed fetch failed:", err);
    return NextResponse.json({ error: "Failed to fetch feed" }, { status: 500 });
  }
}