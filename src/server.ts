import dotenv from 'dotenv';
// Считываем переменные из файла .env (порт, пароли)
dotenv.config();

import app from './app';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
});