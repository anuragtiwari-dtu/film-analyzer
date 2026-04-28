"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MovieInput from "@/app/components/MovieInput";
import MovieCard from "@/app/components/MovieCard";
import CastList from "@/app/components/CastList";
import SentimentSummary from "@/app/components/SentimentSummary";
import ReviewList from "@/app/components/ReviewList";
import SkeletonLoader from "@/app/components/SkeletonLoader";
import ErrorDisplay from "@/app/components/ErrorDisplay";
import type { MovieDetails, SentimentResult, Review } from "@/app/lib/types";

interface AppState {
  status: "idle" | "loading" | "success" | "error";
  movie: MovieDetails | null;
  reviews: Review[];
  sentiment: SentimentResult | null;
  totalAnalyzed: number;
  reviewSource: "tmdb" | "imdb" | "ai_generated" | null;
  error: string | null;
}

const INITIAL_STATE: AppState = {
  status: "idle",
  movie: null,
  reviews: [],
  sentiment: null,
  totalAnalyzed: 0,
  reviewSource: null,
  error: null,
};

export default function HomePage() {
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [currentId, setCurrentId] = useState("");

  const analyze = useCallback(async (imdbId: string) => {
    setCurrentId(imdbId);
    setState({ ...INITIAL_STATE, status: "loading" });

    try {
      const isImdb = imdbId.startsWith("tt");

      const movieRes = await fetch(
        isImdb
          ? `/api/movie?id=${imdbId}`
          : `/api/movie?name=${imdbId}&full=true`,
      );

      const movieData = await movieRes.json();

      if (!movieRes.ok) {
        throw new Error(movieData.error ?? "Failed to load movie details.");
      }

      const movie = movieData.movie || movieData.data;
      const actualImdbId = movie?.imdbID;

      if (!actualImdbId) {
        throw new Error("IMDb ID not found");
      }

      const reviewsRes = await fetch(`/api/reviews?id=${actualImdbId}`);

      let reviews: Review[] = [];
      let sentiment: SentimentResult | null = null;
      let totalAnalyzed = 0;
      let reviewSource: AppState["reviewSource"] = null;

      if (reviewsRes.ok) {
        const rd = await reviewsRes.json();
        reviews = rd.reviews ?? [];
        sentiment = rd.sentiment ?? null;
        totalAnalyzed = rd.totalAnalyzed ?? 0;
        reviewSource = rd.reviewSource ?? null;
      }

      setState({
        status: "success",
        movie,
        reviews,
        sentiment,
        totalAnalyzed,
        reviewSource,
        error: null,
      });
    } catch (err) {
      setState({
        ...INITIAL_STATE,
        status: "error",
        error:
          err instanceof Error ? err.message : "An unexpected error occurred.",
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-imdb-bg relative overflow-x-hidden">
      <div className="h-1 w-full bg-accent-gradient" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        {/* HERO */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="pt-20 pb-12 text-center"
        >
          {/* AI badge */}
          <div className="absolute top-6 left-6 bg-yellow-400 text-black text-xs px-2 py-1 rounded font-bold">
            AI
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4">
            <span className="text-imdb-text">FILM</span>{" "}
            <span className="text-yellow-400">ANALYZER</span>
          </h1>

          {/* Subtitle */}
          <p className="text-imdb-dim max-w-xl mx-auto">
            Enter any Movie Name OR IMDb ID to instantly analyze audience
            sentiment, powered by real reviews and AI intelligence.
          </p>
        </motion.div>

        {/* SEARCH */}
        <MovieInput
          onAnalyze={analyze}
          isLoading={state.status === "loading"}
        />

        {/* EMPTY STATE */}
        {state.status === "idle" && (
          <div className="flex flex-col items-center justify-center mt-16 text-center text-imdb-muted">
            <div className="w-12 h-12 border border-imdb-border rounded-md flex items-center justify-center mb-4 opacity-60">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            </div>
            <p className="text-sm">
              Enter an Movie Name OR IMDb ID above to get started
            </p>
          </div>
        )}

        {/* RESULTS */}
        <div className="mt-10">
          <AnimatePresence mode="wait">
            {state.status === "loading" && <SkeletonLoader />}

            {state.status === "error" && (
              <ErrorDisplay
                message={state.error ?? "Something went wrong."}
                onRetry={() => currentId && analyze(currentId)}
              />
            )}

            {state.status === "success" && state.movie && (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <MovieCard movie={state.movie} />

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                  <div className="lg:col-span-3">
                    <CastList
                      actors={state.movie.Actors}
                      plot={state.movie.Plot}
                    />
                  </div>

                  <div className="lg:col-span-2">
                    {state.sentiment && (
                      <SentimentSummary
                        sentiment={state.sentiment}
                        totalAnalyzed={state.totalAnalyzed}
                        reviewSource={state.reviewSource}
                      />
                    )}
                  </div>
                </div>

                <ReviewList
                  reviews={state.reviews}
                  source={state.reviewSource}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* FOOTER */}
        <div className="mt-20 pb-6 text-xs text-imdb-muted text-center">
          Movie data · OMDb API · Reviews · TMDB API · AI · Gemini
        </div>
      </div>
    </div>
  );
}
