"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface CastListProps { actors: string; plot: string; }

export default function CastList({ actors, plot }: CastListProps) {
  const cast = actors.split(", ").filter(Boolean);
  const [plotExpanded, setPlotExpanded] = useState(false);
  const isLongPlot = plot.length > 220;
  const displayPlot = plotExpanded || !isLongPlot ? plot : plot.slice(0, 220) + "…";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="rounded-2xl border border-imdb-border bg-card-gradient shadow-card p-6 h-full flex flex-col gap-5 relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-imdb-blue/20 to-transparent" />

      {/* Plot */}
      <div>
        <Label icon={<PlotIcon />}>Plot Summary</Label>
        <p className="text-imdb-dim leading-relaxed text-sm mt-3">{displayPlot}</p>
        {isLongPlot && (
          <button
            onClick={() => setPlotExpanded(e => !e)}
            className="mt-2 text-xs text-imdb-accent/70 hover:text-imdb-accent transition-colors font-medium"
          >
            {plotExpanded ? "Show less ↑" : "Read more ↓"}
          </button>
        )}
      </div>

      <div className="h-px bg-imdb-border/60" />

      {/* Cast */}
      <div>
        <Label icon={<CastIcon />}>Cast</Label>
        <div className="grid grid-cols-2 gap-2.5 mt-3">
          {cast.map((name, i) => {
            const hue = (name.charCodeAt(0) * 47 + name.charCodeAt(1) * 13) % 360;
            return (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.06 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-imdb-surface border border-imdb-border/60 card-lift group cursor-default"
              >
                <div
                  className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold transition-transform group-hover:scale-110"
                  style={{
                    background: `hsl(${hue}, 35%, 20%)`,
                    color: `hsl(${hue}, 70%, 65%)`,
                    border: `1px solid hsl(${hue}, 40%, 30%)`,
                  }}
                >
                  {name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-imdb-text font-medium truncate leading-tight">{name}</p>
                  <p className="text-[10px] text-imdb-muted mt-0.5">Actor</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

function Label({ children, icon }: { children: React.ReactNode; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-imdb-accent/70">{icon}</span>
      <p className="text-[10px] font-bold text-imdb-muted uppercase tracking-widest">{children}</p>
    </div>
  );
}

function PlotIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
}
function CastIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}
