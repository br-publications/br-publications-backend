import { QueryInterface, DataTypes } from 'sequelize';

export const fixPublishedFiles = async (sequelize: any) => {
    const queryInterface: QueryInterface = sequelize.getQueryInterface();

    console.log('🔧 Checking Published Files storage structure...');

    // 1. Create published_files table if not exists
    try {
        await queryInterface.createTable('published_files', {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            file_data: {
                type: DataTypes.BLOB('long'),
                allowNull: false,
            },
            file_name: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            mime_type: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
            file_size: {
                type: DataTypes.BIGINT,
                allowNull: false,
            },
            category: {
                type: DataTypes.STRING(50),
                allowNull: false,
                defaultValue: 'GENERAL',
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            updated_at: {
                type: DataTypes.DATE,
                allowNull: false,
            },
        });
        console.log('✅ Created table: published_files');
    } catch (e: any) {
        if (e.name === 'SequelizeDatabaseError' && e.message.includes('already exists')) {
            console.log('ℹ️ Table published_files already exists.');
        } else {
            console.error('❌ Error creating published_files table:', e.message);
        }
    }

    // 2. Add published_file_id to published_individual_chapters
    try {
        const tableInfo = await queryInterface.describeTable('published_individual_chapters');
        if (!tableInfo.published_file_id) {
            await queryInterface.addColumn('published_individual_chapters', 'published_file_id', {
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: 'published_files',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL',
            });
            console.log('✅ Added column published_file_id to published_individual_chapters');
        } else {
            console.log('ℹ️ Column published_file_id already exists.');
        }
    } catch (e: any) {
        console.error('❌ Error updating published_individual_chapters table:', e.message);
    }
};
