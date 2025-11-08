import express from "express";
import cors from "cors";
import checkRouter from "./routes/check.route.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/check", checkRouter);
app.use(errorHandler);

export default app;
