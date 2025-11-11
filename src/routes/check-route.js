import { Router } from "express";
import { checkTextController } from "../controllers/check-controller.js";
import { validateCheckText } from "../middlewares/validation.js";

const router = Router();

router.post("/", validateCheckText, checkTextController);

export default router;