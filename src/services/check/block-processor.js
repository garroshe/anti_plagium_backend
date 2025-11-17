export function createBlocks(sentences, blockSize) {
  const blocks = [];

  for (let i = 0; i < sentences.length; i += blockSize) {
    blocks.push(sentences.slice(i, i + blockSize).join(" "));
  }

  return blocks;
}

