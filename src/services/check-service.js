import { splitIntoSentences } from "../utils/text.js";
import { createBlocks } from "./check/block-processor.js";
import { checkBlocksConcurrently } from "./check/block-runner.js";

export async function checkTextService(text, options = {}) {
  const startTime = Date.now();
  const { blockSize = 3, concurrency = 3, blockedDomains = [] } = options;

  if (!text || typeof text !== "string") {
    throw new Error("Некоректний текст");
  }

  const sentences = splitIntoSentences(text);

  if (sentences.length === 0) {
    throw new Error("Не вдалося розбити текст на речення");
  }

  const blocks = createBlocks(sentences, blockSize);
  const checkedResults = await checkBlocksConcurrently(
    blocks,
    concurrency,
    blockedDomains
  );

  let totalSim = 0;
  let foundCount = 0;
  let errorCount = 0;

  checkedResults.forEach((result) => {
    if (result.error) {
      errorCount++;
    } else {
      totalSim += result.maxSim;
      if (result.found) foundCount++;
    }
  });

  const validResults = checkedResults.length - errorCount;
  const avgSim = validResults > 0 ? totalSim / validResults : 0;
  const plagPercent =
    validResults > 0 ? (foundCount / validResults) * 100 : 0;
  const uniqueness = Math.max(
    0,
    Math.round(100 - avgSim * 100 - plagPercent * 0.4)
  );

  const duration = Date.now() - startTime;

  return {
    uniqueness,
    totalSentences: blocks.length,
    checkedResults: checkedResults.map(({ maxSim, ...rest }) => rest),
    stats: {
      avgSimilarity: Math.round(avgSim * 100),
      plagiarismPercent: Math.round(plagPercent),
      errorsCount: errorCount,
      durationMs: duration,
    },
    checkedAt: new Date().toISOString(),
  };
}

