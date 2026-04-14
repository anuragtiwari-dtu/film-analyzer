import type { NextApiRequest, NextApiResponse } from "next";
import { fetchMovie } from "@/app/lib/fetchMovie";
import type { MovieApiResponse, ApiError } from "@/app/lib/types";

/**
 * GET /api/movie?id=ttXXXXXXX
 *
 * Returns movie details from OMDb for the given IMDb ID.
 * Validates ID format before making the upstream request.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MovieApiResponse | ApiError>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed", code: "METHOD_NOT_ALLOWED" });
  }

  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Missing IMDb ID parameter", code: "MISSING_ID" });
  }

  // Validate IMDb ID format: tt followed by 7-8 digits
  if (!/^tt\d{7,8}$/.test(id)) {
    return res.status(400).json({
      error: "Invalid IMDb ID format. It should look like: tt0133093",
      code: "INVALID_ID_FORMAT",
    });
  }

  try {
    const movie = await fetchMovie(id);
    return res.status(200).json({ movie });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch movie details";

    // Differentiate client vs server errors
    if (message.includes("not found") || message.includes("Movie not found")) {
      return res.status(404).json({ error: message, code: "MOVIE_NOT_FOUND" });
    }

    if (message.includes("API key")) {
      return res.status(500).json({ error: message, code: "CONFIG_ERROR" });
    }

    return res.status(500).json({ error: message, code: "FETCH_ERROR" });
  }
}
