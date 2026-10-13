import { prisma } from '../../config/prisma';

interface CreateOrderDto {
  userId: string;
  deliveryAddress: string;
  contactPhone: string;
  comment?: string;
}

export const createOrder = async ({
  userId,
  deliveryAddress,
  contactPhone,
  comment,
}: CreateOrderDto) => {
  // Транзакция: либо всё выполняется успешно, либо при любой ошибке откатывается
  return prisma.$transaction(async (tx) => {
    // 1. Забираем корзину пользователя
    const cartItems = await tx.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      throw new Error('Корзина пуста. Невозможно оформить заказ');
    }

    // 2. Проверяем остатки на складе
    for (const item of cartItems) {
      if (item.product.stock < item.quantity) {
        throw new Error(
          `Недостаточно товара "${item.product.title}". В наличии: ${item.product.stock} шт., запрошено: ${item.quantity} шт.`
        );
      }
    }

    // 3. Считаем итоговую стоимость
    const totalAmount = cartItems.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0
    );

    // 4. Создаем заказ и фиксируем цены товаров на момент покупки
    const order = await tx.order.create({
      data: {
        userId,
        deliveryAddress,
        contactPhone,
        comment,
        totalAmount,
        status: 'PENDING',
        items: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            price: item.product.price,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                slug: true,
                images: true,
              },
            },
          },
        },
      },
    });

    // 5. Списываем остатки со склада
    for (const item of cartItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    // 6. Очищаем корзину покупателя
    await tx.cartItem.deleteMany({
      where: { userId },
    });

    return order;
  });
};

export const getUserOrders = async (userId: string) => {
  return prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              title: true,
              slug: true,
              images: true,
            },
          },
        },
      },
    },
  });
};

export const getOrderById = async (userId: string, orderId: string) => {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              title: true,
              slug: true,
              images: true,
            },
          },
        },
      },
    },
  });

  if (!order) {
    throw new Error('Заказ не найден');
  }

  return order;
};

export const cancelOrder = async (userId: string, orderId: string) => {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findFirst({
      where: { id: orderId, userId },
      include: { items: true },
    });

    if (!order) {
      throw new Error('Заказ не найден');
    }

    if (order.status === 'CANCELLED') {
      throw new Error('Заказ уже отменен');
    }

    if (order.status === 'DELIVERED') {
      throw new Error('Нельзя отменить уже доставленный заказ');
    }

    // Возвращаем товары на склад
    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            increment: item.quantity,
          },
        },
      });
    }

    // Меняем статус на отменен
    return tx.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED' },
    });
  });
};