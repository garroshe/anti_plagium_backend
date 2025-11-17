import { searchWeb } from "../../utils/scraper.js";
import { normalize } from "../../utils/text.js";
import {
  MIN_MATCH_PERCENT,
  MAX_RESULTS_PER_BLOCK,
  RETRY_DELAY_MS,
  DEFAULT_BLOCKED_DOMAINS,
} from "./constants.js";
import {
  calculateSimilarity,
  getMatchedPhrases,
  normalizeDomain,
} from "./match-helpers.js";

function buildBlockedSet(blockedDomains = []) {
  const merged = new Set(DEFAULT_BLOCKED_DOMAINS);

  blockedDomains
    .map(normalizeDomain)
    .filter(Boolean)
    .forEach((domain) => merged.add(domain));

  return merged;
}

export async function checkBlock(block, blockedDomains = [], retries = 2) {
  const normalizedBlock = normalize(block);
  const blocked = buildBlockedSet(blockedDomains);

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const results = await searchWeb(normalizedBlock);

      if (!results || results.length === 0) {
        return {
          sentence: block,
          found: false,
          matches: [],
          maxSim: 0,
          error: "Результати пошуку відсутні",
        };
      }

      let maxSim = 0;
      const matches = [];

      results.slice(0, MAX_RESULTS_PER_BLOCK).forEach((res) => {
        const domain = normalizeDomain(res.link);
        if (!domain || blocked.has(domain)) {
          return;
        }

        const { adjusted, percent } = calculateSimilarity(
          normalizedBlock,
          res.snippet
        );

        if (adjusted > maxSim) {
          maxSim = adjusted;
        }

        if (percent < MIN_MATCH_PERCENT) {
          return;
        }

        matches.push({
          url: res.link,
          title: res.title,
          snippet: res.snippet,
          similarity: percent,
          matchedPhrases: getMatchedPhrases(block, res.snippet),
          domain,
        });
      });

      return {
        sentence: block,
        found: matches.length > 0,
        matches,
        maxSim,
      };
    } catch (error) {
      if (attempt === retries) {
        return {
          sentence: block,
          found: false,
          matches: [],
          maxSim: 0,
          error: error.message,
        };
      }

      await new Promise((r) =>
        setTimeout(r, RETRY_DELAY_MS * Math.pow(2, attempt))
      );
    }
  }
}

