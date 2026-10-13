import { prisma } from '../../config/prisma';

export const getFavorites = async (userId: string) => {
  const items = await prisma.favorite.findMany({
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

  return items.map((item) => ({
    id: item.id,
    product: {
      ...item.product,
      price: Number(item.product.price),
    },
  }));
};

export const toggleFavorite = async (userId: string, productId: string) => {
  const existing = await prisma.favorite.findUnique({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
  });

  if (existing) {
    await prisma.favorite.delete({
      where: { id: existing.id },
    });
    return { isFavorite: false, message: 'Товар удален из избранного' };
  }

  // Проверяем существование товара перед добавлением
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    throw new Error('Товар не найден');
  }

  await prisma.favorite.create({
    data: { userId, productId },
  });

  return { isFavorite: true, message: 'Товар добавлен в избранное' };
};