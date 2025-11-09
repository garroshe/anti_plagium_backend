import { Router } from "express";
import { checkTextController } from "../controllers/check.controller.js";
import { validateCheckText } from "../middlewares/validation.js";
import { checkLimiter } from "../middlewares/rateLimit.js";

const router = Router();

router.post("/", checkLimiter, validateCheckText, checkTextController);

export default router;