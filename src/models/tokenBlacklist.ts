import { DataTypes, Model, Optional } from 'sequelize';

interface TokenBlacklistAttributes {
  id: number;
  token: string;
  userId?: number;
  expiresAt: Date;
  createdAt?: Date;
}

interface TokenBlacklistCreationAttributes extends Optional<TokenBlacklistAttributes, 'id'> { }

class TokenBlacklist extends Model<TokenBlacklistAttributes, TokenBlacklistCreationAttributes> implements TokenBlacklistAttributes {
  public id!: number;
  public token!: string;
  public userId!: number;
  public expiresAt!: Date;
  public readonly createdAt!: Date;

  static initialize(sequelize: any) {
    TokenBlacklist.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        token: {
          type: DataTypes.TEXT,
          allowNull: false,
          unique: true,
        },
        userId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        expiresAt: {
          type: DataTypes.DATE,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: 'token_blacklist',
        timestamps: true,
        updatedAt: false,
        indexes: [
          { fields: ['token'] },
          { fields: ['userId'] },
          { fields: ['expiresAt'] },
        ],
      }
    );

    return TokenBlacklist;
  }
}

export default TokenBlacklist;
