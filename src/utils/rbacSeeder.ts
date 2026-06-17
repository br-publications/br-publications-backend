import { Role, Permission, RolePermission } from '../models/customRole';
import { PERMISSIONS, DEFAULT_ROLE_PERMISSIONS } from '../constants/permissions';
import { UserRole } from '../models/user';

export const seedRBAC = async () => {
  try {
    console.info('🔄 Seeding/Syncing Roles and Permissions...');

    // 1. Sync permissions
    const permissionKeyToIdMap: Record<string, number> = {};
    for (const [key, pDef] of Object.entries(PERMISSIONS)) {
      const [permission, created] = await Permission.findOrCreate({
        where: { permissionKey: key },
        defaults: {
          permissionKey: key,
          displayName: pDef.displayName,
          description: pDef.description,
          category: pDef.category,
          isActive: true,
        },
      });

      if (!created) {
        permission.displayName = pDef.displayName;
        permission.description = pDef.description;
        permission.category = pDef.category;
        await permission.save();
      }
      permissionKeyToIdMap[key] = permission.id;
    }
    console.info(`✅ Synced ${Object.keys(PERMISSIONS).length} permissions.`);

    // 2. Sync default system roles
    const systemRoles = Object.values(UserRole);
    for (const roleName of systemRoles) {
      // Create role display name (capitalize first letter)
      const displayName = roleName.charAt(0).toUpperCase() + roleName.slice(1);
      
      const [role, created] = await Role.findOrCreate({
        where: { name: roleName, isSystemRole: true },
        defaults: {
          name: roleName,
          displayName,
          description: `Default system role for ${displayName}s`,
          isSystemRole: true,
          isActive: true,
          createdBy: null,
        },
      });

      if (!created) {
        // Ensure standard attributes are correct
        role.displayName = displayName;
        role.isActive = true;
        await role.save();
      }

      // Sync role permissions
      const expectedKeys = DEFAULT_ROLE_PERMISSIONS[roleName] || [];
      const expectedIds = expectedKeys
        .map(key => permissionKeyToIdMap[key])
        .filter(id => id !== undefined);

      // Delete existing permission mappings for this system role
      await RolePermission.destroy({
        where: { roleId: role.id },
      });

      // Add new permissions
      if (expectedIds.length > 0) {
        const rolePermissions = expectedIds.map(permissionId => ({
          roleId: role.id,
          permissionId,
          grantedAt: new Date(),
          grantedBy: null,
        }));
        await RolePermission.bulkCreate(rolePermissions);
      }
      console.info(`✅ Synced system role "${roleName}" with ${expectedIds.length} permissions.`);
    }

    console.info('✨ RBAC seeding/sync completed successfully.');
  } catch (error) {
    console.error('❌ Error seeding RBAC:', error);
  }
};

export default seedRBAC;
