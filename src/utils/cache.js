const cache = new Map();
const CACHE_TTL = 3600000; // 1 година

export function getCached(key) {
  const item = cache.get(key);
  if (item && Date.now() - item.timestamp < CACHE_TTL) {
    return item.value;
  }
  cache.delete(key);
  return null;
}

export function setCache(key, value) {
  cache.set(key, { value, timestamp: Date.now() });

  // Автоочищення старих записів
  if (cache.size > 1000) {
    const now = Date.now();
    for (const [k, v] of cache.entries()) {
      if (now - v.timestamp > CACHE_TTL) {
        cache.delete(k);
      }
    }
  }
}

export function clearCache() {
  cache.clear();
}