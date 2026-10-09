/// <reference types="node" />

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  const laptops = await prisma.category.create({
    data: { name: 'Ноутбуки', slug: 'laptops' }
  });

  const phones = await prisma.category.create({
    data: { name: 'Смартфоны', slug: 'smartphones' }
  });

  await prisma.product.create({
    data: {
      title: 'Apple MacBook Pro 14 M3',
      slug: 'macbook-pro-14-m3',
      description: 'Ноутбук для профессионалов с дисплеем Liquid Retina XDR.',
      price: 189990.00,
      stock: 10,
      images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8'],
      specs: {
        processor: 'Apple M3 Pro',
        ram: '18 GB',
        storage: '512 GB SSD'
      },
      categoryId: laptops.id
    }
  });

  await prisma.product.create({
    data: {
      title: 'Samsung Galaxy S24 Ultra',
      slug: 'samsung-galaxy-s24-ultra',
      description: 'Флагман со встроенным пером S Pen и функциями AI.',
      price: 119990.00,
      stock: 15,
      images: ['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf'],
      specs: {
        processor: 'Snapdragon 8 Gen 3',
        ram: '12 GB',
        storage: '256 GB'
      },
      categoryId: phones.id
    }
  });

  console.log('Тестовые товары загружены в базу!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });