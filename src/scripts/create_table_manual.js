
const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
        host: dbConfig.host,
        dialect: dbConfig.dialect,
    }
);

async function createTable() {
    const queryInterface = sequelize.getQueryInterface();

    try {
        await sequelize.authenticate();
        

        
        await queryInterface.createTable('chapter_discussions', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER
            },
            chapter_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'individual_chapters',
                    key: 'id'
                },
                onDelete: 'CASCADE'
            },
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onDelete: 'CASCADE'
            },
            message: {
                type: DataTypes.TEXT,
                allowNull: false
            },
            is_internal: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
                allowNull: false
            },
            created_at: {
                allowNull: false,
                type: DataTypes.DATE,
                defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
            },
            updated_at: {
                allowNull: false,
                type: DataTypes.DATE,
                defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
            }
        });

        
        await queryInterface.addIndex('chapter_discussions', ['chapter_id']);
        await queryInterface.addIndex('chapter_discussions', ['user_id']);

        
        await sequelize.query(
            `INSERT INTO "SequelizeMeta" (name) VALUES ('20260210154600-create-chapter-discussions.js') ON CONFLICT DO NOTHING`
        );

        
    } catch (error) {
        console.error('Error creating table:', error);
    } finally {
        await sequelize.close();
    }
}

createTable();
