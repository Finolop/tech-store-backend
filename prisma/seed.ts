import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const categories = [
    { name: 'Смартфоны', slug: 'smartphones', order: 1 },
    { name: 'Ноутбуки', slug: 'laptops', order: 2 },
    { name: 'Периферия', slug: 'peripherals', order: 3 },
    { name: 'Аксессуары', slug: 'accessories', order: 4 },
    { name: 'Драйверы & Софт', slug: 'drivers-and-software', order: 5 },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
}

main().finally(async () => await prisma.$disconnect());