import axios from "axios";
import * as cheerio from "cheerio";

export async function searchDuckDuckGo(query) {
  const url = `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  const res = await axios.get(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  const $ = cheerio.load(res.data);
  const results = [];

  $(".result").each((_, el) => {
    const title = $(el).find(".result__title").text().trim();
    const snippet = $(el).find(".result__snippet").text().trim();
    const link = $(el).find(".result__url").attr("href");
    if (title && snippet) results.push({ title, snippet, link });
  });

  return results;
}
