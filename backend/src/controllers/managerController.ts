import { Request, Response, NextFunction } from 'express';
import { UserModel, CreateUserInput } from '../models/User';
import { SiteModel } from '../models/Site';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { logAudit } from '../utils/auditLogger';

export const getAllManagers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    const siteId = req.query.site_id as string;

    const managers = await UserModel.findAll(limit, offset, siteId);
    const managersWithSites = await Promise.all(
      managers
        .filter(u => u.role === 'manager')
        .map(async (manager) => {
          const site = manager.site_id ? await SiteModel.findById(manager.site_id) : null;
          return {
            ...manager,
            site: site ? { id: site.id, name: site.name, code: site.code } : null,
          };
        })
    );

    res.json({
      managers: managersWithSites,
      pagination: {
        limit,
        offset,
        total: managersWithSites.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getManagerById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const manager = await UserModel.findById(id);

    if (!manager || manager.role !== 'manager') {
      throw new AppError('Manager not found', 404);
    }

    const site = manager.site_id ? await SiteModel.findById(manager.site_id) : null;

    res.json({
      ...manager,
      site: site ? { id: site.id, name: site.name, code: site.code } : null,
    });
  } catch (error) {
    next(error);
  }
};

export const createManager = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, email, password, site_id } = req.body;

    if (!username || !email || !password) {
      throw new AppError('Username, email, and password are required', 400);
    }

    if (!site_id) {
      throw new AppError('Site ID is required for managers', 400);
    }

    // Verify site exists
    const site = await SiteModel.findById(site_id);
    if (!site) {
      throw new AppError('Site not found', 404);
    }

    // Check if username or email already exists
    const existingUser = await UserModel.findByUsername(username);
    if (existingUser) {
      throw new AppError('Username already exists', 400);
    }

    const existingEmail = await UserModel.findByEmail(email);
    if (existingEmail) {
      throw new AppError('Email already exists', 400);
    }

    const managerData: CreateUserInput = {
      username,
      email,
      password,
      role: 'manager',
      site_id,
    };

    const manager = await UserModel.create(managerData);
    logger.info('Manager created', { managerId: manager.id, username: manager.username, siteId: site_id });
    await logAudit(req, 'manager.created', 'user', manager.id, { username, site_id });

    const siteInfo = await SiteModel.findById(site_id);
    res.status(201).json({
      ...manager,
      site: siteInfo ? { id: siteInfo.id, name: siteInfo.name, code: siteInfo.code } : null,
    });
  } catch (error) {
    next(error);
  }
};

export const updateManager = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { username, email, password, site_id } = req.body;

    const manager = await UserModel.findById(id);
    if (!manager || manager.role !== 'manager') {
      throw new AppError('Manager not found', 404);
    }

    // If site_id is being updated, verify site exists
    if (site_id) {
      const site = await SiteModel.findById(site_id);
      if (!site) {
        throw new AppError('Site not found', 404);
      }
    }

    // Check if username or email conflicts
    if (username && username !== manager.username) {
      const existingUser = await UserModel.findByUsername(username);
      if (existingUser) {
        throw new AppError('Username already exists', 400);
      }
    }

    if (email && email !== manager.email) {
      const existingEmail = await UserModel.findByEmail(email);
      if (existingEmail) {
        throw new AppError('Email already exists', 400);
      }
    }

    const updateData: Partial<CreateUserInput> = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (password) updateData.password = password;
    if (site_id !== undefined) updateData.site_id = site_id;

    const updatedManager = await UserModel.update(id, updateData);
    logger.info('Manager updated', { managerId: id });
    await logAudit(req, 'manager.updated', 'user', id, updateData);

    const site = updatedManager.site_id ? await SiteModel.findById(updatedManager.site_id) : null;
    res.json({
      ...updatedManager,
      site: site ? { id: site.id, name: site.name, code: site.code } : null,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteManager = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const manager = await UserModel.findById(id);
    if (!manager || manager.role !== 'manager') {
      throw new AppError('Manager not found', 404);
    }

    await UserModel.delete(id);
    logger.info('Manager deleted', { managerId: id });
    await logAudit(req, 'manager.deleted', 'user', id);

    res.json({ message: 'Manager deleted successfully' });
  } catch (error) {
    next(error);
  }
};

