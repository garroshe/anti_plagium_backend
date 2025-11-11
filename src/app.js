import express from "express";
import helmet from "helmet";
import cors from "cors";

import checkRoutes from "./routes/check-route.js";
import { notFoundHandler } from "./middlewares/error-handler.js";

const server = express();

server.use(helmet());
server.use(cors());
server.use(express.json({ limit: "5mb" }));

server.get("/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

server.use("/check", checkRoutes);

server.use(notFoundHandler);

export default server;
