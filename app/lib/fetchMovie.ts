import type { MovieDetails } from "./types";

/**
 * Fetches movie details from the OMDb API.
 * Requires OMDB_API_KEY in environment variables.
 *
 * @param imdbId - IMDb ID string, e.g. "tt0133093"
 * @returns Parsed MovieDetails object
 * @throws Error with human-readable message on failure
 */
export async function fetchMovie(imdbId: string): Promise<MovieDetails> {
  const apiKey = process.env.OMDB_API_KEY;

  if (!apiKey) {
    throw new Error(
      "OMDb API key is not configured. Add OMDB_API_KEY to your .env.local file."
    );
  }

  const url = `https://www.omdbapi.com/?i=${encodeURIComponent(imdbId)}&apikey=${apiKey}&plot=full`;

  let res: Response;
  try {
    res = await fetch(url, { next: { revalidate: 3600 } }); // cache for 1 hour
  } catch (networkError) {
    throw new Error(
      "Network error: Unable to reach the OMDb API. Check your internet connection."
    );
  }

  if (!res.ok) {
    throw new Error(`OMDb API responded with status ${res.status}`);
  }

  const data: MovieDetails = await res.json();

  if (data.Response === "False") {
    throw new Error(data.Error ?? "Movie not found. Please check the IMDb ID.");
  }

  return data;
}
