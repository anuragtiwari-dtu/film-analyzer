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
  status: "idle", movie: null, reviews: [], sentiment: null,
  totalAnalyzed: 0, reviewSource: null, error: null,
};

export default function HomePage() {
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [currentId, setCurrentId] = useState("");

  const analyze = useCallback(async (imdbId: string) => {
    setCurrentId(imdbId);
    setState({ ...INITIAL_STATE, status: "loading" });
    try {
      const [movieRes, reviewsRes] = await Promise.all([
        fetch(`/api/movie?id=${imdbId}`),
        fetch(`/api/reviews?id=${imdbId}`),
      ]);
      const movieData = await movieRes.json();
      if (!movieRes.ok) throw new Error(movieData.error ?? "Failed to load movie details.");

      let reviews: Review[] = [], sentiment: SentimentResult | null = null;
      let totalAnalyzed = 0, reviewSource: AppState["reviewSource"] = null;
      if (reviewsRes.ok) {
        const rd = await reviewsRes.json();
        reviews = rd.reviews ?? []; sentiment = rd.sentiment ?? null;
        totalAnalyzed = rd.totalAnalyzed ?? 0; reviewSource = rd.reviewSource ?? null;
      }
      setState({ status: "success", movie: movieData.movie, reviews, sentiment, totalAnalyzed, reviewSource, error: null });
    } catch (err) {
      setState({ ...INITIAL_STATE, status: "error", error: err instanceof Error ? err.message : "An unexpected error occurred." });
    }
  }, []);

  return (
    <div className="min-h-screen bg-imdb-bg relative overflow-x-hidden">
      {/* Cinematic top bar — IMDb yellow stripe */}
      <div className="h-1 w-full bg-accent-gradient" />

      {/* Background depth layers */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(59,130,246,0.07),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_30%_at_80%_70%,rgba(13,27,46,0.8),transparent)]" />
        {/* Film grain */}
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")` }} />
      </div>

      {/* Nav bar */}
      <nav className="relative z-20 border-b border-imdb-border/50 bg-imdb-navy/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* IMDb-style logo block (icon only, no text label) */}
            <div className="bg-imdb-accent rounded px-2 py-0.5">
              <span className="font-display text-lg font-800 text-imdb-bg tracking-wider leading-none">AI</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="pt-12 pb-10 text-center"
        >
          {/* Removed legacy "Powered by Claude AI" pill */}

          <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl font-800 tracking-wide leading-none mb-4">
            <span className="text-imdb-text">MOVIE </span>
            <span className="text-imdb-accent" style={{ textShadow: "0 0 40px rgba(245,197,24,0.3)" }}>INSIGHT</span>
          </h1>
          <p className="text-imdb-dim text-base sm:text-lg max-w-xl mx-auto leading-relaxed font-light">
            Enter any IMDb ID to instantly analyze audience sentiment,<br className="hidden sm:block" />
            powered by real reviews and AI intelligence.
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="pb-12"
        >
          <MovieInput onAnalyze={analyze} isLoading={state.status === "loading"} />
        </motion.div>

        {/* Results */}
        <div className="pb-16">
          <AnimatePresence mode="wait">
            {state.status === "loading" && (
              <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <SkeletonLoader />
              </motion.div>
            )}
            {state.status === "error" && (
              <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ErrorDisplay message={state.error ?? "Something went wrong."} onRetry={() => currentId && analyze(currentId)} />
              </motion.div>
            )}
            {state.status === "success" && state.movie && (
              <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
                <MovieCard movie={state.movie} />
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                  <div className="lg:col-span-3"><CastList actors={state.movie.Actors} plot={state.movie.Plot} /></div>
                  <div className="lg:col-span-2">
                    {state.sentiment && (
                      <SentimentSummary sentiment={state.sentiment} totalAnalyzed={state.totalAnalyzed} reviewSource={state.reviewSource} />
                    )}
                  </div>
                </div>
                <ReviewList reviews={state.reviews} source={state.reviewSource} />
              </motion.div>
            )}
            {state.status === "idle" && (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-center py-16">
                <div className="inline-flex flex-col items-center gap-4 opacity-40">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#8899b4" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="2.18"/><line x1="7" y1="2" x2="7" y2="22"/>
                    <line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/>
                    <line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/>
                    <line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/>
                  </svg>
                  <p className="text-imdb-dim text-sm">Enter an IMDb ID above to get started</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-imdb-border/40 bg-imdb-navy/60 backdrop-blur-sm py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-imdb-muted">
          <span>Movie data · OMDb API &nbsp;·&nbsp; Reviews · TMDb API &nbsp;·&nbsp; AI · Gemini</span>
          <span>Built with Next.js · Tailwind · Framer Motion</span>
        </div>
      </footer>
    </div>
  );
}
