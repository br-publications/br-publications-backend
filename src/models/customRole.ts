import { DataTypes, Model, Optional } from 'sequelize';

// Role attributes interface
export interface RoleAttributes {
    id: number;
    name: string;
    displayName: string;
    description: string | null;
    isSystemRole: boolean;
    isActive: boolean;
    createdBy: number | null;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface RoleCreationAttributes
    extends Optional<RoleAttributes, 'id' | 'description' | 'isSystemRole' | 'isActive' | 'createdBy'> { }

// Role model
class Role extends Model<RoleAttributes, RoleCreationAttributes> implements RoleAttributes {
    public id!: number;
    public name!: string;
    public displayName!: string;
    public description!: string | null;
    public isSystemRole!: boolean;
    public isActive!: boolean;
    public createdBy!: number | null;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    public static initialize(sequelize: any) {
        Role.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    primaryKey: true,
                    autoIncrement: true,
                },
                name: {
                    type: DataTypes.STRING(100),
                    allowNull: false,
                    unique: true,
                    field: 'name',
                },
                displayName: {
                    type: DataTypes.STRING(100),
                    allowNull: false,
                    field: 'display_name',
                },
                description: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                    field: 'description',
                },
                isSystemRole: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: false,
                    allowNull: false,
                    field: 'is_system_role',
                },
                isActive: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: true,
                    allowNull: false,
                    field: 'is_active',
                },
                createdBy: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                    field: 'created_by',
                },
            },
            {
                sequelize,
                tableName: 'roles',
                timestamps: true,
            }
        );
        return Role;
    }

    public static associate(models: any) {
        Role.belongsToMany(models.Permission, {
            through: models.RolePermission,
            foreignKey: 'roleId',
            otherKey: 'permissionId',
            as: 'permissions',
        });
    }
}

// Permission attributes interface
export interface PermissionAttributes {
    id: number;
    permissionKey: string;
    displayName: string;
    description: string | null;
    category: string;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface PermissionCreationAttributes
    extends Optional<PermissionAttributes, 'id' | 'description' | 'isActive'> { }

// Permission model
class Permission extends Model<PermissionAttributes, PermissionCreationAttributes>
    implements PermissionAttributes {
    public id!: number;
    public permissionKey!: string;
    public displayName!: string;
    public description!: string | null;
    public category!: string;
    public isActive!: boolean;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    public static initialize(sequelize: any) {
        Permission.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    primaryKey: true,
                    autoIncrement: true,
                },
                permissionKey: {
                    type: DataTypes.STRING(100),
                    allowNull: false,
                    unique: true,
                    field: 'permission_key',
                },
                displayName: {
                    type: DataTypes.STRING(100),
                    allowNull: false,
                    field: 'display_name',
                },
                description: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                    field: 'description',
                },
                category: {
                    type: DataTypes.STRING(50),
                    allowNull: false,
                    field: 'category',
                },
                isActive: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: true,
                    allowNull: false,
                    field: 'is_active',
                },
            },
            {
                sequelize,
                tableName: 'permissions',
                timestamps: true,
            }
        );
        return Permission;
    }

    public static associate(models: any) {
        Permission.belongsToMany(models.Role, {
            through: models.RolePermission,
            foreignKey: 'permissionId',
            otherKey: 'roleId',
            as: 'roles',
        });
    }
}

// RolePermission attributes interface
export interface RolePermissionAttributes {
    roleId: number;
    permissionId: number;
    grantedAt: Date;
    grantedBy: number | null;
}

export interface RolePermissionCreationAttributes
    extends Optional<RolePermissionAttributes, 'grantedAt' | 'grantedBy'> { }

// RolePermission junction model
class RolePermission extends Model<RolePermissionAttributes, RolePermissionCreationAttributes>
    implements RolePermissionAttributes {
    public roleId!: number;
    public permissionId!: number;
    public grantedAt!: Date;
    public grantedBy!: number | null;

    public static initialize(sequelize: any) {
        RolePermission.init(
            {
                roleId: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    primaryKey: true,
                    field: 'role_id',
                    references: {
                        model: {
                            tableName: 'roles', // Explicitly point to table name
                        },
                        key: 'id',
                    },
                },
                permissionId: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    primaryKey: true,
                    field: 'permission_id',
                    references: {
                        model: {
                            tableName: 'permissions',
                        },
                        key: 'id',
                    },
                },
                grantedAt: {
                    type: DataTypes.DATE,
                    allowNull: false,
                    defaultValue: DataTypes.NOW,
                    field: 'granted_at',
                },
                grantedBy: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                    field: 'granted_by',
                },
            },
            {
                sequelize,
                tableName: 'role_permissions',
                timestamps: false,
            }
        );
        return RolePermission;
    }
}

// UserCustomRole attributes interface
export interface UserCustomRoleAttributes {
    userId: number;
    roleId: number;
    assignedAt: Date;
    assignedBy: number | null;
}

export interface UserCustomRoleCreationAttributes
    extends Optional<UserCustomRoleAttributes, 'assignedAt' | 'assignedBy'> { }

// UserCustomRole junction model
class UserCustomRole extends Model<UserCustomRoleAttributes, UserCustomRoleCreationAttributes>
    implements UserCustomRoleAttributes {
    public userId!: number;
    public roleId!: number;
    public assignedAt!: Date;
    public assignedBy!: number | null;

    public static initialize(sequelize: any) {
        UserCustomRole.init(
            {
                userId: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    primaryKey: true,
                    field: 'user_id',
                    references: {
                        model: {
                            tableName: 'users',
                        },
                        key: 'id',
                    },
                },
                roleId: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    primaryKey: true,
                    field: 'role_id',
                    references: {
                        model: {
                            tableName: 'roles',
                        },
                        key: 'id',
                    },
                },
                assignedAt: {
                    type: DataTypes.DATE,
                    allowNull: false,
                    defaultValue: DataTypes.NOW,
                    field: 'assigned_at',
                },
                assignedBy: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                    field: 'assigned_by',
                },
            },
            {
                sequelize,
                tableName: 'user_custom_roles',
                timestamps: false,
            }
        );
        return UserCustomRole;
    }
}

export { Role, Permission, RolePermission, UserCustomRole };
