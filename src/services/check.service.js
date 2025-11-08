import { splitIntoSentences } from "../utils/text.js";
import { searchDuckDuckGo } from "../utils/scraper.js";
import stringSimilarity from "string-similarity";

export async function checkText(text) {
  const sentences = splitIntoSentences(text);
  const checkedResults = [];
  let plagiarizedCount = 0;

  const limitedSentences = sentences.slice(0, 10);

  for (const sentence of limitedSentences) {
    if (sentence.length < 30) {
      checkedResults.push({
        sentence,
        found: false,
        similarity: 0,
        matches: [],
      });
      continue;
    }

    const results = await searchDuckDuckGo(sentence);

    let found = false;
    let maxSimilarity = 0;

    for (const result of results) {
      const snippetText = result.snippet.toLowerCase();
      const sentenceText = sentence.toLowerCase();
      const similarity = stringSimilarity.compareTwoStrings(sentenceText, snippetText);
      if (similarity > maxSimilarity) maxSimilarity = similarity;
      if (similarity >= 0.7) {
        found = true;
        break;
      }
    }

    if (found) plagiarizedCount++;

    checkedResults.push({
      sentence,
      found,
      similarity: maxSimilarity,
      matches: results.slice(0, 3),
    });

    await new Promise((r) => setTimeout(r, 2000));
  }

  let totalScore = 0;
  for (const res of checkedResults) {
    totalScore += 1 - (res.similarity || 0);
  }
  const uniqueness = Math.round((totalScore / checkedResults.length) * 100);

  return {
    uniqueness,
    totalSentences: checkedResults.length,
    checkedResults,
    checkedAt: new Date().toISOString(),
  };
}
