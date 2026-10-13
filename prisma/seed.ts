import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const categories = [
    { name: 'Смартфоны', slug: 'smartphones', icon: 'smartphone', order: 1 },
    { name: 'Ноутбуки', slug: 'laptops', icon: 'laptop', order: 2 },
    { name: 'Периферия', slug: 'peripherals', icon: 'headphones', order: 3 },
    { name: 'Аксессуары', slug: 'accessories', icon: 'shopping-bag', order: 4 },
    { name: 'Драйверы & Софт', slug: 'drivers-and-software', icon: 'disc', order: 5 },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { icon: cat.icon, order: cat.order },
      create: cat,
    });
  }

  const bannerCount = await prisma.banner.count();
  if (bannerCount === 0) {
    await prisma.banner.create({
      data: {
        title: 'Новинки недели со скидкой до 20%',
        imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80',
        link: '/catalog/laptops',
        isActive: true,
        order: 1,
      },
    });
  }

  console.log('✅ Сидирование успешно завершено');
}

main().finally(async () => {
  await prisma.$disconnect();
});