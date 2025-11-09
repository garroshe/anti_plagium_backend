import { body, validationResult } from "express-validator";

export const validateCheckText = [
  body("text")
    .exists()
    .withMessage("Поле text є обов'язковим")
    .isString()
    .withMessage("Текст має бути рядком")
    .trim()
    .isLength({ min: 20, max: 50000 })
    .withMessage("Текст має бути від 20 до 50000 символів"),

  body("options")
    .optional()
    .isObject()
    .withMessage("options має бути об'єктом"),

  body("options.blockSize")
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage("blockSize має бути числом від 1 до 10"),

  body("options.concurrency")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("concurrency має бути числом від 1 до 5"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Помилка валідації",
        details: errors.array()
      });
    }
    next();
  },
];