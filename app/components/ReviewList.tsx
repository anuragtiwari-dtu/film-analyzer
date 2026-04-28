"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Review } from "@/app/lib/types";

interface ReviewListProps {
  reviews: Review[];
  source?: "tmdb" | "imdb" | "ai_generated" | null;
}

const SOURCE_CFG = {
  tmdb:         { label: "TMDb Reviews",       color: "#01d277", bg: "rgba(1,210,119,0.08)",   border: "rgba(1,210,119,0.2)"  },
  imdb:         { label: "IMDb Reviews",        color: "#f5c518", bg: "rgba(245,197,24,0.08)", border: "rgba(245,197,24,0.2)" },
  ai_generated: { label: "AI Synthesized",      color: "#818cf8", bg: "rgba(129,140,248,0.08)", border: "rgba(129,140,248,0.2)",
    note: "Reviews unavailable on TMDb/IMDb — Gemini generated these from the movie's rating and metadata." },
};

const SORT_OPTIONS = ["Most Helpful", "Highest Rated", "Lowest Rated"] as const;
type SortOption = typeof SORT_OPTIONS[number];

export default function ReviewList({ reviews, source }: ReviewListProps) {
  const [showAll, setShowAll] = useState(false);
  const [sort, setSort] = useState<SortOption>("Most Helpful");
  const [filter, setFilter] = useState<"All" | "Positive" | "Negative">("All");

  const sourceInfo = source ? SOURCE_CFG[source] : null;

  const sorted = [...reviews].sort((a, b) => {
    if (sort === "Highest Rated") return (b.rating ?? 0) - (a.rating ?? 0);
    if (sort === "Lowest Rated")  return (a.rating ?? 10) - (b.rating ?? 10);
    return 0;
  }).filter(r => {
    if (filter === "Positive") return (r.rating ?? 5) >= 7;
    if (filter === "Negative") return (r.rating ?? 5) <= 4;
    return true;
  });

  const displayed = showAll ? sorted : sorted.slice(0, 6);

  if (reviews.length === 0) {
    return (
      <div className="rounded-2xl border border-imdb-border bg-card-gradient p-8 text-center">
        <div className="text-imdb-muted text-3xl mb-3">🎬</div>
        <p className="text-imdb-text font-medium">No reviews available</p>
        <p className="text-imdb-dim text-sm mt-1">This title has no audience reviews yet.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="rounded-2xl border border-imdb-border bg-card-gradient shadow-card overflow-hidden relative"
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-imdb-blue/20 to-transparent" />

      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-imdb-border/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8899b4" strokeWidth="2" strokeLinecap="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <h3 className="text-sm font-semibold text-imdb-text">Audience Reviews</h3>
              </div>
              <p className="text-[11px] text-imdb-muted mt-0.5">{reviews.length} reviews collected</p>
            </div>
            {sourceInfo && (
              <span className="text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1.5 flex-shrink-0"
                style={{ color: sourceInfo.color, background: sourceInfo.bg, border: `1px solid ${sourceInfo.border}` }}>
                {source === "tmdb" && "🎬"}{source === "imdb" && "⭐"}{source === "ai_generated" && "✦"}
                {sourceInfo.label}
              </span>
            )}
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Filter */}
            <div className="flex rounded-lg overflow-hidden border border-imdb-border text-[11px] font-medium">
              {(["All", "Positive", "Negative"] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 transition-colors ${filter === f
                    ? "bg-imdb-blue text-white"
                    : "bg-imdb-surface text-imdb-dim hover:text-imdb-text"}`}>
                  {f}
                </button>
              ))}
            </div>
            {/* Sort */}
            <select
              value={sort}
              onChange={e => setSort(e.target.value as SortOption)}
              className="text-[11px] bg-imdb-surface border border-imdb-border rounded-lg px-2.5 py-1.5 text-imdb-dim focus:outline-none focus:border-imdb-blue cursor-pointer"
            >
              {SORT_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>

        {/* AI disclaimer */}
        {source === "ai_generated" && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            className="mt-3 p-3 rounded-xl flex gap-2 text-xs"
            style={{ background: "rgba(129,140,248,0.06)", border: "1px solid rgba(129,140,248,0.15)", color: "rgba(129,140,248,0.85)" }}>
            <span className="flex-shrink-0 mt-0.5">ℹ</span>
            <span>{SOURCE_CFG.ai_generated.note}</span>
          </motion.div>
        )}
      </div>

      {/* Review list */}
      <div className="p-5 sm:p-6 space-y-3">
        <AnimatePresence initial={false}>
          {displayed.length === 0 ? (
            <p className="text-imdb-dim text-sm text-center py-8">No reviews match this filter.</p>
          ) : (
            displayed.map((review, i) => <ReviewCard key={review.id} review={review} index={i} />)
          )}
        </AnimatePresence>

        {sorted.length > 6 && (
          <motion.button
            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
            onClick={() => setShowAll(s => !s)}
            className="w-full mt-2 py-3 rounded-xl text-sm font-medium
              text-imdb-dim border border-imdb-border
              hover:border-imdb-accent/30 hover:text-imdb-accent hover:bg-imdb-accent/5
              transition-all duration-200"
          >
            {showAll ? "↑ Show Less" : `↓ Show All ${sorted.length} Reviews`}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

function ReviewCard({ review, index }: { review: Review; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = review.content.length > 280;
  const content = expanded || !isLong ? review.content : review.content.slice(0, 280) + "…";

  const hue = (review.author.charCodeAt(0) * 59 + (review.author.charCodeAt(1) || 0) * 17) % 360;
  const ratingColor = review.rating
    ? review.rating >= 7 ? "#22c55e" : review.rating >= 5 ? "#f5c518" : "#ef4444"
    : "#8899b4";

  // Star fill (out of 5 stars shown for display)
  const stars = review.rating ? Math.round(review.rating / 2) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      className="group p-4 rounded-xl bg-imdb-surface border border-imdb-border/60 card-lift hover:bg-[#162033]"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar */}
          <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold"
            style={{ background: `hsl(${hue},30%,18%)`, color: `hsl(${hue},60%,60%)`, border: `1.5px solid hsl(${hue},35%,28%)` }}>
            {review.author[0]?.toUpperCase() ?? "?"}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-imdb-text truncate">{review.author}</p>
            <p className="text-[10px] text-imdb-muted">{review.date}</p>
          </div>
        </div>

        {/* Rating */}
        {review.rating !== null && (
          <div className="flex-shrink-0 flex flex-col items-end gap-1">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg key={i} width="10" height="10" viewBox="0 0 24 24"
                  fill={stars && i < stars ? ratingColor : "#1e2d45"} stroke="none">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              ))}
            </div>
            <span className="font-mono text-[10px] font-bold" style={{ color: ratingColor }}>
              {review.rating}/10
            </span>
          </div>
        )}
      </div>

      <p className="text-sm text-imdb-dim leading-relaxed">{content}</p>

      {isLong && (
        <button onClick={() => setExpanded(e => !e)}
          className="mt-2 text-[11px] text-imdb-accent/60 hover:text-imdb-accent transition-colors font-medium">
          {expanded ? "Show less ↑" : "Read more ↓"}
        </button>
      )}
    </motion.div>
  );
}
