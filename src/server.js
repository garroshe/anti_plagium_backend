import app from "./app.js";
import { config } from "./config/index.js";
import { logger } from "./utils/logger.js";

const server = app.listen(config.PORT, () => {
  logger.info(`🚀 Сервер запущено на порту ${config.PORT}`);
  logger.info(`🌍 Середовище: ${config.NODE_ENV}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM отримано. Закриття сервера...");
  server.close(() => {
    logger.info("Сервер закрито");
    process.exit(0);
  });
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection:", reason);
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
  process.exit(1);
});