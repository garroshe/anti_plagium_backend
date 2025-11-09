export function splitIntoSentences(text) {
  return (
    text
      .replace(/\n+/g, " ")
      // Додати підтримку скорочень (т.е., т.д., и т.п.)
      .replace(/([тит])\.\s*([едп])\./gi, "$1_$2_")
      .match(/[^.!?]+[.!?]+/g)
      ?.map((s) => s.replace(/_/g, ".").trim())
      .filter(Boolean) || []
  );
}

export function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}