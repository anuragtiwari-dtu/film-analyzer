import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { id, name, full } = req.query;
  const apiKey = process.env.OMDB_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: "OMDb API key is not configured",
    });
  }

  if (!id && !name) {
    return res.status(400).json({
      error: "Missing search parameter",
    });
  }

  try {
    // =========================
    // ✅ CASE 1: IMDb ID → FULL MOVIE
    // =========================
    if (id) {
      const response = await fetch(
        `https://www.omdbapi.com/?i=${id}&apikey=${apiKey}&plot=full`,
      );

      const data = await response.json();

      if (data.Response === "False") {
        return res.status(404).json({
          error: data.Error || "Movie not found",
        });
      }

      return res.status(200).json({
        type: "movie",
        movie: data,
      });
    }

    // =========================
    // ✅ CASE 2: NAME SEARCH
    // =========================
    if (name) {
      const searchRes = await fetch(
        `https://www.omdbapi.com/?s=${encodeURIComponent(
          name as string,
        )}&apikey=${apiKey}`,
      );

      const searchData = await searchRes.json();

      if (searchData.Response === "False" || !searchData.Search?.length) {
        return res.status(404).json({
          error: searchData.Error || "Movie not found",
        });
      }

      // =========================
      // ✅ CASE 2A: RETURN LIST (for dropdown)
      // =========================
      if (!full) {
        return res.status(200).json({
          type: "search",
          results: searchData.Search,
        });
      }

      // =========================
      // ✅ CASE 2B: AUTO PICK FIRST MOVIE
      // =========================
      const imdbId = searchData.Search[0].imdbID;

      const movieRes = await fetch(
        `https://www.omdbapi.com/?i=${imdbId}&apikey=${apiKey}&plot=full`,
      );

      const movieData = await movieRes.json();

      if (movieData.Response === "False") {
        return res.status(404).json({
          error: movieData.Error || "Movie not found",
        });
      }

      return res.status(200).json({
        type: "movie",
        movie: movieData,
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: "Failed to fetch movie",
    });
  }
}
