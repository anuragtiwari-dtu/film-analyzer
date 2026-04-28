import type { MovieDetails } from "./types";

/**
 * Fetch movie by IMDb ID (existing function)
 */
export async function fetchMovie(imdbId: string): Promise<MovieDetails> {
  const apiKey = process.env.OMDB_API_KEY;

  if (!apiKey) {
    throw new Error(
      "OMDb API key is not configured. Add OMDB_API_KEY to your .env.local file.",
    );
  }

  const url = `https://www.omdbapi.com/?i=${encodeURIComponent(
    imdbId,
  )}&apikey=${apiKey}&plot=full`;

  let res: Response;

  try {
    res = await fetch(url, { next: { revalidate: 3600 } });
  } catch {
    throw new Error(
      "Network error: Unable to reach the OMDb API. Check your internet connection.",
    );
  }

  if (!res.ok) {
    throw new Error(`OMDb API responded with status ${res.status}`);
  }

  const data: MovieDetails = await res.json();

  if (data.Response === "False") {
    throw new Error(data.Error ?? "Movie not found.");
  }

  return data;
}

/**
 * 🔥 NEW: Fetch movie by NAME
 */
export async function fetchMovieByName(name: string): Promise<MovieDetails> {
  const apiKey = process.env.OMDB_API_KEY;

  if (!apiKey) {
    throw new Error(
      "OMDb API key is not configured. Add OMDB_API_KEY to your .env.local file.",
    );
  }

  // 🔹 Step 1: Search movie by name
  const searchUrl = `https://www.omdbapi.com/?s=${encodeURIComponent(
    name,
  )}&apikey=${apiKey}`;

  let searchRes: Response;

  try {
    searchRes = await fetch(searchUrl);
  } catch {
    throw new Error("Network error while searching movie.");
  }

  if (!searchRes.ok) {
    throw new Error(`Search API failed with ${searchRes.status}`);
  }

  const searchData = await searchRes.json();

  if (!searchData.Search || searchData.Search.length === 0) {
    throw new Error("No movie found with this name.");
  }

  // 🔹 Step 2: Take first result
  const imdbID = searchData.Search[0].imdbID;

  // 🔹 Step 3: Fetch full details using existing function
  return fetchMovie(imdbID);
}
