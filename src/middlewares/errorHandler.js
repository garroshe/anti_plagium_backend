import { logger } from "../utils/logger.js";

export function errorHandler(err, req, res, next) {
  logger.error("Error:", {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });

  // Не показувати stack trace в production
  const isDev = process.env.NODE_ENV !== "production";

  res.status(err.statusCode || 500).json({
    error: err.message || "Внутрішня помилка сервера",
    ...(isDev && { stack: err.stack }),
  });
}

// 404 handler
export function notFoundHandler(req, res) {
  res.status(404).json({
    error: "Маршрут не знайдено",
    path: req.url,
  });
}