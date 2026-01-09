import { Request, Response, NextFunction } from 'express';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { EmployeeLocationModel, CreateEmployeeLocationInput } from '../models/EmployeeLocation';
import { EmployeeModel } from '../models/Employee';
import { SiteModel } from '../models/Site';
import { SiteSectionModel } from '../models/SiteSection';

export const updateLocation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employeeId = req.user?.userId || req.body.employee_id;
    
    if (!employeeId) {
      throw new AppError('Employee ID is required', 400);
    }

    const { site_id, section_id, location_type, notes } = req.body;

    if (!site_id) {
      throw new AppError('Site ID is required', 400);
    }

    // Verify employee exists
    const employee = await EmployeeModel.findById(employeeId);
    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    // Verify site exists
    const site = await SiteModel.findById(site_id);
    if (!site) {
      throw new AppError('Site not found', 404);
    }

    // Verify section exists if provided
    if (section_id) {
      const section = await SiteSectionModel.findById(section_id);
      if (!section) {
        throw new AppError('Section not found', 404);
      }
      if (section.site_id !== site_id) {
        throw new AppError('Section does not belong to the specified site', 400);
      }
    }

    const locationData: CreateEmployeeLocationInput = {
      employee_id: employeeId,
      site_id,
      section_id: section_id || null,
      location_type: location_type || 'section',
      notes,
    };

    const location = await EmployeeLocationModel.create(locationData);
    logger.info('Employee location updated', { employeeId, locationId: location.id });

    res.status(201).json({
      message: 'Location updated successfully',
      location,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyLocation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employeeId = req.user?.userId;
    if (!employeeId) {
      throw new AppError('Not authenticated', 401);
    }

    const location = await EmployeeLocationModel.getCurrentLocation(employeeId);
    res.json({ location });
  } catch (error) {
    next(error);
  }
};

export const getMyLocationHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employeeId = req.user?.userId;
    if (!employeeId) {
      throw new AppError('Not authenticated', 401);
    }

    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const history = await EmployeeLocationModel.getLocationHistory(employeeId, limit, offset);
    res.json({ history });
  } catch (error) {
    next(error);
  }
};

export const getEmployeesInSection = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sectionId } = req.params;

    const employees = await EmployeeLocationModel.getEmployeesInSection(sectionId);
    res.json({ employees });
  } catch (error) {
    next(error);
  }
};

export const getEmployeesInSite = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { siteId } = req.params;

    const employees = await EmployeeLocationModel.getEmployeesInSite(siteId);
    res.json({ employees });
  } catch (error) {
    next(error);
  }
};

export const exitLocation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const employeeId = req.user?.userId;
    
    if (!employeeId) {
      throw new AppError('Not authenticated', 401);
    }

    const location = await EmployeeLocationModel.findById(id);
    if (!location) {
      throw new AppError('Location not found', 404);
    }

    if (location.employee_id !== employeeId) {
      throw new AppError('Unauthorized', 403);
    }

    const updatedLocation = await EmployeeLocationModel.exitLocation(id);
    logger.info('Employee exited location', { employeeId, locationId: id });

    res.json({
      message: 'Location exited successfully',
      location: updatedLocation,
    });
  } catch (error) {
    next(error);
  }
};

