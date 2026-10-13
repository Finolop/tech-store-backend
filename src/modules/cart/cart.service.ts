import { prisma } from '../../config/prisma';

export const getCart = async (userId: string) => {
  const items = await prisma.cartItem.findMany({
    where: { userId },
    include: {
      product: {
        select: {
          id: true,
          title: true,
          slug: true,
          price: true,
          images: true,
          stock: true,
        },
      },
    },
    orderBy: { product: { title: 'asc' } },
  });

  // Преобразуем Decimal в Number и считаем сумму
  const formattedItems = items.map((item) => {
    const price = Number(item.product.price);
    return {
      id: item.id,
      quantity: item.quantity,
      product: {
        ...item.product,
        price,
      },
      subtotal: price * item.quantity,
    };
  });

const totalCount = formattedItems.reduce((acc: number, curr) => acc + curr.quantity, 0);
  const totalPrice = formattedItems.reduce((acc: number, curr) => acc + curr.subtotal, 0);

  return {
    items: formattedItems,
    totalCount,
    totalPrice,
  };
};

export const addToCart = async (userId: string, productId: string, quantity: number = 1) => {
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new Error('Товар не найден');
  }

  if (product.stock < quantity) {
    throw new Error('Недостаточно товара на складе');
  }

  // upsert: если товар уже в корзине — увеличиваем quantity, если нет — создаем
  return prisma.cartItem.upsert({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
    update: {
      quantity: { increment: quantity },
    },
    create: {
      userId,
      productId,
      quantity,
    },
  });
};

export const updateQuantity = async (userId: string, itemId: string, quantity: number) => {
  if (quantity < 1) {
    throw new Error('Количество не может быть меньше 1');
  }

  const cartItem = await prisma.cartItem.findFirst({
    where: { id: itemId, userId },
    include: { product: true },
  });

  if (!cartItem) {
    throw new Error('Позиция в корзине не найдена');
  }

  if (cartItem.product.stock < quantity) {
    throw new Error('Запрошенное количество превышает остаток на складе');
  }

  return prisma.cartItem.update({
    where: { id: itemId },
    data: { quantity },
  });
};

export const removeFromCart = async (userId: string, itemId: string) => {
  const cartItem = await prisma.cartItem.findFirst({
    where: { id: itemId, userId },
  });

  if (!cartItem) {
    throw new Error('Позиция в корзине не найдена');
  }

  return prisma.cartItem.delete({
    where: { id: itemId },
  });
};