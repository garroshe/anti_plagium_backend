import { checkTextService } from "../services/check.service.js";

export async function checkTextController(req, res, next) {
  try {
    const { text, options } = req.body;

    const result = await checkTextService(text, options);
    res.json(result);
  } catch (err) {
    next(err);
  }
}