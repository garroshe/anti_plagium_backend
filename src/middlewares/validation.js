import { body, validationResult } from "express-validator";

export const validateCheckText = [
  body("text")
    .exists()
    .isString()
    .trim()
    .isLength({ min: 20, max: 65000 }).withMessage("Довжина: 20-50000 символів"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: "Невалідні дані", details: errors.array() });
    }
    next();
  },
];