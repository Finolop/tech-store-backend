import { prisma } from '../../config/prisma';

export const getAllProducts = async (categorySlug?: string) => {
  return await prisma.product.findMany({
    where: categorySlug
      ? { category: { slug: categorySlug } }
      : undefined,
    include: {
      category: {
        select: { name: true, slug: true }
      }
    }
  });
};