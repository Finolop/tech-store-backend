import { Router } from 'express';
import { getFavorites, toggleFavorite } from './favorites.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', getFavorites);
router.post('/toggle', toggleFavorite);

export default router;