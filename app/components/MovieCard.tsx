"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import type { MovieDetails } from "@/app/lib/types";

interface MovieCardProps {
  movie: MovieDetails;
}

export default function MovieCard({ movie }: MovieCardProps) {
  const hasPoster = movie.Poster && movie.Poster !== "N/A";

  const rating = parseFloat(movie.imdbRating || "0") || 0;
  const ratingColor =
    rating >= 7.5 ? "#22c55e" : rating >= 6 ? "#f5c518" : "#ef4444";

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
      <div className="flex flex-col sm:flex-row">
        {/* Poster */}
        <div className="relative sm:w-56 w-full h-80 sm:h-auto bg-imdb-navy">
          {hasPoster ? (
            <Image
              src={movie.Poster}
              alt={movie.Title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-imdb-muted">
              No Poster
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 p-6 space-y-4">
          {/* Genre */}
          <div className="flex flex-wrap gap-2">
            {movie.Genre?.split(", ")
              .slice(0, 3)
              .map((g) => (
                <span key={g} className="pill">
                  {g}
                </span>
              ))}
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold">{movie.Title}</h2>

          {/* ❌ REMOVED PLOT FROM HERE */}

          {/* Meta */}
          <div className="text-sm text-gray-400 flex gap-2 flex-wrap">
            <span>{movie.Runtime}</span>

            {movie.Language?.split(",")[0] && (
              <span>• {movie.Language.split(",")[0]}</span>
            )}

            {movie.Country?.split(",")[0] && (
              <span>• {movie.Country.split(",")[0]}</span>
            )}
          </div>

          {/* Bottom */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-700">
            <div>
              <p className="text-xs text-gray-500">Director</p>
              <p>{movie.Director || "N/A"}</p>
            </div>

            {/* Rating */}
            {movie.imdbRating !== "N/A" && (
              <div className="relative w-16 h-16">
                <svg viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    stroke="#1e2d45"
                    strokeWidth="6"
                    fill="none"
                  />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r={radius}
                    stroke={ratingColor}
                    strokeWidth="6"
                    fill="none"
                    strokeDasharray={circumference}
                    animate={{ strokeDashoffset: dashOffset }}
                  />
                </svg>

                <div className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                  {rating}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
