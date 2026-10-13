import { Response } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import * as favoritesService from './favorites.service';

export const getFavorites = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const data = await favoritesService.getFavorites(userId);
    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleFavorite = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Не указан productId' });
    }

    const result = await favoritesService.toggleFavorite(userId, productId);
    return res.json({ success: true, ...result });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};