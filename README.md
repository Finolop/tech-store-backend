# Техническая документация (Backend Dev Notes)

Внутренняя памятка по архитектуре, конфигурации окружения и командам обслуживания бэкенда ARCSHOP.

---

## 1. Конфигурация окружения (`.env`)

Создать файл `.env` в корне проекта:

```env
# HTTP Сервер
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# База данных PostgreSQL
# ВНИМАНИЕ: Для запуска ВНУТРИ Docker Compose используется хост 'postgres'
DATABASE_URL="postgresql://postgres:secretpassword@postgres:5432/arcshop_db?schema=public"

# Если запускать Prisma/скрипты ЛОКАЛЬНО с хост-машины (без docker exec), менять хост на localhost:
# DATABASE_URL="postgresql://postgres:secretpassword@localhost:5432/arcshop_db?schema=public"

# JWT Секреты
JWT_ACCESS_SECRET="arcshop_super_secret_access_jwt_key_2026"
JWT_REFRESH_SECRET="arcshop_super_secret_refresh_jwt_key_2026"

```

---

## 2. Структура проекта и назначение файлов

```text
.
├── docker-compose.yml              # Описание сервисов (postgres, api) и сети
├── Dockerfile                      # Multi-stage сборка Node.js приложения
├── .dockerignore                   # Исключения контекста сборки Docker
├── .env                            # Переменные окружения (локальные секреты)
├── package.json                    # Скрипты и зависимости Node.js
├── tsconfig.json                   # Настройки компилятора TypeScript
├── prisma/
│   ├── schema.prisma               # Схема моделей PostgreSQL (User, RefreshToken, Category, Product...)
│   ├── seed.ts                     # Исходный скрипт сидирования на TS
│   └── seed.js                     # Чистый JS-скрипт сидирования (для выполнения внутри контейнера)
└── src/
    ├── server.ts                   # Точка входа: чтение PORT и вызов app.listen
    ├── app.ts                      # Express-инстанс: cors, cookies, json, подключение роутеров
    ├── config/
    │   └── prisma.ts               # Экземпляр PrismaClient (Singleton)
    ├── middlewares/
    │   └── auth.middleware.ts      # Проверка Bearer токена (authMiddleware)
    └── modules/
        ├── auth/                   # Модуль авторизации
        │   ├── auth.controller.ts  # Обработка register, login, refresh, me, logout
        │   ├── auth.routes.ts      # Маршруты /api/v1/auth/*
        │   └── auth.service.ts     # Бизнес-логика, хэширование паролей, работа с RefreshToken
        └── products/               # Модуль каталога и витрины
            ├── product.controller.ts # Хэндлеры для categories, banners, products
            ├── product.routes.ts     # Маршруты /api/v1/* (categories, banners, products)
            └── product.service.ts    # Запросы к БД: фильтрация, поиск, пагинация, категории

```

---

## 3. Модели базы данных (Ключевые сущности)

* **`User`**: пользователь магазина (`id`, `email`, `phone`, `password`, `role`).
* **`RefreshToken`**: токены обновления сессий (`token`, `userId`, `expiresAt`) со связью `Cascade` при удалении пользователя.
* **`Category`**: категории сайдбара (`name`, `slug`, `icon`, `order`).


* **`Banner`**: рекламные баннеры на главной (`title`, `imageUrl`, `link`, `isActive`, `order`).


* **`Product`**: карточки товаров (`title`, `slug`, `price`, `stock`, `images`, `specs` (JSON), `categoryId`).
* **`CartItem` & `Favorite**`: корзина и избранное с уникальными индексами `@@unique([userId, productId])`.



---

## 4. Шпаргалка по Docker & Prisma

### Управление контейнерами

```bash
# Сборка и фоновый запуск всех сервисов
docker compose up --build -d

# Просмотр статуса контейнеров
docker compose ps

# Просмотр логов бэкенда в реальном времени
docker compose logs -f api

# Остановка контейнеров
docker compose down

# Остановка с полным удалением данных базы (volumes)
docker compose down -v

```

### Команды обслуживания внутри Docker-контейнера

```bash
# Синхронизация структуры БД со схемой Prisma без создания миграций
docker compose exec api npx prisma db push

# Применение зафиксированных миграций
docker compose exec api npx prisma migrate deploy

# Генерация Prisma Client
docker compose exec api npx prisma generate

# Запуск начального наполнения БД (категории сайдбара и баннер)
docker compose exec api node prisma/seed.js

```

---

## 5. Быстрая проверка API

```bash
# Проверка жизнеспособности сервера
curl http://localhost:5000/health

# Проверка категорий сайдбара
curl http://localhost:5000/api/v1/categories

# Проверка каталога товаров
curl http://localhost:5000/api/v1/products

```