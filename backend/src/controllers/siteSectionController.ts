import { Request, Response, NextFunction } from 'express';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { SiteSectionModel, CreateSiteSectionInput } from '../models/SiteSection';
import { SiteModel } from '../models/Site';

export const createSection = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { site_id, name, code, description, section_type, coordinates, capacity } = req.body;

    if (!site_id || !name || !code) {
      throw new AppError('Site ID, name, and code are required', 400);
    }

    // Verify site exists
    const site = await SiteModel.findById(site_id);
    if (!site) {
      throw new AppError('Site not found', 404);
    }

    const sectionData: CreateSiteSectionInput = {
      site_id,
      name,
      code,
      description,
      section_type,
      coordinates,
      capacity,
    };

    const section = await SiteSectionModel.create(sectionData);
    logger.info('Site section created', { siteId: site_id, sectionId: section.id });

    res.status(201).json({
      message: 'Section created successfully',
      section,
    });
  } catch (error) {
    next(error);
  }
};

export const getSectionsBySite = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { siteId } = req.params;

    const sections = await SiteSectionModel.findBySiteId(siteId);
    res.json({ sections });
  } catch (error) {
    next(error);
  }
};

export const getSectionById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const section = await SiteSectionModel.findById(id);
    if (!section) {
      throw new AppError('Section not found', 404);
    }

    res.json({ section });
  } catch (error) {
    next(error);
  }
};

export const updateSection = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const section = await SiteSectionModel.update(id, updates);
    logger.info('Site section updated', { sectionId: id });

    res.json({
      message: 'Section updated successfully',
      section,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSection = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    await SiteSectionModel.delete(id);
    logger.info('Site section deleted', { sectionId: id });

    res.json({ message: 'Section deleted successfully' });
  } catch (error) {
    next(error);
  }
};

