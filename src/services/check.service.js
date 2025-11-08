import { splitIntoSentences } from "../utils/text.js";
import { searchDuckDuckGo } from "../utils/scraper.js";
import stringSimilarity from "string-similarity";

const THRESHOLD = {
  hard: 0.7,
  medium: 0.8,
  soft: 0.9
};

export async function checkText(text, mode = "medium") {
  const sentences = splitIntoSentences(text);
  const checkedResults = [];
  let plagiarizedCount = 0;

  const threshold = THRESHOLD[mode] || THRESHOLD.medium;
  const BLOCK_SIZE = 3; // перевірка блоками по 3 речення

  const blocks = [];
  for (let i = 0; i < sentences.length; i += BLOCK_SIZE) {
    blocks.push(sentences.slice(i, i + BLOCK_SIZE).join(" "));
  }

  for (const block of blocks) {
    const results = await searchDuckDuckGo(block);

    let found = false;
    let maxSimilarity = 0;

    for (const result of results) {
      const snippetText = result.snippet.toLowerCase();
      const blockText = block.toLowerCase();
      const similarity = stringSimilarity.compareTwoStrings(blockText, snippetText);
      if (similarity > maxSimilarity) maxSimilarity = similarity;
      if (similarity >= threshold) {
        found = true;
        break;
      }
    }

    if (found) plagiarizedCount++;

    checkedResults.push({
      block,
      found,
      similarity: maxSimilarity,
      matches: results.slice(0, 3),
    });

    await new Promise((r) => setTimeout(r, 2000));
  }

  let totalSimilarity = 0;
  for (const res of checkedResults) {
    totalSimilarity += res.similarity;
  }
  const uniqueness = Math.round(100 * (1 - totalSimilarity / checkedResults.length));

  return {
    uniqueness,
    totalBlocks: checkedResults.length,
    checkedResults,
    checkedAt: new Date().toISOString(),
    mode
  };
}
