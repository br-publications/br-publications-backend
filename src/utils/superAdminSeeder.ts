import User, { UserRole } from '../models/user';
import bcrypt from 'bcryptjs';

/**
 * Seeds or verifies the permanent Super Admin account based on .env credentials.
 * Only creates/updates if credentials have actually changed — does NOT overwrite
 * the production password on every restart.
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
      // Only update the password if it has actually changed
      // This prevents overwriting a hardened production password with a stale .env value
      const passwordChanged = !(await bcrypt.compare(password, user.password));

      let needsUpdate = false;

      if (passwordChanged) {
        user.password = password; // beforeUpdate hook will hash it
        needsUpdate = true;
        console.info('🔑 Default Admin password updated (env change detected).');
      }

      if (user.username !== username.toLowerCase().trim()) {
        user.username = username.toLowerCase().trim();
        needsUpdate = true;
      }

      if (user.role !== UserRole.DEVELOPER) {
        user.role = UserRole.DEVELOPER;
        needsUpdate = true;
      }

      if (!user.isActive) {
        user.isActive = true;
        needsUpdate = true;
      }

      if (!user.emailVerified) {
        user.emailVerified = true;
        needsUpdate = true;
      }

      if (needsUpdate) {
        await user.save();
        console.info('✅ Default Admin account updated successfully.');
      } else {
        console.info('✅ Default Admin account is up to date. No changes needed.');
      }
    }
  } catch (error) {
    console.error('❌ Error seeding Default Admin:', error);
  }
};

export default seedSuperAdmin;
