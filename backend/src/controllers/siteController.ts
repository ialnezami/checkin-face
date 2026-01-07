import { Request, Response, NextFunction } from 'express';
import { SiteModel, CreateSiteInput } from '../models/Site';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { logAudit } from '../utils/auditLogger';

export const getSites = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const includeInactive = req.query.include_inactive === 'true';
    const sites = await SiteModel.findAll(includeInactive);
    res.json({ sites });
  } catch (error) {
    next(error);
  }
};

export const getSite = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const site = await SiteModel.findById(id);
    
    if (!site) {
      throw new AppError('Site not found', 404);
    }

    const authMethods = await SiteModel.getAuthMethods(id);
    res.json({ ...site, authMethods });
  } catch (error) {
    next(error);
  }
};

export const createSite = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data: CreateSiteInput = req.body;

    // Validate required fields
    if (!data.name || !data.code) {
      throw new AppError('Name and code are required', 400);
    }

    // Check if code already exists
    const existing = await SiteModel.findByCode(data.code);
    if (existing) {
      throw new AppError('Site code already exists', 400);
    }

    const site = await SiteModel.create(data);
    logger.info('Site created', { siteId: site.id, code: site.code });
    await logAudit(req, 'site.created', 'site', site.id, { code: site.code });

    res.status(201).json(site);
  } catch (error) {
    next(error);
  }
};

export const updateSite = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const site = await SiteModel.update(id, data);
    logger.info('Site updated', { siteId: id });
    await logAudit(req, 'site.updated', 'site', id, data);

    res.json(site);
  } catch (error) {
    next(error);
  }
};

export const deleteSite = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await SiteModel.delete(id);
    logger.info('Site deleted', { siteId: id });
    await logAudit(req, 'site.deleted', 'site', id);

    res.json({ message: 'Site deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getSiteAuthMethods = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const methods = await SiteModel.getAuthMethods(id);
    res.json({ methods });
  } catch (error) {
    next(error);
  }
};

export const updateSiteAuthMethod = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { method_type, is_enabled, settings } = req.body;

    if (!method_type) {
      throw new AppError('Method type is required', 400);
    }

    const validMethods = ['face', 'fingerprint', 'rfid', 'name_search', 'pin'];
    if (!validMethods.includes(method_type)) {
      throw new AppError('Invalid method type', 400);
    }

    const method = await SiteModel.updateAuthMethod(id, method_type, is_enabled ?? true, settings);
    logger.info('Site auth method updated', { siteId: id, methodType: method_type, enabled: is_enabled });
    await logAudit(req, 'site.auth_method.updated', 'site_auth_method', method.id, {
      site_id: id,
      method_type,
      is_enabled,
    });

    res.json(method);
  } catch (error) {
    next(error);
  }
};

export const getEnabledMethods = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const methods = await SiteModel.getEnabledMethods(id);
    res.json({ methods });
  } catch (error) {
    next(error);
  }
};

