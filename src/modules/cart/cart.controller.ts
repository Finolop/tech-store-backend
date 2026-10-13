import { Response } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import * as cartService from './cart.service';

export const getCart = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const data = await cartService.getCart(userId);
    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const addToCart = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { productId, quantity } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Не указан productId' });
    }

    await cartService.addToCart(userId, productId, Number(quantity) || 1);
    return res.json({ success: true, message: 'Товар добавлен в корзину' });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const updateQuantity = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const itemIdParam = req.params.itemId;
    const itemId = Array.isArray(itemIdParam) ? itemIdParam[0] : itemIdParam;
    const { quantity } = req.body;

    if (!quantity || isNaN(Number(quantity))) {
      return res.status(400).json({ success: false, message: 'Некорректное количество' });
    }

    await cartService.updateQuantity(userId, itemId, Number(quantity));
    return res.json({ success: true, message: 'Количество обновлено' });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const removeFromCart = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const itemIdParam = req.params.itemId;
    const itemId = Array.isArray(itemIdParam) ? itemIdParam[0] : itemIdParam;

    await cartService.removeFromCart(userId, itemId);
    return res.json({ success: true, message: 'Товар удален из корзины' });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};