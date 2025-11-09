import { splitIntoSentences, normalize } from "../utils/text.js";
import { searchWeb } from "../utils/scraper.js";
import stringSimilarity from "string-similarity";
import { logger } from "../utils/logger.js";

/** Нелінійне зниження схожості */
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

/** Обробка одного блоку з retry логікою */
async function checkBlock(block, retries = 2) {
  const normalizedBlock = normalize(block);

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const results = await searchWeb(normalizedBlock);

      if (!results || results.length === 0) {
        logger.warn("⚠️ Результати пошуку відсутні для блоку");
        return {
          sentence: block,
          found: false,
          matches: [],
          maxSim: 0,
          error: "Результати пошуку відсутні",
        };
      }

      let maxSim = 0;
      const matches = results.slice(0, 5).map((res) => {
        const sim = stringSimilarity.compareTwoStrings(
          normalizedBlock,
          normalize(res.snippet)
        );
        const adjusted = adjustScore(sim);

        if (adjusted > maxSim) {
          maxSim = adjusted;
        }

        return {
          url: res.link,
          title: res.title,
          snippet: res.snippet,
          similarity: Math.round(adjusted * 100),
          matchedPhrases: getMatchedPhrases(block, res.snippet),
        };
      });

      return {
        sentence: block,
        found: maxSim > 0.6,
        matches,
        maxSim,
      };
    } catch (error) {
      logger.error(`❌ Помилка перевірки блоку (спроба ${attempt + 1}):`, error.message);

      if (attempt === retries) {
        return {
          sentence: block,
          found: false,
          matches: [],
          maxSim: 0,
          error: error.message,
        };
      }

      // Експоненційна затримка перед retry
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)));
    }
  }
}

/** Паралельна перевірка з обмеженням одночасних запитів */
async function checkBlocksConcurrently(blocks, concurrency = 3) {
  const results = [];

  for (let i = 0; i < blocks.length; i += concurrency) {
    const chunk = blocks.slice(i, i + concurrency);
    const chunkResults = await Promise.all(
      chunk.map(block => checkBlock(block))
    );
    results.push(...chunkResults);

    // Затримка між групами запитів
    if (i + concurrency < blocks.length) {
      await new Promise(r => setTimeout(r, 1500));
    }
  }

  return results;
}

export async function checkTextService(text, options = {}) {
  const startTime = Date.now();
  const { blockSize = 3, concurrency = 3 } = options;

  // Валідація
  if (!text || typeof text !== "string") {
    throw new Error("Некоректний текст");
  }

  const sentences = splitIntoSentences(text);

  if (sentences.length === 0) {
    throw new Error("Не вдалося розбити текст на речення");
  }

  // Створення блоків
  const blocks = [];
  for (let i = 0; i < sentences.length; i += blockSize) {
    blocks.push(sentences.slice(i, i + blockSize).join(" "));
  }

  logger.info(`📝 Початок перевірки ${blocks.length} блоків (${sentences.length} речень)`);

  // Паралельна перевірка
  const checkedResults = await checkBlocksConcurrently(blocks, concurrency);

  // Підрахунок метрик
  let totalSim = 0;
  let foundCount = 0;
  let errorCount = 0;

  checkedResults.forEach(result => {
    if (result.error) {
      errorCount++;
    } else {
      totalSim += result.maxSim;
      if (result.found) foundCount++;
    }
  });

  const validResults = checkedResults.length - errorCount;
  const avgSim = validResults > 0 ? totalSim / validResults : 0;
  const plagPercent = validResults > 0 ? (foundCount / validResults) * 100 : 0;
  const uniqueness = Math.max(0, Math.round(100 - avgSim * 100 - plagPercent * 0.4));

  const duration = Date.now() - startTime;
  logger.info(`✅ Перевірка завершена за ${duration}ms. Унікальність: ${uniqueness}%`);

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