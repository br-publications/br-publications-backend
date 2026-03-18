import { Role, Permission, RolePermission, UserCustomRole } from '../../models/customRole';
import User from '../../models/user';
import {
    getPermissionsByCategory,
    isValidPermission,
    getCategoryDisplayName,
} from '../../constants/permissions';
import { Op } from 'sequelize';

export interface CreateCustomRoleData {
    name: string;
    displayName: string;
    description?: string;
    permissionIds: number[];
    createdBy: number;
}

export interface UpdateCustomRoleData {
    displayName?: string;
    description?: string;
    permissionIds?: number[];
}

export interface CustomRoleWithStats {
    id: number;
    name: string;
    displayName: string;
    description: string | null;
    isSystemRole: boolean;
    isActive: boolean;
    permissionCount: number;
    userCount: number;
    createdAt: Date;
    createdBy: {
        id: number;
        fullName: string;
    } | null;
}

class CustomRoleService {
    /**
     * Get all custom roles (excluding system roles)
     */
    async getAllCustomRoles(): Promise<CustomRoleWithStats[]> {
        const roles = await Role.findAll({
            where: {
                isSystemRole: false,
                isActive: true,
            },
            include: [
                {
                    model: Permission,
                    as: 'permissions',
                    attributes: ['id'],
                    through: { attributes: [] },
                },
            ],
            order: [['createdAt', 'DESC']],
        });

        const rolesWithStats = await Promise.all(
            roles.map(async (role) => {
                const userCount = await UserCustomRole.count({
                    where: { roleId: role.id },
                });

                let createdByUser = null;
                if (role.createdBy) {
                    const user = await User.findByPk(role.createdBy, {
                        attributes: ['id', 'fullName'],
                    });
                    if (user) {
                        createdByUser = {
                            id: user.id,
                            fullName: user.fullName,
                        };
                    }
                }

                return {
                    id: role.id,
                    name: role.name,
                    displayName: role.displayName,
                    description: role.description,
                    isSystemRole: role.isSystemRole,
                    isActive: role.isActive,
                    permissionCount: (role as any).permissions?.length || 0,
                    userCount,
                    createdAt: role.createdAt,
                    createdBy: createdByUser,
                };
            })
        );

        return rolesWithStats;
    }

    /**
     * Get all system roles with stats
     */
    async getAllSystemRoles(): Promise<CustomRoleWithStats[]> {
        const roles = await Role.findAll({
            where: {
                isSystemRole: true,
                isActive: true,
            },
            include: [
                {
                    model: Permission,
                    as: 'permissions',
                    attributes: ['id'],
                    through: { attributes: [] },
                },
            ],
            order: [['id', 'ASC']],
        });

        const rolesWithStats = await Promise.all(
            roles.map(async (role) => {
                // Count users with this system role
                const userCount = await User.count({
                    where: { role: role.name },
                });

                return {
                    id: role.id,
                    name: role.name,
                    displayName: role.displayName,
                    description: role.description,
                    isSystemRole: role.isSystemRole,
                    isActive: role.isActive,
                    permissionCount: (role as any).permissions?.length || 0,
                    userCount,
                    createdAt: role.createdAt,
                    createdBy: null,
                };
            })
        );

        return rolesWithStats;
    }

    /**
     * Get custom role by ID with permissions
     */
    async getCustomRoleById(roleId: number) {
        const role = await Role.findOne({
            where: {
                id: roleId,
                isSystemRole: false,
            },
            include: [
                {
                    model: Permission,
                    as: 'permissions',
                    attributes: ['id', 'permissionKey', 'displayName', 'description', 'category'],
                    through: { attributes: [] },
                },
            ],
        });

        if (!role) {
            throw new Error('Custom role not found');
        }

        const userCount = await UserCustomRole.count({
            where: { roleId: role.id },
        });

        return {
            ...role.toJSON(),
            userCount,
        };
    }

    /**
     * Create a new custom role
     */
    async createCustomRole(data: CreateCustomRoleData): Promise<Role> {
        // Validate role name uniqueness
        const existingRole = await Role.findOne({
            where: { name: data.name },
        });

        if (existingRole) {
            throw new Error('Role name already exists');
        }

        // Validate permissions
        const permissions = await Permission.findAll({
            where: {
                id: { [Op.in]: data.permissionIds },
                isActive: true,
            },
        });

        if (permissions.length !== data.permissionIds.length) {
            throw new Error('Some permissions are invalid or inactive');
        }

        // Create role
        const role = await Role.create({
            name: data.name,
            displayName: data.displayName,
            description: data.description || null,
            isSystemRole: false,
            isActive: true,
            createdBy: data.createdBy,
        });

        // Assign permissions to role
        if (data.permissionIds.length > 0) {
            const rolePermissions = data.permissionIds.map(permissionId => ({
                roleId: role.id,
                permissionId,
                grantedBy: data.createdBy,
                grantedAt: new Date(),
            }));

            await RolePermission.bulkCreate(rolePermissions);
        }

        return role;
    }

    /**
     * Update custom role
     */
    async updateCustomRole(roleId: number, data: UpdateCustomRoleData): Promise<Role> {
        const role = await Role.findOne({
            where: {
                id: roleId,
                isSystemRole: false,
            },
        });

        if (!role) {
            throw new Error('Custom role not found or cannot be modified');
        }

        // Update basic info
        if (data.displayName) role.displayName = data.displayName;
        if (data.description !== undefined) role.description = data.description;

        await role.save();

        // Update permissions if provided
        if (data.permissionIds) {
            // Validate permissions
            const permissions = await Permission.findAll({
                where: {
                    id: { [Op.in]: data.permissionIds },
                    isActive: true,
                },
            });

            if (permissions.length !== data.permissionIds.length) {
                throw new Error('Some permissions are invalid or inactive');
            }

            // Remove old permissions
            await RolePermission.destroy({
                where: { roleId: role.id },
            });

            // Add new permissions
            if (data.permissionIds.length > 0) {
                const rolePermissions = data.permissionIds.map(permissionId => ({
                    roleId: role.id,
                    permissionId,
                    grantedAt: new Date(),
                }));

                await RolePermission.bulkCreate(rolePermissions);
            }
        }

        return role;
    }

    /**
     * Delete custom role (soft delete)
     */
    async deleteCustomRole(roleId: number): Promise<void> {
        const role = await Role.findOne({
            where: {
                id: roleId,
                isSystemRole: false,
            },
        });

        if (!role) {
            throw new Error('Custom role not found or cannot be deleted');
        }

        // Check if any users have this role
        const userCount = await UserCustomRole.count({
            where: { roleId: role.id },
        });

        if (userCount > 0) {
            throw new Error(`Cannot delete role. ${userCount} user(s) are assigned to this role.`);
        }

        // Soft delete
        role.isActive = false;
        await role.save();
    }

    /**
     * Get all permissions grouped by category
     * Returns ONLY safe data for frontend (no permission logic)
     */
    async getPermissionsByCategory() {
        const permissions = await Permission.findAll({
            where: { isActive: true },
            order: [['category', 'ASC'], ['displayName', 'ASC']],
        });

        // Group by category
        const grouped: Record<string, any[]> = {};

        permissions.forEach(permission => {
            if (!grouped[permission.category]) {
                grouped[permission.category] = [];
            }

            grouped[permission.category].push({
                id: permission.id,
                permissionKey: permission.permissionKey,
                displayName: permission.displayName,
                description: permission.description,
                category: permission.category,
            });
        });

        // Format with category display names
        const result = Object.keys(grouped).map(category => ({
            category,
            displayName: getCategoryDisplayName(category),
            permissions: grouped[category],
        }));

        return result;
    }

    /**
     * Assign custom role to user
     */
    async assignRoleToUser(userId: number, roleId: number, assignedBy: number): Promise<void> {
        // Validate role exists and is not a system role
        const role = await Role.findOne({
            where: {
                id: roleId,
                isSystemRole: false,
                isActive: true,
            },
        });

        if (!role) {
            throw new Error('Custom role not found or inactive');
        }

        // Validate user exists
        const user = await User.findByPk(userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Check if already assigned
        const existing = await UserCustomRole.findOne({
            where: { userId, roleId },
        });

        if (existing) {
            throw new Error('User already has this role');
        }

        // Assign role
        await UserCustomRole.create({
            userId,
            roleId,
            assignedBy,
            assignedAt: new Date(),
        });
    }

    /**
     * Remove custom role from user
     */
    async removeRoleFromUser(userId: number, roleId: number): Promise<void> {
        const result = await UserCustomRole.destroy({
            where: { userId, roleId },
        });

        if (result === 0) {
            throw new Error('User does not have this role');
        }
    }

    /**
     * Get user's custom roles with permissions
     */
    async getUserCustomRoles(userId: number) {
        const userRoles = await UserCustomRole.findAll({
            where: { userId },
            include: [
                {
                    model: Role,
                    as: 'role',
                    where: { isActive: true },
                    include: [
                        {
                            model: Permission,
                            as: 'permissions',
                            attributes: ['permissionKey'],
                            through: { attributes: [] },
                        },
                    ],
                },
            ],
        });

        return userRoles;
    }

    /**
     * Get all permissions for a user (system role + custom roles)
     */
    async getUserAllPermissions(userId: number): Promise<string[]> {
        const user = await User.findByPk(userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Get system role permissions
        const systemPermissions = user.getPermissions();

        // Get custom role permissions
        const customRoles = await this.getUserCustomRoles(userId);
        const customPermissions = new Set<string>();

        customRoles.forEach((userRole: any) => {
            userRole.role?.permissions?.forEach((permission: any) => {
                customPermissions.add(permission.permissionKey);
            });
        });

        // Combine and deduplicate
        const allPermissions = new Set([...systemPermissions, ...customPermissions]);

        return Array.from(allPermissions);
    }
}

export default new CustomRoleService();
