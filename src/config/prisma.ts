import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: [
    { emit: 'stdout', level: 'query' }, // Покажет сырой SQL-запрос
    { emit: 'stdout', level: 'error' }, // Покажет ошибки базы данных
    { emit: 'stdout', level: 'warn' },  // Предупреждения
  ],
});