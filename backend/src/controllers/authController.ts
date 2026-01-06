import { Request, Response, NextFunction } from 'express';
import { UserModel } from '../models/User';
import { generateToken, generateRefreshToken } from '../config/jwt';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = req.body;

    const user = await UserModel.findByUsername(username);
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    const isValidPassword = await UserModel.verifyPassword(user, password);
    if (!isValidPassword) {
      throw new AppError('Invalid credentials', 401);
    }

    const tokenPayload = {
      userId: user.id,
      username: user.username,
      role: user.role,
    };

    const token = generateToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    logger.info('User logged in', { userId: user.id, username: user.username });

    res.json({
      token,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError('Refresh token is required', 400);
    }

    // Verify refresh token logic would go here
    // For now, return error
    throw new AppError('Refresh token functionality not implemented', 501);
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // In a real implementation, you might want to blacklist the token
    logger.info('User logged out', { userId: req.user?.userId });
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await UserModel.findById(req.user!.userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    next(error);
  }
};

