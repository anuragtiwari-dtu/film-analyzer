import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Barlow Condensed'", "sans-serif"],
        body:    ["'Outfit'", "sans-serif"],
        mono:    ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        imdb: {
          bg:      "#0b0f1a",
          surface: "#111827",
          card:    "#141d2e",
          border:  "#1e2d45",
          navy:    "#0d1b2e",
          accent:  "#f5c518",
          blue:    "#3b82f6",
          muted:   "#4a6080",
          text:    "#e8edf5",
          dim:     "#8899b4",
        },
      },
      backgroundImage: {
        "navy-gradient": "linear-gradient(135deg, #0d1b2e 0%, #111827 100%)",
        "accent-gradient": "linear-gradient(135deg, #f5c518 0%, #e8a820 100%)",
        "blue-gradient": "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
        "card-gradient": "linear-gradient(145deg, #141d2e 0%, #0f1724 100%)",
      },
      boxShadow: {
        "card": "0 4px 24px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.04) inset",
        "card-hover": "0 8px 40px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.06) inset",
        "accent": "0 0 20px rgba(245,197,24,0.25)",
        "blue": "0 0 20px rgba(59,130,246,0.25)",
        "glow": "0 0 40px rgba(245,197,24,0.1)",
      },
      animation: {
        shimmer:    "shimmer 1.6s ease-in-out infinite",
        "fade-up":  "fadeUp 0.5s ease-out forwards",
        "spin-slow": "spin 2s linear infinite",
      },
      keyframes: {
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition:  "200% 0" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
