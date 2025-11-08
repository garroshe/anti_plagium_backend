import { Router } from "express";
import { checkTextController } from "../controllers/check.controller.js";

const router = Router();

router.post("/", checkTextController);

export default router;
