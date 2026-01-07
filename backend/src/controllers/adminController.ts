import { Request, Response, NextFunction } from 'express';
import { UserModel, CreateUserInput } from '../models/User';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import fs from 'fs';
import path from 'path';

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    
    const users = await UserModel.findAll(limit, offset);
    res.json({ users });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data: CreateUserInput = req.body;
    
    // Check if username exists
    const existingUsername = await UserModel.findByUsername(data.username);
    if (existingUsername) {
      throw new AppError('Username already exists', 400);
    }
    
    // Check if email exists
    const existingEmail = await UserModel.findByEmail(data.email);
    if (existingEmail) {
      throw new AppError('Email already exists', 400);
    }
    
    const user = await UserModel.create(data);
    logger.info('User created', { userId: user.id, username: user.username });
    
    res.status(201).json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    if (role) {
      const user = await UserModel.updateRole(id, role);
      res.json(user);
    } else {
      throw new AppError('No update data provided', 400);
    }
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    // Prevent deleting yourself
    if (id === req.user?.userId) {
      throw new AppError('Cannot delete your own account', 400);
    }
    
    const deleted = await UserModel.delete(id);
    if (!deleted) {
      throw new AppError('User not found', 404);
    }
    
    logger.info('User deleted', { userId: id });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // TODO: Implement settings retrieval from database
    res.json({
      faceRecognitionEnabled: true,
      fingerprintEnabled: true,
      rfidEnabled: true,
      manualCheckInEnabled: true,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // TODO: Implement settings update
    logger.info('Settings updated', { settings: req.body });
    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const getAuditLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user_id, action, resource_type, start_date, end_date, limit, offset } = req.query;
    
    const { AuditLogModel } = await import('../models/AuditLog');
    
    const filters: any = {};
    if (user_id) filters.user_id = user_id as string;
    if (action) filters.action = action as string;
    if (resource_type) filters.resource_type = resource_type as string;
    if (start_date) filters.start_date = new Date(start_date as string);
    if (end_date) filters.end_date = new Date(end_date as string);
    
    const logs = await AuditLogModel.findAll(
      parseInt(limit as string) || 100,
      parseInt(offset as string) || 0,
      filters
    );
    
    const total = await AuditLogModel.count(filters);
    
    res.json({
      logs,
      pagination: {
        total,
        limit: parseInt(limit as string) || 100,
        offset: parseInt(offset as string) || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createBackup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { createBackup: createBackupService, listBackups } = await import('../services/backupService');
    
    const backupPath = await createBackupService();
    const backups = listBackups();
    
    logger.info('Backup created', { backupPath, userId: req.user?.userId });
    
    res.json({
      message: 'Backup created successfully',
      backupPath,
      totalBackups: backups.length,
    });
  } catch (error) {
    next(error);
  }
};

export const listBackups = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { listBackups } = await import('../services/backupService');
    const backups = listBackups();
    
    res.json({
      backups: backups.map(backup => ({
        filename: path.basename(backup),
        path: backup,
        size: fs.statSync(backup).size,
        created: fs.statSync(backup).birthtime,
      })),
    });
  } catch (error) {
    next(error);
  }
};

export const restoreBackup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { backup_path } = req.body;
    
    if (!backup_path) {
      throw new AppError('Backup path is required', 400);
    }
    
    const { restoreBackup: restoreBackupService } = await import('../services/backupService');
    
    // In production, add confirmation step
    await restoreBackupService(backup_path);
    
    logger.warn('Backup restored', { backupPath: backup_path, userId: req.user?.userId });
    
    res.json({ message: 'Backup restored successfully' });
  } catch (error) {
    next(error);
  }
};

