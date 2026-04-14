import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock fetch for Gemini API ───────────────────────────────
vi.stubGlobal("fetch", vi.fn());

// ─── Sentiment Analyzer Tests ─────────────────────────────────
describe("sentimentAnalyzer – heuristic fallback", () => {
  // We test the exported heuristic logic by providing known review data
  // These tests run without network calls.

  const positiveReviews = [
    { id: "1", author: "Alice", rating: 9, content: "Amazing and wonderful film, loved every moment. Brilliant masterpiece.", date: "2024-01-01" },
    { id: "2", author: "Bob", rating: 8, content: "Excellent direction, great performances. Highly recommend this outstanding movie.", date: "2024-01-01" },
    { id: "3", author: "Carol", rating: 10, content: "A beautiful and incredible cinematic experience. Best movie of the decade.", date: "2024-01-01" },
  ];

  const negativeReviews = [
    { id: "4", author: "Dave", rating: 2, content: "Terrible and awful. Worst film I have seen. A complete waste of time.", date: "2024-01-01" },
    { id: "5", author: "Eve", rating: 1, content: "Boring and disappointing. Hated the dull plot and stupid characters.", date: "2024-01-01" },
    { id: "6", author: "Frank", rating: 3, content: "Mediocre at best. Bad script and poor execution, very disappointing.", date: "2024-01-01" },
  ];

  it("classifies overwhelmingly positive reviews correctly", async () => {
    // Bypass AI by not setting GEMINI_API_KEY (handled by heuristic)
    process.env.GEMINI_API_KEY = "";
    const { analyzeSentiment } = await import("../app/lib/sentimentAnalyzer");
    const result = await analyzeSentiment(positiveReviews);
    expect(result.label).toBe("Positive");
    expect(result.score).toBeGreaterThan(0.5);
    expect(result.breakdown.positive).toBeGreaterThan(result.breakdown.negative);
  });

  it("classifies overwhelmingly negative reviews correctly", async () => {
    process.env.GEMINI_API_KEY = "";
    const { analyzeSentiment } = await import("../app/lib/sentimentAnalyzer");
    const result = await analyzeSentiment(negativeReviews);
    expect(result.label).toBe("Negative");
    expect(result.score).toBeLessThan(0.5);
    expect(result.breakdown.negative).toBeGreaterThan(result.breakdown.positive);
  });

  it("returns Mixed/fallback for empty reviews", async () => {
    process.env.GEMINI_API_KEY = "";
    const { analyzeSentiment } = await import("../app/lib/sentimentAnalyzer");
    const result = await analyzeSentiment([]);
    expect(result.label).toBeDefined();
    expect(["Positive", "Mixed", "Negative"]).toContain(result.label);
    expect(typeof result.summary).toBe("string");
  });

  it("breakdown always sums to 100", async () => {
    process.env.GEMINI_API_KEY = "";
    const { analyzeSentiment } = await import("../app/lib/sentimentAnalyzer");
    const result = await analyzeSentiment([...positiveReviews, ...negativeReviews]);
    const total = result.breakdown.positive + result.breakdown.neutral + result.breakdown.negative;
    expect(total).toBe(100);
  });

  it("always returns required fields", async () => {
    process.env.GEMINI_API_KEY = "";
    const { analyzeSentiment } = await import("../app/lib/sentimentAnalyzer");
    const result = await analyzeSentiment(positiveReviews);
    expect(result).toHaveProperty("label");
    expect(result).toHaveProperty("score");
    expect(result).toHaveProperty("summary");
    expect(result).toHaveProperty("breakdown");
    expect(result).toHaveProperty("keyThemes");
    expect(Array.isArray(result.keyThemes)).toBe(true);
  });
});

// ─── IMDb ID Validation Tests ─────────────────────────────────
describe("IMDb ID validation", () => {
  const isValidImdbId = (id: string) => /^tt\d{7,8}$/.test(id);

  it("accepts valid 7-digit ID", () => {
    expect(isValidImdbId("tt0133093")).toBe(true);
  });

  it("accepts valid 8-digit ID", () => {
    expect(isValidImdbId("tt10048532")).toBe(true);
  });

  it("rejects ID without tt prefix", () => {
    expect(isValidImdbId("0133093")).toBe(false);
  });

  it("rejects ID with only letters", () => {
    expect(isValidImdbId("ttabcdefg")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isValidImdbId("")).toBe(false);
  });

  it("rejects too-short numeric part", () => {
    expect(isValidImdbId("tt01330")).toBe(false);
  });

  it("rejects too-long numeric part", () => {
    expect(isValidImdbId("tt013309312")).toBe(false);
  });
});

// ─── SentimentResult structure tests ─────────────────────────
describe("SentimentResult structure", () => {
  it("score is always between 0 and 1", async () => {
    process.env.GEMINI_API_KEY = "";
    const { analyzeSentiment } = await import("../app/lib/sentimentAnalyzer");
    const reviews = [
      { id: "1", author: "A", rating: 7, content: "Good film overall", date: "" },
    ];
    const result = await analyzeSentiment(reviews);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(1);
  });

  it("label matches score thresholds", async () => {
    process.env.GEMINI_API_KEY = "";
    const { analyzeSentiment } = await import("../app/lib/sentimentAnalyzer");
    const reviews = [
      { id: "1", author: "A", rating: 9, content: "Amazing wonderful perfect gem classic loved best excellent", date: "" },
      { id: "2", author: "B", rating: 8, content: "Great outstanding beautiful incredible superb brilliant", date: "" },
    ];
    const result = await analyzeSentiment(reviews);
    if (result.score >= 0.6) expect(result.label).toBe("Positive");
    else if (result.score >= 0.35) expect(result.label).toBe("Mixed");
    else expect(result.label).toBe("Negative");
  });
});
