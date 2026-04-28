"use client";

import { motion } from "framer-motion";
import type { SentimentResult } from "@/app/lib/types";

interface SentimentSummaryProps {
  sentiment: SentimentResult;
  totalAnalyzed: number;
  reviewSource?: "tmdb" | "imdb" | "ai_generated" | null;
}

const CFG = {
  Positive: { color: "#22c55e", bg: "rgba(34,197,94,0.08)",  border: "rgba(34,197,94,0.2)",  glow: "rgba(34,197,94,0.15)",  label: "Positive", emoji: "🟢" },
  Mixed:    { color: "#f5c518", bg: "rgba(245,197,24,0.08)", border: "rgba(245,197,24,0.2)", glow: "rgba(245,197,24,0.15)", label: "Mixed",    emoji: "🟡" },
  Negative: { color: "#ef4444", bg: "rgba(239,68,68,0.08)",  border: "rgba(239,68,68,0.2)",  glow: "rgba(239,68,68,0.15)",  label: "Negative", emoji: "🔴" },
};

export default function SentimentSummary({ sentiment, totalAnalyzed, reviewSource }: SentimentSummaryProps) {
  const cfg = CFG[sentiment.label];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="rounded-2xl border border-imdb-border bg-card-gradient shadow-card p-6 h-full flex flex-col gap-5 relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-imdb-accent/20 to-transparent" />

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f5c518" strokeWidth="2" strokeLinecap="round" opacity="0.7">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            <p className="text-[10px] font-bold text-imdb-muted uppercase tracking-widest">AI Sentiment</p>
          </div>
          <h3 className="text-lg font-semibold text-imdb-text">Audience Analysis</h3>
          {totalAnalyzed > 0 && (
            <p className="text-[11px] text-imdb-muted mt-0.5">
              {totalAnalyzed} {reviewSource === "ai_generated" ? "synthesized" : "real"} reviews
            </p>
          )}
        </div>

        {/* Big sentiment badge */}
        <motion.div
          initial={{ scale: 0.4, opacity: 0, rotate: -10 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 250, damping: 16 }}
          style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color, boxShadow: `0 0 20px ${cfg.glow}` }}
          className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"
        >
          <span className="text-base">{cfg.emoji}</span>
          <span>{cfg.label}</span>
        </motion.div>
      </div>

      {/* Score arc — big visual */}
      <div className="flex items-center gap-4 py-2">
        <ScoreDonut score={sentiment.score} color={cfg.color} />
        <div className="flex-1 space-y-2.5">
          <Bar label="Positive" val={sentiment.breakdown.positive} color="#22c55e" delay={0.2} />
          <Bar label="Neutral"  val={sentiment.breakdown.neutral}  color="#8899b4" delay={0.3} />
          <Bar label="Negative" val={sentiment.breakdown.negative} color="#ef4444" delay={0.4} />
        </div>
      </div>

      {/* AI Summary box */}
      <div className="rounded-xl bg-imdb-surface border border-imdb-border/60 p-4">
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-imdb-accent text-xs">✦</span>
          <p className="text-[10px] font-bold text-imdb-muted uppercase tracking-widest">AI Summary</p>
        </div>
        <p className="text-xs text-imdb-dim leading-relaxed">{sentiment.summary}</p>
      </div>

      {/* Key themes */}
      {sentiment.keyThemes.length > 0 && (
        <div>
          <p className="text-[10px] font-bold text-imdb-muted uppercase tracking-widest mb-2.5">Key Themes</p>
          <div className="flex flex-wrap gap-1.5">
            {sentiment.keyThemes.map((theme, i) => (
              <motion.span
                key={theme}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.25 + i * 0.05 }}
                className="text-[11px] px-2.5 py-1 rounded-full bg-imdb-navy border border-imdb-border text-imdb-dim hover:border-imdb-accent/30 hover:text-imdb-accent/80 transition-colors cursor-default"
              >
                {theme}
              </motion.span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

function ScoreDonut({ score, color }: { score: number; color: string }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(Math.max(score, 0), 1);
  return (
    <div className="relative w-16 h-16 flex-shrink-0">
      <svg width="64" height="64" viewBox="0 0 64 64" className="-rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" stroke="#1e2d45" strokeWidth="5"/>
        <motion.circle cx="32" cy="32" r={r} fill="none" stroke={color} strokeWidth="5"
          strokeLinecap="round" strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ * (1 - pct) }}
          transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span style={{ color }} className="font-mono font-bold text-sm leading-none">
          {Math.round(pct * 100)}%
        </span>
      </div>
    </div>
  );
}

function Bar({ label, val, color, delay }: { label: string; val: number; color: string; delay: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-imdb-muted w-12 flex-shrink-0 font-medium">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-imdb-navy overflow-hidden">
        <motion.div
          initial={{ width: 0 }} animate={{ width: `${val}%` }}
          transition={{ duration: 0.8, delay, ease: "easeOut" }}
          style={{ background: color }} className="h-full rounded-full"
        />
      </div>
      <span className="text-[10px] font-mono text-imdb-dim w-7 text-right">{val}%</span>
    </div>
  );
}
