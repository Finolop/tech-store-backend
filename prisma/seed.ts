import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Начинаем сидирование базы данных...');

  // 1. Категории
  const categoriesData = [
    { name: 'Смартфоны', slug: 'smartphones', icon: 'smartphone', order: 1 },
    { name: 'Ноутбуки', slug: 'laptops', icon: 'laptop', order: 2 },
    { name: 'Периферия', slug: 'peripherals', icon: 'headphones', order: 3 },
    { name: 'Аксессуары', slug: 'accessories', icon: 'shopping-bag', order: 4 },
    { name: 'Драйверы & Софт', slug: 'drivers-and-software', icon: 'disc', order: 5 },
  ];

  const categories: Record<string, string> = {};

  for (const cat of categoriesData) {
    const record = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { icon: cat.icon, order: cat.order },
      create: cat,
    });
    categories[cat.slug] = record.id;
  }

  // 2. Баннер
  await prisma.banner.upsert({
    where: { id: 'default-banner-1' },
    update: {},
    create: {
      id: 'default-banner-1',
      title: 'Весенняя распродажа: скидки на ультрабуки до 25%',
      imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80',
      link: '/catalog/laptops',
      isActive: true,
      order: 1,
    },
  });

  // 3. Товары
  const products = [
    {
      title: 'Apple iPhone 15 Pro 128GB Titanium',
      slug: 'iphone-15-pro-128gb',
      description: 'Флагманский смартфон с титановым корпусом, чипом A17 Pro и кнопкой Action Button.',
      price: 99990.0,
      oldPrice: 114990.0,
      stock: 12,
      isFeatured: true,
      categoryId: categories['smartphones'],
      images: [
        'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80',
      ],
      specs: {
        screen: '6.1" Super Retina XDR OLED 120Hz',
        processor: 'Apple A17 Pro',
        ram: '8 GB',
        storage: '128 GB',
      },
    },
    {
      title: 'Samsung Galaxy S24 Ultra 256GB',
      slug: 'samsung-galaxy-s24-ultra',
      description: 'Смартфон с искусственным интеллектом Galaxy AI, стилусом S Pen и камерой 200 Мп.',
      price: 112990.0,
      oldPrice: 129990.0,
      stock: 7,
      isFeatured: true,
      categoryId: categories['smartphones'],
      images: [
        'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=800&q=80',
      ],
      specs: {
        screen: '6.8" Dynamic AMOLED 2X 120Hz',
        processor: 'Snapdragon 8 Gen 3',
        ram: '12 GB',
        storage: '256 GB',
      },
    },
    {
      title: 'Apple MacBook Air 15" M3 16/512GB',
      slug: 'macbook-air-15-m3-512',
      description: 'Невероятно тонкий и быстрый ноутбук на базе чипа нового поколения Apple M3.',
      price: 154990.0,
      oldPrice: 169990.0,
      stock: 5,
      isFeatured: true,
      categoryId: categories['laptops'],
      images: [
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
      ],
      specs: {
        screen: '15.3" Liquid Retina',
        processor: 'Apple M3 (8-core CPU, 10-core GPU)',
        ram: '16 GB',
        storage: '512 GB SSD',
        battery: 'До 18 часов',
      },
    },
    {
      title: 'ASUS ROG Zephyrus G16 OLED',
      slug: 'asus-rog-zephyrus-g16',
      description: 'Мощный игровой ноутбук с потрясающим ROG Nebula OLED дисплеем и RTX 4070.',
      price: 189990.0,
      oldPrice: 209990.0,
      stock: 4,
      isFeatured: true,
      categoryId: categories['laptops'],
      images: [
        'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80',
      ],
      specs: {
        screen: '16" 2.5K OLED 240Hz',
        processor: 'Intel Core Ultra 9 185H',
        gpu: 'NVIDIA GeForce RTX 4070 8GB',
        ram: '32 GB LPDDR5X',
        storage: '1 TB NVMe SSD',
      },
    },
    {
      title: 'Беспроводные наушники Sony WH-1000XM5',
      slug: 'sony-wh-1000xm5-black',
      description: 'Эталонное активное шумоподавление, непревзойденное звучание и до 30 часов работы.',
      price: 34990.0,
      oldPrice: 39990.0,
      stock: 15,
      isFeatured: true,
      categoryId: categories['peripherals'],
      images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      ],
      specs: {
        type: 'Накладные, беспроводные',
        noiseCancelling: 'Активное (ANC)',
        battery: 'До 30 часов',
        bluetooth: '5.2, LDAC',
      },
    },
    {
      title: 'Механическая клавиатура Keychron Q1 Pro',
      slug: 'keychron-q1-pro-wireless',
      description: 'Кастомная алюминиевая механическая клавиатура с переключателями Gateron Jupiter.',
      price: 18990.0,
      oldPrice: null,
      stock: 9,
      isFeatured: false,
      categoryId: categories['peripherals'],
      images: [
        'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
      ],
      specs: {
        layout: '75%',
        switches: 'Gateron Jupiter Brown',
        connection: 'Bluetooth / USB Type-C',
        hotSwap: 'Да',
      },
    },
    {
      title: 'Внешний аккумулятор Anker 737 Power Bank 24000mAh',
      slug: 'anker-737-powerbank-140w',
      description: 'Мощнейший павербанк на 140 Вт с цифровым смарт-дисплеем для ноутбуков и телефонов.',
      price: 11990.0,
      oldPrice: 14990.0,
      stock: 20,
      isFeatured: false,
      categoryId: categories['accessories'],
      images: [
        'https://images.unsplash.com/photo-1609592426508-cc02b662363e?auto=format&fit=crop&w=800&q=80',
      ],
      specs: {
        capacity: '24 000 mAh',
        maxPower: '140W (Power Delivery 3.1)',
        ports: '2x USB-C, 1x USB-A',
      },
    },
    {
      title: 'Мышь Logitech MX Master 3S',
      slug: 'logitech-mx-master-3s',
      description: 'Флагманская мышь для продуктивной работы с бесшумными кликами и датчиком 8000 DPI.',
      price: 9990.0,
      oldPrice: 11490.0,
      stock: 18,
      isFeatured: true,
      categoryId: categories['peripherals'],
      images: [
        'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80',
      ],
      specs: {
        sensor: 'Darkfield 8000 DPI',
        connection: 'Bluetooth / Logi Bolt',
        battery: 'До 70 дней',
      },
    },
  ];

  for (const prod of products) {
    await prisma.product.upsert({
      where: { slug: prod.slug },
      update: {
        price: prod.price,
        stock: prod.stock,
        images: prod.images,
        specs: prod.specs,
      },
      create: prod,
    });
  }

  console.log('✅ Сидирование успешно завершено! Товары добавлены.');
}

main().finally(async () => {
  await prisma.$disconnect();
});