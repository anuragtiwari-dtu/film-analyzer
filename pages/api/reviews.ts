import type { NextApiRequest, NextApiResponse } from "next";
import { fetchReviews } from "@/app/lib/fetchReviews";
import { analyzeSentiment } from "@/app/lib/sentimentAnalyzer";
import { fetchMovie } from "@/app/lib/fetchMovie";
import type { ReviewsApiResponse, ApiError } from "@/app/lib/types";

/**
 * GET /api/reviews?id=ttXXXXXXX
 *
 * 3-layer review strategy: TMDb → IMDb scrape → Gemini AI generated.
 * Always returns reviews + sentiment, even for obscure titles.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ReviewsApiResponse | ApiError>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed", code: "METHOD_NOT_ALLOWED" });
  }

  const { id } = req.query;
  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Missing IMDb ID parameter", code: "MISSING_ID" });
  }
  if (!/^tt\d{7,8}$/.test(id)) {
    return res.status(400).json({ error: "Invalid IMDb ID format. Should look like: tt0133093", code: "INVALID_ID_FORMAT" });
  }

  try {
    // Fetch movie metadata in parallel — we need title + rating for AI fallback
    let movieTitle = "";
    let imdbRating = "";
    try {
      const movie = await fetchMovie(id);
      movieTitle = movie.Title;
      imdbRating = movie.imdbRating;
    } catch {
      // Non-fatal — fetchReviews can still work without these
    }

    const { reviews, source } = await fetchReviews(id, movieTitle, imdbRating);
    const sentiment = await analyzeSentiment(reviews);

    return res.status(200).json({
      reviews,
      sentiment,
      totalAnalyzed: reviews.length,
      reviewSource: source,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch reviews";
    if (message.includes("API key")) {
      return res.status(500).json({ error: message, code: "CONFIG_ERROR" });
    }
    return res.status(500).json({ error: message, code: "REVIEWS_ERROR" });
  }
}
