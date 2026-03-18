import User, { UserRole } from '../models/user';
import bcrypt from 'bcryptjs';

/**
 * Seeds or updates the permanent Super Admin account based on .env credentials.
 * This ensures the account exists even if the database is initially empty.
 */
export const seedSuperAdmin = async () => {
  try {
    const email = process.env.SUPER_ADMIN_EMAIL;
    const username = process.env.SUPER_ADMIN_USERNAME;
    const password = process.env.SUPER_ADMIN_PASSWORD;

    if (!email || !username || !password) {
      console.warn('⚠️ Default Admin credentials not fully configured in .env. Skipping seeder.');
      return;
    }

    // Check if user already exists
    let user = await User.findOne({ where: { email: email.toLowerCase().trim() } });

    if (!user) {
      console.info(`👤 Creating permanent Default Admin account: ${email}`);
      await User.create({
        email: email.toLowerCase().trim(),
        username: username.toLowerCase().trim(),
        password: password,
        fullName: 'System Admin',
        role: UserRole.DEVELOPER,
        emailVerified: true,
        isActive: true,
      });
      console.info('✅ Default Admin account created successfully.');
    } else {
      // Update existing user to ensure credentials match .env
      console.info(`👤 Updating permanent Default Admin account: ${email}`);
      user.username = username.toLowerCase().trim();
      user.password = password;
      user.role = UserRole.DEVELOPER; // Ensure they have the correct role
      user.isActive = true;
      user.emailVerified = true;
      await user.save();
      console.info('✅ Default Admin account updated successfully.');
    }
  } catch (error) {
    console.error('❌ Error seeding Default Admin:', error);
  }
};

export default seedSuperAdmin;
