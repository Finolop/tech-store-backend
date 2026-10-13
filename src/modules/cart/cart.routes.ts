import { Router } from 'express';
import { getCart, addToCart, updateQuantity, removeFromCart } from './cart.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', getCart);
router.post('/', addToCart);
router.patch('/:itemId', updateQuantity);
router.delete('/:itemId', removeFromCart);

export default router;