import { Request, Response, NextFunction } from 'express';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const { method, originalUrl } = req;

  // Слушаем окончание ответа
  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;

    // Подсветим статус эмодзи для наглядности
    const icon = status >= 500 ? '❌' : status >= 400 ? '⚠️' : '✅';
    console.log(`${icon} [${new Date().toISOString()}] ${method} ${originalUrl} -> ${status} (${duration}ms)`);
  });

  next();
};

export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('💥 КРИТИЧЕСКАЯ ОШИБКА СЕРВЕРА:', {
    message: err.message,
    stack: err.stack,
  });

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Внутренняя ошибка сервера',
  });
};