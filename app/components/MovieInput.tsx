"use client";

import { useState, type FormEvent, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface MovieInputProps {
  onAnalyze: (imdbId: string) => void;
  isLoading: boolean;
}

const EXAMPLES = [
  { id: "tt0133093", label: "The Matrix",       year: "1999" },
  { id: "tt0468569", label: "The Dark Knight",  year: "2008" },
  { id: "tt1375666", label: "Inception",        year: "2010" },
  { id: "tt0110912", label: "Pulp Fiction",     year: "1994" },
  { id: "tt0816692", label: "Interstellar",     year: "2014" },
  { id: "tt0245429", label: "Spirited Away",    year: "2001" },
];

export default function MovieInput({ onAnalyze, isLoading }: MovieInputProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validate = (id: string): string | null => {
    if (!id.trim()) return "Please enter an IMDb ID.";
    if (!id.startsWith("tt")) return 'IMDb IDs start with "tt" — e.g. tt0133093';
    if (!/^tt\d{7,8}$/.test(id.trim())) return "Format: tt + 7–8 digits, e.g. tt0133093";
    return null;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const err = validate(value.trim());
    if (err) { setError(err); return; }
    setError("");
    onAnalyze(value.trim());
  };

  const handleExample = (id: string) => {
    setValue(id);
    setError("");
    onAnalyze(id);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Search bar */}
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className={`
          flex gap-0 rounded-xl overflow-hidden
          border transition-all duration-300
          ${focused
            ? "border-imdb-accent shadow-accent bg-imdb-card"
            : "border-imdb-border bg-imdb-card hover:border-[#2a3f5e]"}
        `}>
          {/* Film icon */}
          <div className="flex items-center pl-4 pr-3 text-imdb-muted flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="2.18"/><line x1="7" y1="2" x2="7" y2="22"/>
              <line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/>
              <line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/>
              <line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/>
            </svg>
          </div>

          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => { setValue(e.target.value); if (error) setError(""); }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Enter IMDb ID — e.g. tt0133093"
            disabled={isLoading}
            className="
              flex-1 py-4 pr-3 text-base bg-transparent
              text-imdb-text placeholder-imdb-muted
              font-mono tracking-wide
              focus:outline-none
              disabled:opacity-50 disabled:cursor-not-allowed
            "
            autoComplete="off"
            spellCheck={false}
          />

          {/* Clear button */}
          <AnimatePresence>
            {value && !isLoading && (
              <motion.button
                type="button"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                onClick={() => { setValue(""); setError(""); inputRef.current?.focus(); }}
                className="px-3 text-imdb-muted hover:text-imdb-text transition-colors flex-shrink-0"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </motion.button>
            )}
          </AnimatePresence>

          {/* Divider */}
          <div className="w-px bg-imdb-border my-3 flex-shrink-0" />

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={isLoading || !value.trim()}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="
              flex items-center gap-2 px-6 py-4
              font-semibold text-sm whitespace-nowrap
              bg-imdb-accent text-imdb-bg
              disabled:opacity-40 disabled:cursor-not-allowed
              hover:brightness-110
              transition-all duration-200 flex-shrink-0
            "
          >
            {isLoading ? (
              <>
                <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 12a9 9 0 11-6.219-8.56"/>
                </svg>
                <span className="hidden sm:block">Analyzing…</span>
              </>
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <span className="hidden sm:block">Analyze</span>
              </>
            )}
          </motion.button>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -4, height: 0 }}
              className="mt-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.form>

      {/* Example chips */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-4 flex flex-wrap items-center gap-2"
      >
        <span className="text-[11px] text-imdb-muted uppercase tracking-widest font-semibold">Quick picks:</span>
        {EXAMPLES.map((ex, i) => (
          <motion.button
            key={ex.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.04 }}
            onClick={() => handleExample(ex.id)}
            disabled={isLoading}
            className="
              group flex items-center gap-1.5
              text-xs px-3 py-1.5 rounded-full
              border border-imdb-border text-imdb-dim
              hover:border-imdb-accent/50 hover:text-imdb-accent hover:bg-imdb-accent/5
              disabled:opacity-40 disabled:cursor-not-allowed
              transition-all duration-200
            "
          >
            <span>{ex.label}</span>
            <span className="text-imdb-muted group-hover:text-imdb-accent/60 transition-colors">'{ex.year.slice(2)}</span>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}
