import { splitIntoSentences } from "../utils/text.js";
import { searchDuckDuckGo } from "../utils/scraper.js";
import stringSimilarity from "string-similarity";

/** Очищення та нормалізація тексту */
function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Нелінійне зниження схожості для реалістичних результатів */
function adjustScore(sim) {
  if (sim < 0.4) return sim * 0.5;
  if (sim < 0.7) return sim * 0.8;
  if (sim < 0.85) return sim * 0.9;
  return sim * 0.95;
}

/** Повертає масив слів блоку, які збіглися зі snippet */
function getMatchedPhrases(sentence, snippet) {
  const sentenceWords = normalize(sentence).split(" ");
  const snippetWords = normalize(snippet).split(" ");
  return sentenceWords.filter((w) => snippetWords.includes(w));
}

export async function checkTextService(text) {
  const sentences = splitIntoSentences(text);
  const BLOCK_SIZE = 3;
  const blocks = [];

  for (let i = 0; i < sentences.length; i += BLOCK_SIZE) {
    blocks.push(sentences.slice(i, i + BLOCK_SIZE).join(" "));
  }

  const checkedResults = [];
  let totalSim = 0;
  let foundCount = 0;

  for (const block of blocks) {
    const normalizedBlock = normalize(block);
    const results = await searchDuckDuckGo(normalizedBlock);

    let maxSim = 0;
    let bestMatch = null;

    const matches = results.slice(0, 5).map((res) => {
      const sim = stringSimilarity.compareTwoStrings(normalizedBlock, normalize(res.snippet));
      const adjusted = adjustScore(sim);

      if (adjusted > maxSim) {
        maxSim = adjusted;
        bestMatch = res;
      }

      return {
        url: res.link,
        title: res.title,
        snippet: res.snippet,
        similarity: Math.round(adjusted * 100),
        matchedPhrases: getMatchedPhrases(block, res.snippet),
      };
    });

    if (maxSim > 0.6) foundCount++;

    checkedResults.push({
      sentence: block,
      found: maxSim > 0.6,
      matches,
    });

    totalSim += maxSim;
    await new Promise((r) => setTimeout(r, 1500));
  }

  const avgSim = totalSim / checkedResults.length;
  const plagPercent = (foundCount / checkedResults.length) * 100;
  const uniqueness = Math.max(0, Math.round(100 - avgSim * 100 - plagPercent * 0.4));

  return {
    uniqueness,
    totalSentences: blocks.length,
    checkedResults,
    checkedAt: new Date().toISOString(),
  };
}
