import express from "express";
import cors from "cors";
import { checkText } from "./services/check.service.js";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/check", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.trim().length < 20) {
      return res.status(400).json({ error: "Текст занадто короткий" });
    }

    const result = await checkText(text);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Помилка під час перевірки" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Сервер запущено на порту ${PORT}`));
