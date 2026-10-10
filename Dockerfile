# 1. Этап сборки (Builder)
FROM node:20-alpine AS builder

WORKDIR /app

# Копируем манифесты зависимостей и схему Prisma
COPY package*.json ./
COPY prisma ./prisma/

# Устанавливаем зависимости и генерируем Prisma Client
RUN npm ci
RUN npx prisma generate

# Копируем исходный код и компилируем TypeScript
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# 2. Этап продакшена (Runner)
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Копируем манифесты для установки только production-зависимостей
COPY package*.json ./
COPY prisma ./prisma/

# Устанавливаем только runtime зависимости и генерируем Prisma Client под платформу
RUN npm ci --only=production
RUN npx prisma generate

# Копируем скомпилированный код из этапа builder
COPY --from=builder /app/dist ./dist

# Порт приложения
EXPOSE 5000

# Запуск сервера
CMD ["node", "dist/server.js"]