import { Request, Response } from 'express';
import * as productService from './product.service';

export const getCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await productService.getAllCategories();
    return res.status(200).json({ success: true, data: categories });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Ошибка получения категорий' });
  }
};

export const getBanners = async (_req: Request, res: Response) => {
  try {
    const banners = await productService.getAllBanners();
    return res.status(200).json({ success: true, data: banners });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Ошибка получения баннеров' });
  }
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    const result = await productService.getProductsList(req.query);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Ошибка получения каталога' });
  }
};

export const getProductBySlug = async (req: Request, res: Response) => {
  try {
    const slugParam = req.params.slug;
    const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam;

    if (!slug) {
      return res.status(400).json({ success: false, message: 'Не передан slug' });
    }

    const product = await productService.getProductBySlug(slug);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Товар не найден' });
    }

    return res.status(200).json({ success: true, data: product });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Ошибка получения товара' });
  }
};