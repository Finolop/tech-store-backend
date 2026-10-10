import { prisma } from '../../config/prisma';

export interface GetProductsParams {
  category?: string;
  search?: string;
  page?: string | number;
  limit?: string | number;
  sort?: 'price_asc' | 'price_desc' | 'newest';
}

export const getAllCategories = async () => {
  return prisma.category.findMany({
    orderBy: { order: 'asc' },
    select: {
      id: true,
      name: true,
      slug: true,
      icon: true,
    },
  });
};

export const getAllBanners = async () => {
  return prisma.banner.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  });
};

export const getProductsList = async (query: GetProductsParams) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.max(Number(query.limit) || 12, 1);
  const skip = (page - 1) * limit;

  // Типизируем через тип аргументов findMany
  type FindManyArgs = NonNullable<Parameters<typeof prisma.product.findMany>[0]>;
  const where: NonNullable<FindManyArgs['where']> = {};

  if (query.category) {
    where.category = { slug: String(query.category) };
  }

  if (query.search) {
    where.OR = [
      { title: { contains: String(query.search), mode: 'insensitive' } },
      { description: { contains: String(query.search), mode: 'insensitive' } },
    ];
  }

  let orderBy: NonNullable<FindManyArgs['orderBy']> = { createdAt: 'desc' };
  if (query.sort === 'price_asc') {
    orderBy = { price: 'asc' };
  } else if (query.sort === 'price_desc') {
    orderBy = { price: 'desc' };
  } else if (query.sort === 'newest') {
    orderBy = { createdAt: 'desc' };
  }

  const [total, items] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    }),
  ]);

  return {
    items,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getProductBySlug = async (slug: string) => {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });
};