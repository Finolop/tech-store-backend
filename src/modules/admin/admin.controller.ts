import { Request, Response } from 'express';
import { prisma } from '../../config/prisma';

// Изменение статуса заказа (например: PENDING -> PAID -> SHIPPED -> DELIVERED)
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const idParam = req.params.id;
    const orderId = Array.isArray(idParam) ? idParam[0] : idParam;
    const { status } = req.body;

    const validStatuses = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Некорректный статус заказа' });
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    return res.json({
      success: true,
      message: `Статус заказа обновлен на ${status}`,
      data: order,
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// Получение ВСЕХ заказов магазина (для панели администратора)
export const getAllOrders = async (_req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        items: {
          include: {
            product: {
              select: { id: true, title: true, slug: true },
            },
          },
        },
      },
    });

    return res.json({ success: true, data: orders });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Создание нового товара администратором
export const createProduct = async (req: Request, res: Response) => {
  try {
    const { title, slug, description, price, oldPrice, stock, images, categoryId, specs, isFeatured } = req.body;

    if (!title || !slug || !price || !categoryId) {
      return res.status(400).json({ success: false, message: 'Укажите title, slug, price и categoryId' });
    }

    const product = await prisma.product.create({
      data: {
        title,
        slug,
        description: description || '',
        price,
        oldPrice: oldPrice || null,
        stock: Number(stock) || 0,
        images: images || [],
        categoryId,
        specs: specs || null,
        isFeatured: Boolean(isFeatured),
      },
    });

    return res.status(201).json({ success: true, data: product });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// Удаление товара
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const idParam = req.params.id;
    const productId = Array.isArray(idParam) ? idParam[0] : idParam;

    await prisma.product.delete({ where: { id: productId } });
    return res.json({ success: true, message: 'Товар успешно удален' });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};