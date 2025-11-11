import axios from "axios";
import * as cheerio from "cheerio";

export async function duckSearch(query) {
  const searchUrl = `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`;

  try {
    const response = await axios.get(searchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "uk,en;q=0.9",
      },
      timeout: 10000,
    });

    const $ = cheerio.load(response.data);
    const foundResults = [];

    $(".result").each((_, el) => {
      const title = $(el).find(".result__title").text().trim();
      const snippet = $(el).find(".result__snippet").text().trim();
      let link = $(el).find(".result__url").attr("href");

      if (link?.startsWith("//duckduckgo.com/l/?")) {
        const params = new URLSearchParams(link.split("?")[1]);
        link = params.get("uddg") || link;
      }

      if (title && snippet && link) {
        foundResults.push({ title, snippet, link });
      }
    });

    return foundResults;
  } catch (err) {
    throw new Error(`DuckDuckGo search vpav ${err.message}`);
  }
}

export async function googleSearch(query) {
  const api_key = process.env.GOOGLE_API_KEY;
  const google_id = process.env.GOOGLE_SEARCH_ENGINE_ID;

  if (!api_key || !google_id) {
    throw new Error("No dostyp to .env variable");
  }

  try {
    const { data } = await axios.get("https://www.googleapis.com/customsearch/v1", {
      params: { key: api_key, google_id, q: query, num: 5 },
      timeout: 10000,
    });

    return data.items?.map(item => ({
      title: item.title,
      snippet: item.snippet,
      link: item.link,
    })) || [];
  } catch (err) {
    throw new Error(`Google search vpav ${err.message}`);
  }
}

export async function searchWeb(query) {
  let results = [];

  if (process.env.GOOGLE_API_KEY && process.env.GOOGLE_SEARCH_ENGINE_ID) {
    try {
      results = await googleSearch(query);
    } catch {}
  }

  if (results.length === 0) {
    results = await duckSearch(query);
  }

  return results;
}
