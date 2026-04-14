"use client";

import { motion } from "framer-motion";

interface ErrorDisplayProps { message: string; onRetry?: () => void; }

export default function ErrorDisplay({ message, onRetry }: ErrorDisplayProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl border border-red-500/20 bg-card-gradient p-10 text-center space-y-5"
    >
      <div className="relative inline-block">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-imdb-text text-lg mb-2">Unable to load movie</h3>
        <p className="text-sm text-imdb-dim max-w-sm mx-auto leading-relaxed">{message}</p>
      </div>

      <div className="flex flex-wrap gap-3 justify-center">
        {onRetry && (
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={onRetry}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-red-500/10 text-red-400 border border-red-500/25 hover:bg-red-500/20 transition-colors"
          >
            Try Again
          </motion.button>
        )}
        <a href="https://www.imdb.com/search/title/" target="_blank" rel="noopener noreferrer"
          className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-imdb-surface text-imdb-dim border border-imdb-border hover:border-imdb-blue/40 hover:text-imdb-blue transition-colors">
          Find IMDb ID ↗
        </a>
      </div>

      <p className="text-xs text-imdb-muted">
        Tip: IMDb IDs look like <code className="font-mono bg-imdb-surface px-1.5 py-0.5 rounded text-imdb-accent/80">tt0133093</code> — find them in any IMDb movie URL.
      </p>
    </motion.div>
  );
}
