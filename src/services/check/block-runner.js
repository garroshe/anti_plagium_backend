import { CHUNK_PAUSE_MS } from "./constants.js";
import { checkBlock } from "./block-checker.js";

export async function checkBlocksConcurrently(
  blocks,
  concurrency = 3,
  blockedDomains = []
) {
  const results = [];

  for (let i = 0; i < blocks.length; i += concurrency) {
    const chunk = blocks.slice(i, i + concurrency);
    const chunkResults = await Promise.all(
      chunk.map((block) => checkBlock(block, blockedDomains))
    );
    results.push(...chunkResults);

    if (i + concurrency < blocks.length) {
      await new Promise((r) => setTimeout(r, CHUNK_PAUSE_MS));
    }
  }

  return results;
}

