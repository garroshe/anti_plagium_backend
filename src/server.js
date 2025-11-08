import app from "./app.js";
import { config } from "./config/index.js";

const PORT = config.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Сервер запущено на порту ${PORT}`);
});
