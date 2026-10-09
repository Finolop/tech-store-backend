import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import productRoutes from './modules/products/product.routes';
import authRoutes from './modules/auth/auth.routes';

const app = express();

// credentials: true обязателен для передачи httpOnly cookie между доменами фронта и бэка
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Эндпоинты API v1
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Backend is running smoothly' });
});

export default app;