import { Response } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import * as ordersService from './orders.service';

export const createOrder = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { deliveryAddress, contactPhone, comment } = req.body;

    if (!deliveryAddress || !contactPhone) {
      return res.status(400).json({
        success: false,
        message: 'Адрес доставки и контактный телефон обязательны для заполнения',
      });
    }

    const order = await ordersService.createOrder({
      userId,
      deliveryAddress,
      contactPhone,
      comment,
    });

    return res.status(201).json({
      success: true,
      message: 'Заказ успешно оформлен',
      data: order,
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const getMyOrders = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const orders = await ordersService.getUserOrders(userId);
    return res.json({ success: true, data: orders });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrderById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const idParam = req.params.id;
    const orderId = Array.isArray(idParam) ? idParam[0] : idParam;

    const order = await ordersService.getOrderById(userId, orderId);
    return res.json({ success: true, data: order });
  } catch (error: any) {
    return res.status(404).json({ success: false, message: error.message });
  }
};

export const cancelOrder = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const idParam = req.params.id;
    const orderId = Array.isArray(idParam) ? idParam[0] : idParam;

    const order = await ordersService.cancelOrder(userId, orderId);
    return res.json({
      success: true,
      message: 'Заказ отменен, товары возвращены на склад',
      data: order,
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};