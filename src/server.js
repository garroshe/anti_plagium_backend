import app from "./app.js";
import { config } from "./configs/config.js";

const server = app.listen(config.PORT, () => {
  console.log(`Start server on port ${config.PORT}`);
});

process.on("SIGTERM", () => {
  console.log("Stop server");
  server.close(() => {
    process.exit(0);
  });
});

process.on("unhandledRejection", (err) => {
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.error("Error", err);
  process.exit(1);
});