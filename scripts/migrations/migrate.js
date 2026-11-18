import { sequelize } from '../../src/config/database.js';

export const runMigrations = async () => {
  try {
    await sequelize.authenticate();
    console.log('[Migration] Database connected successfully.');
    await sequelize.sync({ alter: false });
    console.log('[Migration] Database schema synchronized.');
    process.exit(0);
  } catch (error) {
    console.error('[Migration] Failed:', error.message);
    process.exit(1);
  }
};

runMigrations();

