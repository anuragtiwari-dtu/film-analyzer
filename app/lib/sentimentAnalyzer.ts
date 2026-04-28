import type { Review, SentimentResult, SentimentLabel } from "./types";

/**
 * Analyzes audience reviews using Gemini via the Google Generative Language API.
 *
 * Falls back to a lexical heuristic scorer if the AI call fails or if
 * GEMINI_API_KEY is not set — so the app is always functional.
 *
 * @param reviews - Array of Review objects from fetchReviews
 * @returns SentimentResult with label, score, summary, breakdown, and themes
 */
export async function analyzeSentiment(
  reviews: Review[]
): Promise<SentimentResult> {
  if (reviews.length === 0) {
    return buildFallbackResult([], "No audience reviews available to analyze.");
  }

  // Prepare a compact text block for the AI (max ~3000 tokens)
  const reviewTexts = reviews
    .slice(0, 25)
    .map((r, i) => `Review ${i + 1} (Rating: ${r.rating ?? "N/A"}/10):\n${r.content.slice(0, 300)}`)
    .join("\n\n---\n\n");

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn("[sentimentAnalyzer] GEMINI_API_KEY not set — using heuristic fallback.");
    return heuristicAnalysis(reviews);
  }

  try {
    const prompt = `You are a professional film critic and sentiment analyst.

Analyze the following audience reviews for a movie and respond ONLY with a valid JSON object (no markdown, no preamble).

Reviews:
${reviewTexts}

Return this exact JSON structure:
{
  "label": "Positive" | "Mixed" | "Negative",
  "score": <float 0.0 to 1.0, where 1.0 = overwhelmingly positive>,
  "summary": "<3-5 sentence paragraph summarizing overall audience sentiment>",
  "breakdown": {
    "positive": <integer percentage 0-100>,
    "neutral": <integer percentage 0-100>,
    "negative": <integer percentage 0-100>
  },
  "keyThemes": ["<theme1>", "<theme2>", "<theme3>", "<theme4>", "<theme5>"]
}

Rules:
- breakdown percentages must sum to 100
- keyThemes must be 3-6 short phrases (2-4 words each) extracted from what reviewers mention most
- summary must be written from the audience perspective, not yours`;

    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 800,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const rawText: string =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    // Strip any accidental markdown fences
    const clean = rawText.replace(/```json|```/gi, "").trim();
    const parsed = JSON.parse(clean) as SentimentResult;

    // Validate the structure
    if (!parsed.label || !parsed.summary || !parsed.breakdown) {
      throw new Error("Invalid response shape from AI");
    }

    return parsed;
  } catch (err) {
    console.error("[sentimentAnalyzer] AI analysis failed, using heuristic:", err);
    return heuristicAnalysis(reviews);
  }
}

// ─── Heuristic fallback ───────────────────────────────────────

const POSITIVE_WORDS = new Set([
  "great", "excellent", "amazing", "wonderful", "fantastic", "brilliant",
  "masterpiece", "loved", "love", "best", "perfect", "beautiful", "incredible",
  "outstanding", "superb", "enjoy", "enjoyed", "recommend", "stunning",
  "powerful", "moving", "compelling", "riveting", "classic", "gem",
]);

const NEGATIVE_WORDS = new Set([
  "bad", "terrible", "awful", "boring", "worst", "disappointing",
  "disappoints", "hate", "hated", "poor", "waste", "slow", "stupid",
  "ridiculous", "mediocre", "dull", "failed", "overrated", "weak", "bland",
]);

function heuristicAnalysis(reviews: Review[]): SentimentResult {
  let positiveCount = 0;
  let negativeCount = 0;

  for (const review of reviews) {
    const tokens = review.content.toLowerCase().replace(/[^a-z\s]/g, " ").split(/\s+/);
    let pos = tokens.filter((t) => POSITIVE_WORDS.has(t)).length;
    let neg = tokens.filter((t) => NEGATIVE_WORDS.has(t)).length;

    // Boost from numeric rating
    if (review.rating !== null) {
      if (review.rating >= 7) pos += 2;
      else if (review.rating <= 4) neg += 2;
    }

    if (pos > neg) positiveCount++;
    else if (neg > pos) negativeCount++;
  }

  const total = reviews.length;
  const posPercent = Math.round((positiveCount / total) * 100);
  const negPercent = Math.round((negativeCount / total) * 100);
  const neutralPercent = 100 - posPercent - negPercent;

  const score = posPercent / 100;

  let label: SentimentLabel;
  if (score >= 0.6) label = "Positive";
  else if (score >= 0.35) label = "Mixed";
  else label = "Negative";

  const summaryMap: Record<SentimentLabel, string> = {
    Positive:
      `Audience reception has been largely enthusiastic, with viewers praising the film's execution and impact. ` +
      `A strong majority of reviewers recommend the movie and highlight it as a memorable experience. ` +
      `Recurring praise focuses on the performances, storytelling, and emotional resonance.`,
    Mixed:
      `Audience opinions are divided, reflecting a film that resonated strongly with some viewers while leaving others underwhelmed. ` +
      `Supporters celebrate specific elements like direction or acting, while critics point to pacing or tonal inconsistencies. ` +
      `Overall, the film appears to appeal strongly to a particular taste rather than universal audiences.`,
    Negative:
      `Audience reception has been largely critical, with many viewers expressing disappointment in the film's delivery. ` +
      `Common complaints include pacing issues, underdeveloped characters, or a disconnect between premise and execution. ` +
      `A minority of viewers found merit in specific elements, but overall sentiment skews unfavorable.`,
  };

  return {
    label,
    score,
    summary: summaryMap[label],
    breakdown: {
      positive: posPercent,
      neutral: Math.max(0, neutralPercent),
      negative: negPercent,
    },
    keyThemes: ["Story & Plot", "Character Development", "Direction & Pacing", "Visual Style", "Overall Experience"],
  };
}

function buildFallbackResult(reviews: Review[], summary: string): SentimentResult {
  return {
    label: "Mixed",
    score: 0.5,
    summary,
    breakdown: { positive: 0, neutral: 100, negative: 0 },
    keyThemes: [],
  };
}
