export const splitIntoSentences = (text) => {
  return (
    text
      .replace(/\n+/g, " ")
      .replace(/([тит])\.\s*([едп])\./gi, "$1_$2_")
      .match(/[^.!?]+[.!?]+/g)
      ?.map((s) => s.replace(/_/g, ".").trim())
      .filter(Boolean) || []
  );
}

export const normalize = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}