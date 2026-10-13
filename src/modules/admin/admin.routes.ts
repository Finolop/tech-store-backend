import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { adminMiddleware } from '../../middlewares/admin.middleware';
import {
  updateOrderStatus,
  getAllOrders,
  createProduct,
  deleteProduct,
} from './admin.controller';

const router = Router();

// Все роуты админки требуют авторизацию И роль ADMIN
router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/orders', getAllOrders);
router.patch('/orders/:id/status', updateOrderStatus);

router.post('/products', createProduct);
router.delete('/products/:id', deleteProduct);

export default router;