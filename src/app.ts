import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import productRoutes from './modules/products/product.routes';
import authRoutes from './modules/auth/auth.routes';
import cartRoutes from './modules/cart/cart.routes';
import favoritesRoutes from './modules/favorites/favorites.routes';
import orderRoutes from './modules/orders/orders.routes';
import adminRoutes from './modules/admin/admin.routes';
import { requestLogger, errorHandler } from './middlewares/logger.middleware'; // <- Импорт

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// 1. Логгер запросов ставим первым
app.use(requestLogger);

// Эндпоинты API v1
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/favorites', favoritesRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1', productRoutes);

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Backend is running smoothly' });
});

// 2. Логгер ошибок ставим в самом конце
app.use(errorHandler);

export default app;