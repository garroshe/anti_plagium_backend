import axios from "axios";
import * as cheerio from "cheerio";
import { logger } from "./logger.js";
import { getCached, setCache } from "./cache.js";

/**
 * Пошук через DuckDuckGo HTML (може не працювати через блокування)
 */
export async function searchDuckDuckGo(query) {
  const url = `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`;

  try {
    const res = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9,uk;q=0.8",
        "Accept-Encoding": "gzip, deflate",
        "Connection": "keep-alive",
      },
      timeout: 10000,
      maxRedirects: 5,
    });

    const $ = cheerio.load(res.data);
    const results = [];

    $(".result").each((_, el) => {
      const title = $(el).find(".result__title").text().trim();
      const snippet = $(el).find(".result__snippet").text().trim();
      let link = $(el).find(".result__url").attr("href");

      // Очистити посилання від DuckDuckGo redirect
      if (link && link.startsWith("//duckduckgo.com/l/?")) {
        const urlParams = new URLSearchParams(link.split("?")[1]);
        link = urlParams.get("uddg") || link;
      }

      if (title && snippet && link) {
        results.push({ title, snippet, link });
      }
    });

    if (results.length === 0) {
      logger.warn("⚠️ DuckDuckGo не повернув результатів");
    }

    return results;
  } catch (error) {
    logger.error("❌ Помилка DuckDuckGo:", error.message);
    throw new Error(`Помилка пошуку DuckDuckGo: ${error.message}`);
  }
}

/**
 * Пошук через Google Custom Search API
 */
export async function searchGoogle(query) {
  const API_KEY = process.env.GOOGLE_API_KEY;
  const SEARCH_ENGINE_ID = process.env.GOOGLE_SEARCH_ENGINE_ID;

  if (!API_KEY || !SEARCH_ENGINE_ID) {
    throw new Error("Відсутні Google API credentials");
  }

  try {
    const url = "https://www.googleapis.com/customsearch/v1";
    const res = await axios.get(url, {
      params: {
        key: API_KEY,
        cx: SEARCH_ENGINE_ID,
        q: query,
        num: 5,
      },
      timeout: 10000,
    });

    return res.data.items?.map(item => ({
      title: item.title,
      snippet: item.snippet,
      link: item.link,
    })) || [];
  } catch (error) {
    logger.error("❌ Помилка Google Search API:", error.message);
    throw new Error(`Помилка пошуку Google: ${error.message}`);
  }
}

/**
 * Універсальна функція пошуку з кешуванням
 */
export async function searchWeb(query) {
  // Перевірити кеш
  const cacheKey = `search:${query}`;
  const cached = getCached(cacheKey);
  if (cached) {
    logger.debug("📦 Використано кеш для запиту:", query.substring(0, 50));
    return cached;
  }

  let results = [];

  // Спробувати Google API
  if (process.env.GOOGLE_API_KEY && process.env.GOOGLE_SEARCH_ENGINE_ID) {
    try {
      results = await searchGoogle(query);
      logger.debug("✅ Google Search успішно виконано");
    } catch (error) {
      logger.warn("⚠️ Google API недоступний, спроба DuckDuckGo...");
    }
  }

  // Fallback на DuckDuckGo
  if (results.length === 0) {
    results = await searchDuckDuckGo(query);
  }

  // Зберегти в кеш
  if (results.length > 0) {
    setCache(cacheKey, results);
  }

  return results;
}