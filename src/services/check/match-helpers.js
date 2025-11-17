import stringSimilarity from "string-similarity";
import { normalize } from "../../utils/text.js";

export function adjustScore(sim) {
  if (sim < 0.4) return sim * 0.5;
  if (sim < 0.7) return sim * 0.8;
  if (sim < 0.85) return sim * 0.9;
  return sim * 0.95;
}

export function getMatchedPhrases(sentence, snippet) {
  const sentenceWords = normalize(sentence).split(" ");
  const snippetWords = normalize(snippet).split(" ");
  return sentenceWords.filter((w) => snippetWords.includes(w));
}

export function calculateSimilarity(block, snippet) {
  const normalizedBlock = normalize(block);
  const normalizedSnippet = normalize(snippet);

  if (!normalizedSnippet) {
    return { adjusted: 0, percent: 0, normalizedBlock };
  }

  const sim = stringSimilarity.compareTwoStrings(
    normalizedBlock,
    normalizedSnippet
  );
  const adjusted = adjustScore(sim);

  return {
    adjusted,
    percent: Math.round(adjusted * 100),
    normalizedBlock,
  };
}

export function normalizeDomain(value) {
  if (!value) return null;

  try {
    const parsed = value.startsWith("http")
      ? new URL(value)
      : new URL(`https://${value}`);
    return parsed.hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return value.replace(/^www\./, "").toLowerCase();
  }
}

