import { UserModel } from '../models/User';
import { logger } from '../utils/logger';

/**
 * Create an admin user
 */
const createAdmin = async () => {
  try {
    const username = process.argv[2] || 'admin';
    const email = process.argv[3] || 'admin@example.com';
    const password = process.argv[4] || 'admin123';

    // Check if admin already exists
    const existing = await UserModel.findByUsername(username);
    if (existing) {
      console.log(`User '${username}' already exists. Updating password...`);
      await UserModel.updatePassword(existing.id, password);
      console.log(`✅ Admin user '${username}' password updated successfully!`);
      console.log(`   Username: ${username}`);
      console.log(`   Email: ${email}`);
      console.log(`   Password: ${password}`);
      process.exit(0);
    }

    // Create new admin user
    const admin = await UserModel.create({
      username,
      email,
      password,
      role: 'admin',
    });

    console.log('✅ Admin user created successfully!');
    console.log(`   Username: ${username}`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   User ID: ${admin.id}`);
    console.log('\n⚠️  Please change the default password after first login!');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  }
};

createAdmin();

