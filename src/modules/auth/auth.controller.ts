import { Request, Response } from 'express';
import * as authService from './auth.service';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

export const register = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;

    if (!firstName || !lastName || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Все поля обязательны для заполнения',
      });
    }

    const data = await authService.register({
      firstName,
      lastName,
      email,
      phone,
      password,
    });

    res.cookie('refreshToken', data.refreshToken, COOKIE_OPTIONS);
    return res.status(201).json({
      success: true,
      user: data.user,
      accessToken: data.accessToken,
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { login, password } = req.body;

    if (!login || !password) {
      return res.status(400).json({
        success: false,
        message: 'Укажите email/телефон и пароль',
      });
    }

    const data = await authService.login({ login, password });

    res.cookie('refreshToken', data.refreshToken, COOKIE_OPTIONS);
    return res.json({
      success: true,
      user: data.user,
      accessToken: data.accessToken,
    });
  } catch (error: any) {
    return res.status(401).json({ success: false, message: error.message });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.refreshToken;
    const tokens = await authService.refresh(token);

    res.cookie('refreshToken', tokens.refreshToken, COOKIE_OPTIONS);
    return res.json({ success: true, accessToken: tokens.accessToken });
  } catch (error: any) {
    res.clearCookie('refreshToken');
    return res.status(401).json({ success: false, message: error.message });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.refreshToken;
    await authService.logout(token);

    res.clearCookie('refreshToken');
    return res.json({ success: true, message: 'Выход выполнен успешно' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const logoutAll = async (req: any, res: Response) => {
  try {
    await authService.logoutAll(req.user.userId);

    res.clearCookie('refreshToken');
    return res.json({ success: true, message: 'Все сессии успешно сброшены' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getMe = async (req: any, res: Response) => {
  try {
    const user = await authService.getMe(req.user.userId);
    return res.json({ success: true, user });
  } catch (error: any) {
    return res.status(404).json({ success: false, message: error.message });
  }
};