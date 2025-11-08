export function splitIntoSentences(text) {
  return text
    .replace(/\n+/g, " ")
    .match(/[^.!?]+[.!?]+/g)
    ?.map((s) => s.trim())
    .filter(Boolean) || [];
}
