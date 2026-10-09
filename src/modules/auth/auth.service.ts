import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/prisma';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'dev_access_secret_15m';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret_30d';

const generateTokens = (userId: string, role: string) => {
  const accessToken = jwt.sign({ userId, role }, ACCESS_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ userId }, REFRESH_SECRET, { expiresIn: '30d' });
  return { accessToken, refreshToken };
};

const saveRefreshToken = async (userId: string, token: string) => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  await prisma.refreshToken.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  });
};

interface RegisterDto {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

interface LoginDto {
  login: string; // email или телефон
  password: string;
}

export const register = async ({ firstName, lastName, email, phone, password }: RegisterDto) => {
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { phone }],
    },
  });

  if (existingUser) {
    if (existingUser.email === email) {
      throw new Error('Пользователь с таким email уже существует');
    }
    throw new Error('Пользователь с таким номером телефона уже существует');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
    },
  });

  const tokens = generateTokens(user.id, user.role);
  await saveRefreshToken(user.id, tokens.refreshToken);

  return { user, ...tokens };
};

export const login = async ({ login, password }: LoginDto) => {
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: login }, { phone: login }],
    },
  });

  if (!user) {
    throw new Error('Неверный логин (email/телефон) или пароль');
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    throw new Error('Неверный логин (email/телефон) или пароль');
  }

  const tokens = generateTokens(user.id, user.role);
  await saveRefreshToken(user.id, tokens.refreshToken);

  return {
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
    ...tokens,
  };
};

export const refresh = async (oldRefreshToken: string) => {
  if (!oldRefreshToken) throw new Error('Refresh токен не передан');

  try {
    jwt.verify(oldRefreshToken, REFRESH_SECRET);
  } catch {
    throw new Error('Недействительный или просроченный refresh токен');
  }

  const tokenInDb = await prisma.refreshToken.findUnique({
    where: { token: oldRefreshToken },
    include: { user: true },
  });

  if (!tokenInDb || tokenInDb.expiresAt < new Date()) {
    if (tokenInDb) await prisma.refreshToken.delete({ where: { id: tokenInDb.id } });
    throw new Error('Сессия завершена');
  }

  await prisma.refreshToken.delete({ where: { id: tokenInDb.id } });

  const tokens = generateTokens(tokenInDb.user.id, tokenInDb.user.role);
  await saveRefreshToken(tokenInDb.user.id, tokens.refreshToken);

  return tokens;
};

export const logout = async (refreshToken: string) => {
  if (!refreshToken) return;
  await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
};

export const logoutAll = async (userId: string) => {
  await prisma.refreshToken.deleteMany({ where: { userId } });
};

export const getMe = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new Error('Пользователь не найден');
  }

  return user;
};