import { Request, Response } from 'express';
import * as productService from './product.service';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string | undefined;
    const products = await productService.getAllProducts(category);

    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Ошибка в getProducts:', error); // <-- ДОБАВЬ ЭТУ СТРОКУ
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
};