import { Router } from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
} from './orders.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

// Заказы доступны только авторизованным покупателям
router.use(authMiddleware);

router.post('/', createOrder);
router.get('/', getMyOrders);
router.get('/:id', getOrderById);
router.patch('/:id/cancel', cancelOrder);

export default router;