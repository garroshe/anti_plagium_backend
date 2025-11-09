import express from "express";
import cors from "cors";
import helmet from "helmet";
import checkRouter from "./routes/check.route.js";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.js";
import { logger } from "./utils/logger.js";

const app = express();

// Security middleware
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || "*",
  credentials: true,
}));

// Body parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`, {
    ip: req.ip,
    userAgent: req.get("user-agent"),
  });
  next();
});

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Routes
app.use("/check", checkRouter);

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app;