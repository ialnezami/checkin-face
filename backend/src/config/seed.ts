import { UserModel } from '../models/User';
import { EmployeeModel } from '../models/Employee';
import { logger } from '../utils/logger';

/**
 * Seed initial data for development
 */
export const seedDatabase = async () => {
  try {
    logger.info('Seeding database...');

    // Create default admin user
    try {
      const admin = await UserModel.findByUsername('admin');
      if (!admin) {
        await UserModel.create({
          username: 'admin',
          email: 'admin@example.com',
          password: 'admin123',
          role: 'admin',
        });
        logger.info('Default admin user created (username: admin, password: admin123)');
      }
    } catch (error) {
      logger.warn('Admin user already exists or error creating admin', { error });
    }

    // Create sample employees
    const sampleEmployees = [
      {
        employee_id: 'EMP001',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        department: 'Engineering',
        position: 'Software Developer',
      },
      {
        employee_id: 'EMP002',
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane.smith@example.com',
        department: 'Marketing',
        position: 'Marketing Manager',
      },
      {
        employee_id: 'EMP003',
        first_name: 'Bob',
        last_name: 'Johnson',
        email: 'bob.johnson@example.com',
        department: 'Sales',
        position: 'Sales Representative',
      },
    ];

    for (const empData of sampleEmployees) {
      try {
        const existing = await EmployeeModel.findByEmployeeId(empData.employee_id);
        if (!existing) {
          await EmployeeModel.create(empData);
          logger.info(`Sample employee created: ${empData.employee_id}`);
        }
      } catch (error) {
        logger.warn(`Error creating sample employee ${empData.employee_id}`, { error });
      }
    }

    logger.info('Database seeding completed');
  } catch (error) {
    logger.error('Error seeding database', { error });
    throw error;
  }
};

// Run if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed', error);
      process.exit(1);
    });
}

