import { checkTextService } from "../services/check.service.js";

export async function checkTextController(req, res, next) {
  try {
    const { text } = req.body;

    if (!text || text.trim().length < 20) {
      return res.status(400).json({ error: "Текст занадто короткий" });
    }

    const result = await checkTextService(text);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
