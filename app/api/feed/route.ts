/*import { NextResponse } from "next/server";

const ECO_KEYWORDS = [
  "recycle",
  "recycling",
  "waste",
  "renewable energy",
  "solar",
  "climate change",
  "global warming",
  "environment",
  "sustainability",
  "plastic pollution",
  "recycled art",
  "ngo",
  "environmental protection",
  "carbon emission",
  "clean energy",
  "green energy",
];

function buildQuery() {
  return ECO_KEYWORDS.join(" OR ");
}

function normalizeNewsAPI(data: any) {
  return (data.articles || []).map((a: any) => ({
    title: a.title,
    description: a.description,
    image: a.urlToImage,
    url: a.url,
    source: a.source?.name || "NewsAPI",
    publishedAt: a.publishedAt,
  }));
}

function normalizeGNews(data: any) {
  return (data.articles || []).map((a: any) => ({
    title: a.title,
    description: a.description,
    image: a.image,
    url: a.url,
    source: a.source?.name || "GNews",
    publishedAt: a.publishedAt,
  }));
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const page = Number(searchParams.get("page") || 1);
  const limit = 5;

  const query = buildQuery();

  const newsApiUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(
    query
  )}&sortBy=publishedAt&pageSize=50&apiKey=${process.env.NEWSAPI_KEY}`;

  const gnewsUrl = `https://gnews.io/api/v4/search?q=${encodeURIComponent(
    query
  )}&lang=en&max=10&apikey=${process.env.GNEWS_API_KEY}`;

  try {
    const [newsRes, gnewsRes] = await Promise.all([
      fetch(newsApiUrl),
      fetch(gnewsUrl),
    ]);

    const newsData = await newsRes.json();
    const gnewsData = await gnewsRes.json();

    let combined = [
      ...normalizeNewsAPI(newsData),
      ...normalizeGNews(gnewsData),
    ];

    // remove invalid items
    combined = combined.filter((item) => item.title && item.url);

    // deduplicate
    const map = new Map();
    combined.forEach((item) => map.set(item.url, item));
    combined = Array.from(map.values());

    // sort latest
    combined.sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() -
        new Date(a.publishedAt).getTime()
    );

    // pagination
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
    return NextResponse.json(
      { error: "Failed to fetch feed" },
      { status: 500 }
    );
  }
}*/

import { NextResponse } from "next/server";
import { z } from "zod";

const ECO_KEYWORDS = [
  "recycle","recycling","waste","renewable energy","solar","climate change",
  "global warming","environment","sustainability","plastic pollution",
  "recycled art","ngo","environmental protection","carbon emission",
  "clean energy","green energy",
];

const buildQuery = () => ECO_KEYWORDS.join(" OR ");

// ---- upstream response schemas ----
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
  title: string; description: string | null; image: string | null;
  url: string; source: string; publishedAt: string;
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const limit = 5;
  const query = buildQuery();

  const newsApiUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&pageSize=50&apiKey=${process.env.NEWSAPI_KEY}`;
  const gnewsUrl = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&max=10&apikey=${process.env.GNEWS_API_KEY}`;

  try {
    const [newsRes, gnewsRes] = await Promise.all([fetch(newsApiUrl), fetch(gnewsUrl)]);
    const [newsJson, gnewsJson] = await Promise.all([newsRes.json(), gnewsRes.json()]);

    let combined: FeedItem[] = [];

    const news = NewsAPISchema.safeParse(newsJson);
    if (news.success && news.data.articles) {
      combined.push(...news.data.articles.map((a) => ({
        title: a.title ?? "", description: a.description, image: a.urlToImage ?? null,
        url: a.url, source: a.source?.name ?? "NewsAPI", publishedAt: a.publishedAt,
      })));
    } else {
      console.error("NewsAPI error/invalid:", news.success ? news.data : news.error.issues, newsJson);
    }

    const gnews = GNewsSchema.safeParse(gnewsJson);
    if (gnews.success && gnews.data.articles) {
      combined.push(...gnews.data.articles.map((a) => ({
        title: a.title, description: a.description, image: a.image ?? null,
        url: a.url, source: a.source?.name ?? "GNews", publishedAt: a.publishedAt,
      })));
    } else {
      console.error("GNews error/invalid:", gnews.success ? gnews.data : gnews.error.issues, gnewsJson);
    }

    combined = combined.filter((i) => i.title && i.url);
    combined = Array.from(new Map(combined.map((i) => [i.url, i])).values());
    combined.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    const start = (page - 1) * limit;
    const paginated = combined.slice(start, start + limit);

    return NextResponse.json({
      page, limit, total: combined.length,
      hasMore: start + limit < combined.length, data: paginated,
    });
  } catch (err) {
    console.error("Feed fetch failed:", err);
    return NextResponse.json({ error: "Failed to fetch feed" }, { status: 500 });
  }
}