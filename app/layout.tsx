import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "AI Movie Insight Builder",
  description: "Enter an IMDb ID to get AI-powered audience sentiment analysis and movie insights.",
  openGraph: {
    title: "AI Movie Insight Builder",
    description: "AI-powered movie sentiment analysis from real audience reviews.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
