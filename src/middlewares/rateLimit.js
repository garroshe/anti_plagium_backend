import rateLimit from "express-rate-limit";

export const checkLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 хвилин
  max: 10, // 10 перевірок на IP
  message: {
    error: "Занадто багато запитів",
    message: "Будь ласка, спробуйте пізніше. Ліміт: 10 перевірок на 15 хвилин",
  },
  standardHeaders: true,
  legacyHeaders: false,
});