import TokenBlacklist from '../models/tokenBlacklist';
import { Op } from 'sequelize';

export const cleanupExpiredTokens = async () => {
  try {
    const deleted = await TokenBlacklist.destroy({
      where: {
        expiresAt: {
          [Op.lt]: new Date(),
        },
      },
    });

    if (deleted > 0) {

    }
  } catch (error) {
    console.error('Error cleaning up expired tokens:', error);
  }
};

// Run cleanup every hour
export const startTokenCleanup = () => {
  // Run immediately on start
  cleanupExpiredTokens();

  // Then run every hour
  setInterval(cleanupExpiredTokens, 60 * 60 * 1000);
};
