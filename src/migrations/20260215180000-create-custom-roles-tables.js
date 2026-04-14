'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        const { DataTypes } = Sequelize;

        // Helper to check if a table exists
        const tableExists = async (tableName) => {
            const tables = await queryInterface.showAllTables();
            return tables.includes(tableName);
        };

        // Create roles table
        if (!await tableExists('roles')) {
            await queryInterface.createTable('roles', {
                id: {
                    type: DataTypes.INTEGER,
                    primaryKey: true,
                    autoIncrement: true,
                },
                name: {
                    type: DataTypes.STRING(100),
                    allowNull: false,
                    unique: true,
                    comment: 'Unique role identifier (e.g., content_manager)',
                },
                display_name: {
                    type: DataTypes.STRING(100),
                    allowNull: false,
                    comment: 'Human-readable role name',
                },
                description: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                    comment: 'Detailed description of the role',
                },
                is_system_role: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: false,
                    allowNull: false,
                    comment: 'True for default system roles (cannot be deleted)',
                },
                is_active: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: true,
                    allowNull: false,
                    comment: 'Whether the role is currently active',
                },
                created_by: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                    references: {
                        model: 'users',
                        key: 'id',
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'SET NULL',
                },
                created_at: {
                    type: DataTypes.DATE,
                    allowNull: false,
                    defaultValue: DataTypes.NOW,
                },
                updated_at: {
                    type: DataTypes.DATE,
                    allowNull: false,
                    defaultValue: DataTypes.NOW,
                },
            });
        }

        // Create permissions table
        if (!await tableExists('permissions')) {
            await queryInterface.createTable('permissions', {
                id: {
                    type: DataTypes.INTEGER,
                    primaryKey: true,
                    autoIncrement: true,
                },
                permission_key: {
                    type: DataTypes.STRING(100),
                    allowNull: false,
                    unique: true,
                    comment: 'Permission identifier (e.g., user:create)',
                },
                display_name: {
                    type: DataTypes.STRING(100),
                    allowNull: false,
                    comment: 'Human-readable permission name',
                },
                description: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                    comment: 'Detailed description of the permission',
                },
                category: {
                    type: DataTypes.STRING(50),
                    allowNull: false,
                    comment: 'Permission category for grouping',
                },
                is_active: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: true,
                    allowNull: false,
                    comment: 'Whether the permission is currently active',
                },
                created_at: {
                    type: DataTypes.DATE,
                    allowNull: false,
                    defaultValue: DataTypes.NOW,
                },
                updated_at: {
                    type: DataTypes.DATE,
                    allowNull: false,
                    defaultValue: DataTypes.NOW,
                },
            });
        }

        // Create role_permissions junction table
        if (!await tableExists('role_permissions')) {
            await queryInterface.createTable('role_permissions', {
                role_id: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    primaryKey: true,
                    references: {
                        model: 'roles',
                        key: 'id',
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE',
                },
                permission_id: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    primaryKey: true,
                    references: {
                        model: 'permissions',
                        key: 'id',
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE',
                },
                granted_at: {
                    type: DataTypes.DATE,
                    allowNull: false,
                    defaultValue: DataTypes.NOW,
                },
                granted_by: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                    references: {
                        model: 'users',
                        key: 'id',
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'SET NULL',
                },
            });
        }

        // Create user_custom_roles table
        if (!await tableExists('user_custom_roles')) {
            await queryInterface.createTable('user_custom_roles', {
                user_id: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    primaryKey: true,
                    references: {
                        model: 'users',
                        key: 'id',
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE',
                },
                role_id: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    primaryKey: true,
                    references: {
                        model: 'roles',
                        key: 'id',
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE',
                },
                assigned_at: {
                    type: DataTypes.DATE,
                    allowNull: false,
                    defaultValue: DataTypes.NOW,
                },
                assigned_by: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                    references: {
                        model: 'users',
                        key: 'id',
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'SET NULL',
                },
            });
        }

        // Add indexes for better query performance (wrapped in try/catch to handle "already exists")
        try { await queryInterface.addIndex('roles', ['is_system_role', 'is_active']); } catch (e) {}
        try { await queryInterface.addIndex('permissions', ['category', 'is_active']); } catch (e) {}
        try { await queryInterface.addIndex('role_permissions', ['role_id']); } catch (e) {}
        try { await queryInterface.addIndex('role_permissions', ['permission_id']); } catch (e) {}
        try { await queryInterface.addIndex('user_custom_roles', ['user_id']); } catch (e) {}
        try { await queryInterface.addIndex('user_custom_roles', ['role_id']); } catch (e) {}
    },

    down: async (queryInterface, Sequelize) => {
        // Drop tables in reverse order (respecting foreign keys)
        await queryInterface.dropTable('user_custom_roles');
        await queryInterface.dropTable('role_permissions');
        await queryInterface.dropTable('permissions');
        await queryInterface.dropTable('roles');
    },
};
