import type { Review, ReviewSource } from "./types";

const MIN_REVIEWS = 5; // minimum before we try the next source

// ─────────────────────────────────────────────────────────────
// Public entry point
// ─────────────────────────────────────────────────────────────

/**
 * Fetches audience reviews using a 3-layer fallback strategy:
 *   1. TMDb API  (fast, structured)
 *   2. IMDb page scrape  (direct HTML parse, no extra API key)
 *   3. Gemini AI synthetic reviews  (guaranteed fallback)
 */
export async function fetchReviews(
  imdbId: string,
  movieTitle = "",
  imdbRating = ""
): Promise<{ reviews: Review[]; source: ReviewSource }> {
  // ── Layer 1: TMDb ─────────────────────────────────────────
  try {
    const tmdbReviews = await fetchFromTMDb(imdbId);
    if (tmdbReviews.length >= MIN_REVIEWS) {
      console.log(`[fetchReviews] TMDb: ${tmdbReviews.length} reviews`);
      return { reviews: tmdbReviews, source: "tmdb" };
    }
    console.log(`[fetchReviews] TMDb only ${tmdbReviews.length}, trying IMDb scrape`);
  } catch (e) {
    console.warn("[fetchReviews] TMDb failed:", e);
  }

  // ── Layer 2: IMDb scrape ──────────────────────────────────
  try {
    const imdbReviews = await scrapeIMDbReviews(imdbId);
    if (imdbReviews.length >= MIN_REVIEWS) {
      console.log(`[fetchReviews] IMDb scrape: ${imdbReviews.length} reviews`);
      return { reviews: imdbReviews, source: "imdb" };
    }
    console.log(`[fetchReviews] IMDb scrape only ${imdbReviews.length}, falling back to AI`);
  } catch (e) {
    console.warn("[fetchReviews] IMDb scrape failed:", e);
  }

  // ── Layer 3: Gemini AI synthetic reviews ─────────────────
  console.log("[fetchReviews] Using AI-generated synthetic reviews");
  const aiReviews = await generateAIReviews(imdbId, movieTitle, imdbRating);
  return { reviews: aiReviews, source: "ai_generated" };
}

// ─────────────────────────────────────────────────────────────
// Layer 1 — TMDb API
// ─────────────────────────────────────────────────────────────

async function fetchFromTMDb(imdbId: string): Promise<Review[]> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) return [];

  const findRes = await fetch(
    `https://api.themoviedb.org/3/find/${encodeURIComponent(imdbId)}?api_key=${apiKey}&external_source=imdb_id`,
    { next: { revalidate: 3600 } }
  );
  if (!findRes.ok) return [];

  const findData = await findRes.json();
  const tmdbId: number | undefined = findData.movie_results?.[0]?.id;
  if (!tmdbId) return [];

  const reviews: Review[] = [];
  for (let page = 1; page <= 3; page++) {
    const res = await fetch(
      `https://api.themoviedb.org/3/movie/${tmdbId}/reviews?api_key=${apiKey}&page=${page}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) break;
    const data = await res.json();
    const results: TMDbReview[] = data.results ?? [];
    if (results.length === 0) break;
    for (const r of results) {
      reviews.push({
        id: r.id,
        author: r.author,
        rating: r.author_details?.rating ?? null,
        content: r.content.trim(),
        date: r.created_at
          ? new Date(r.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
          : "Unknown date",
      });
    }
    if (reviews.length >= 50) break;
  }
  return reviews.slice(0, 50);
}

interface TMDbReview {
  id: string;
  author: string;
  author_details?: { rating?: number | null };
  content: string;
  created_at?: string;
}

// ─────────────────────────────────────────────────────────────
// Layer 2 — IMDb HTML scrape
// ─────────────────────────────────────────────────────────────

async function scrapeIMDbReviews(imdbId: string): Promise<Review[]> {
  const url = `https://www.imdb.com/title/${imdbId}/reviews/_ajax?ref_=undefined&paginationKey=&spoiler=hide&sort=helpfulnessScore&rating=&filter=`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      "Referer": `https://www.imdb.com/title/${imdbId}/reviews/`,
    },
  });

  if (!res.ok) throw new Error(`IMDb returned ${res.status}`);
  const html = await res.text();
  return parseIMDbHTML(html);
}

function parseIMDbHTML(html: string): Review[] {
  const reviews: Review[] = [];
  // Split on review container divs
  const parts = html.split(/class="[^"]*lister-item[^"]*"/i).slice(1);

  for (let i = 0; i < parts.length; i++) {
    const block = parts[i].slice(0, 4000);

    const authorMatch = block.match(/display-name-link[^>]*>\s*<a[^>]*>([^<]+)<\/a>/i);
    const author = authorMatch ? cleanText(authorMatch[1]) : `Viewer ${i + 1}`;

    const ratingMatch = block.match(/rating-other-user-rating[^>]*>[\s\S]*?<span>(\d+)<\/span>/i);
    const rating = ratingMatch ? parseInt(ratingMatch[1], 10) : null;

    const textMatch = block.match(/class="[^"]*text[^"]*"[^>]*>([\s\S]*?)<\/div>/i)
      ?? block.match(/show-more__control[^>]*>([\s\S]*?)<\/div>/i);
    const content = textMatch ? cleanText(textMatch[1]) : "";
    if (content.length < 30) continue;

    const dateMatch = block.match(/review-date[^>]*>([^<]+)</i);
    const date = dateMatch ? cleanText(dateMatch[1]) : "Unknown";

    reviews.push({
      id: `imdb-${i}`,
      author,
      rating: rating && rating >= 1 && rating <= 10 ? rating : null,
      content: content.slice(0, 800),
      date,
    });
  }

  return reviews.slice(0, 30);
}

function cleanText(raw: string): string {
  return raw
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ").trim();
}

// ─────────────────────────────────────────────────────────────
// Layer 3 — Gemini AI synthetic reviews (guaranteed fallback)
// ─────────────────────────────────────────────────────────────

async function generateAIReviews(
  imdbId: string,
  movieTitle: string,
  imdbRating: string
): Promise<Review[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return buildStaticFallback(movieTitle, imdbRating);

  const ratingNum = parseFloat(imdbRating) || 7.0;
  const sentimentHint =
    ratingNum >= 7.5 ? "mostly positive with some balanced criticism"
    : ratingNum >= 6.0 ? "mixed — split between fans and critics"
    : "mostly negative with occasional defenders";

  const prompt = `Generate 20 realistic audience movie reviews for "${movieTitle || imdbId}" (IMDb rating: ${imdbRating}/10).

Overall sentiment should be: ${sentimentHint}.

Return ONLY a valid JSON array, no markdown, no explanation. Each item:
{
  "author": "<realistic username>",
  "rating": <integer 1-10>,
  "content": "<2-4 sentence review, 60-200 words, natural human voice>",
  "date": "<e.g. Mar 2024>"
}

- Vary writing styles: casual, analytical, enthusiastic, critical
- Ratings must be consistent with the review tone
- Reference: acting, plot, pacing, visuals, emotional impact
- Sound genuinely human`;

  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 4000,
        },
      }),
    });

    if (!response.ok) throw new Error(`Gemini ${response.status}`);
    const data = await response.json();
    const raw: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const clean = raw.replace(/```json|```/gi, "").trim();
    const parsed: Array<{ author: string; rating: number; content: string; date: string }> = JSON.parse(clean);

    return parsed.map((r, i) => ({
      id: `ai-${i}`,
      author: r.author,
      rating: typeof r.rating === "number" ? Math.min(10, Math.max(1, r.rating)) : null,
      content: r.content,
      date: r.date,
    }));
  } catch (err) {
    console.error("[fetchReviews] AI generation failed:", err);
    return buildStaticFallback(movieTitle, imdbRating);
  }
}

function buildStaticFallback(title: string, imdbRating: string): Review[] {
  const r = parseFloat(imdbRating) || 7;
  const adj = r >= 7.5 ? "excellent" : r >= 6 ? "solid" : "flawed but interesting";
  return [
    { id: "fb-1", author: "CinemaFan88",    rating: Math.round(r + 0.5), content: `A genuinely ${adj} film. Great pacing and real emotional depth. Worth every minute.`, date: "Jan 2024" },
    { id: "fb-2", author: "MovieBuff_NYC",  rating: Math.round(r),       content: `Impressive production with convincing performances. A few slow patches but the core is strong.`, date: "Feb 2024" },
    { id: "fb-3", author: "CriticalEye",    rating: Math.max(1, Math.round(r - 1)), content: `Had high hopes and the film mostly delivered. The third act felt rushed but the story was compelling.`, date: "Mar 2024" },
    { id: "fb-4", author: "FilmSchoolDrop", rating: Math.round(r + 0.5), content: `Confident direction and beautiful cinematography. This stays with you for days.`, date: "Apr 2024" },
    { id: "fb-5", author: "WeekendWatcher", rating: Math.round(r),       content: `Go in with the right expectations and you'll have a great time. Really enjoyable.`, date: "May 2024" },
  ];
}
