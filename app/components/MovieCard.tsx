"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import type { MovieDetails } from "@/app/lib/types";

interface MovieCardProps { movie: MovieDetails; }

export default function MovieCard({ movie }: MovieCardProps) {
  const hasPoster = movie.Poster && movie.Poster !== "N/A";
  const rating = parseFloat(movie.imdbRating);
  const ratingColor = rating >= 7.5 ? "#22c55e" : rating >= 6 ? "#f5c518" : "#ef4444";

  // Circular rating progress (SVG ring)
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const ratingPct = Math.min(rating / 10, 1);
  const dashOffset = circumference * (1 - ratingPct);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="rounded-2xl overflow-hidden border border-imdb-border shadow-card bg-card-gradient relative"
    >
      {/* Subtle top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-imdb-accent/30 to-transparent" />

      <div className="flex flex-col sm:flex-row">
        {/* Poster */}
        <div className="relative sm:w-56 w-full h-80 sm:h-auto flex-shrink-0 bg-imdb-navy overflow-hidden">
          {hasPoster ? (
            <>
              <Image
                src={movie.Poster}
                alt={`${movie.Title} poster`}
                fill
                className="object-cover poster-reveal"
                sizes="(max-width: 640px) 100vw, 224px"
                priority
              />
              {/* Subtle right-side gradient to blend into card */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-imdb-card/40 hidden sm:block" />
              {/* Mobile bottom gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-imdb-card via-transparent to-transparent sm:hidden" />
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-imdb-muted">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <rect x="2" y="2" width="20" height="20" rx="2.18"/><line x1="7" y1="2" x2="7" y2="22"/>
                <line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/>
              </svg>
              <span className="text-xs">No Poster</span>
            </div>
          )}
        </div>

        {/* Info panel */}
        <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between gap-5 min-w-0">
          {/* Top section */}
          <div>
            {/* Genre + Year + Rating pill row */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {movie.Genre.split(", ").slice(0, 3).map((g) => (
                <span key={g} className="pill bg-imdb-blue/10 border border-imdb-blue/20 text-imdb-blue">
                  {g}
                </span>
              ))}
              <span className="pill bg-imdb-surface border border-imdb-border text-imdb-dim">{movie.Year}</span>
              {movie.Rated && movie.Rated !== "N/A" && (
                <span className="pill bg-imdb-surface border border-imdb-border text-imdb-dim">{movie.Rated}</span>
              )}
            </div>

            {/* Title */}
            <h2 className="font-display font-800 text-4xl sm:text-5xl lg:text-6xl text-imdb-text leading-none tracking-wide mb-3">
              {movie.Title}
            </h2>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-imdb-dim">
              <span>{movie.Runtime}</span>
              {movie.Language && movie.Language !== "N/A" && (
                <><span className="text-imdb-border">·</span><span>{movie.Language.split(",")[0]}</span></>
              )}
              {movie.Country && movie.Country !== "N/A" && (
                <><span className="text-imdb-border">·</span><span>{movie.Country.split(",")[0]}</span></>
              )}
              {movie.Awards && movie.Awards !== "N/A" && !movie.Awards.startsWith("N/A") && (
                <><span className="text-imdb-border">·</span>
                <span className="text-imdb-accent/80 flex items-center gap-1">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
                  {movie.Awards.split(".")[0]}
                </span></>
              )}
            </div>
          </div>

          {/* Bottom: Director + Rating ring */}
          <div className="flex items-end justify-between gap-4 pt-5 border-t border-imdb-border/60">
            <div className="space-y-3">
              <div>
                <p className="text-[10px] text-imdb-muted uppercase tracking-widest font-semibold mb-0.5">Director</p>
                <p className="text-imdb-text font-medium text-sm">{movie.Director}</p>
              </div>
              {movie.BoxOffice && movie.BoxOffice !== "N/A" && (
                <div>
                  <p className="text-[10px] text-imdb-muted uppercase tracking-widest font-semibold mb-0.5">Box Office</p>
                  <p className="text-imdb-text font-medium text-sm">{movie.BoxOffice}</p>
                </div>
              )}
            </div>

            {/* IMDb-style rating with SVG ring */}
            {movie.imdbRating !== "N/A" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                className="flex flex-col items-center gap-1 flex-shrink-0"
              >
                <div className="relative w-20 h-20">
                  <svg width="80" height="80" viewBox="0 0 100 100" className="-rotate-90">
                    {/* Track */}
                    <circle cx="50" cy="50" r={radius} fill="none" stroke="#1e2d45" strokeWidth="6" />
                    {/* Progress */}
                    <motion.circle
                      cx="50" cy="50" r={radius} fill="none"
                      stroke={ratingColor} strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      initial={{ strokeDashoffset: circumference }}
                      animate={{ strokeDashoffset: dashOffset }}
                      transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                    />
                  </svg>
                  {/* Rating text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span style={{ color: ratingColor }} className="font-mono font-bold text-xl leading-none">
                      {movie.imdbRating}
                    </span>
                    <span className="text-imdb-muted text-[9px] font-semibold uppercase tracking-wider mt-0.5">/ 10</span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-1 justify-center">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="#f5c518"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
                    <span className="text-[10px] text-imdb-muted">IMDb</span>
                  </div>
                  <p className="text-[9px] text-imdb-muted mt-0.5">{Number(movie.imdbVotes).toLocaleString()} votes</p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
