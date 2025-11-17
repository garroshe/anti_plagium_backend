import { checkTextService } from "../services/check-service.js";

export async function checkTextController(requestFromFrontend, responseToFrontend, next) {
  try {
    const { text, options } = requestFromFrontend.body;

    const resultAfterCheck = await checkTextService(text, options);
    responseToFrontend.json(resultAfterCheck);
  } catch (err) {
    next(err);
  }
}