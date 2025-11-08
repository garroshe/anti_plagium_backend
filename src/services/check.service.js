import { splitIntoSentences } from "../utils/text.js";
import { searchDuckDuckGo } from "../utils/scraper.js";

export async function checkTextService(text) {
  const sentences = splitIntoSentences(text);
  const checkedResults = [];
  let plagiarizedCount = 0;

  const limited = sentences.slice(0, 10);

  for (const sentence of limited) {
    const results = await searchDuckDuckGo(sentence);
    const found = results.length > 0;
    if (found) plagiarizedCount++;

    checkedResults.push({
      sentence,
      found,
      matches: results.slice(0, 3),
    });

    await new Promise(r => setTimeout(r, 2000));
  }

  const uniqueness = Math.round(100 - (plagiarizedCount / limited.length) * 100);

  return {
    uniqueness,
    totalSentences: limited.length,
    checkedResults,
    checkedAt: new Date().toISOString(),
  };
}
