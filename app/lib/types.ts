// ─── Movie Data ───────────────────────────────────────────────
export interface MovieDetails {
  imdbID: string;
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Language: string;
  Country: string;
  Awards: string;
  Poster: string;
  imdbRating: string;
  imdbVotes: string;
  Type: string;
  BoxOffice?: string;
  Response: string;
  Error?: string;
}

// ─── Review ───────────────────────────────────────────────────
export interface Review {
  id: string;
  author: string;
  rating: number | null;
  content: string;
  date: string;
  helpful?: number;
}

export type ReviewSource = "tmdb" | "imdb" | "ai_generated";

// ─── Sentiment ────────────────────────────────────────────────
export type SentimentLabel = "Positive" | "Mixed" | "Negative";

export interface SentimentResult {
  label: SentimentLabel;
  score: number; // 0–1, higher = more positive
  summary: string;
  breakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
  keyThemes: string[];
}

// ─── API Responses ────────────────────────────────────────────
export interface MovieApiResponse {
  movie: MovieDetails;
}

export interface ReviewsApiResponse {
  reviews: Review[];
  sentiment: SentimentResult;
  totalAnalyzed: number;
  reviewSource: ReviewSource;
}

export interface ApiError {
  error: string;
  code?: string;
}
