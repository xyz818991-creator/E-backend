import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const dataDir = path.resolve(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let sequelize;

// Support standard DB_*, Railway native MYSQL*, and connection strings (MYSQL_URL / DATABASE_URL)
const databaseUrl =
  process.env.MYSQL_URL ||
  process.env.DATABASE_URL ||
  process.env.MYSQL_PRIVATE_URL ||
  process.env.DATABASE_PRIVATE_URL;

const dbDialect = process.env.DB_DIALECT || 'mysql';
const dbHost = process.env.MYSQLHOST || process.env.DB_HOST || '127.0.0.1';
const dbPort = parseInt(process.env.MYSQLPORT || process.env.DB_PORT || '3306', 10);
const dbName = process.env.MYSQLDATABASE || process.env.DB_NAME || 'the_ethnic_edit';
const dbUser = process.env.MYSQLUSER || process.env.DB_USER || 'root';
const dbPassword = process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '';

// Initialize Sequelize with smart Railway + Local fallback
export const initDatabase = async () => {
  // 1. Connection string mode (Railway, Heroku, Render, AWS RDS)
  if (databaseUrl && (databaseUrl.startsWith('mysql://') || databaseUrl.startsWith('mysql2://'))) {
    try {
      console.log('[DB] Connecting to MySQL using connection URL (Railway/Cloud)...');
      sequelize = new Sequelize(databaseUrl, {
        dialect: 'mysql',
        logging: false,
        dialectOptions: {
          connectTimeout: 60000
        },
        pool: {
          max: 10,
          min: 0,
          acquire: 30000,
          idle: 10000
        }
      });
      await sequelize.authenticate();
      console.log('✓ [DB] Connected to Cloud MySQL successfully via URL.');
      return sequelize;
    } catch (urlErr) {
      console.warn('⚠️ [DB] Connection URL failed:', urlErr.message);
    }
  }

  // 2. Standard host/user/password mode (MySQL)
  if (dbDialect === 'mysql') {
    try {
      console.log(`[DB] Attempting MySQL connection to ${dbHost}:${dbPort}/${dbName}...`);

      const mysql = await import('mysql2/promise');
      try {
        const connection = await mysql.createConnection({
          host: dbHost,
          port: dbPort,
          user: dbUser,
          password: dbPassword,
          connectTimeout: 5000
        });
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
        await connection.end();
      } catch (createDbErr) {
        // Some cloud providers (Railway, PlanetScale) do not allow CREATE DATABASE, which is normal
      }

      sequelize = new Sequelize(dbName, dbUser, dbPassword, {
        host: dbHost,
        port: dbPort,
        dialect: 'mysql',
        logging: false,
        dialectOptions: {
          connectTimeout: 60000
        },
        pool: {
          max: 10,
          min: 0,
          acquire: 30000,
          idle: 10000
        }
      });

      await sequelize.authenticate();
      console.log('✓ [DB] Connected to MySQL successfully.');
      return sequelize;
    } catch (mysqlError) {
      console.warn('⚠️ [DB] MySQL connection failed or MySQL service is not running.');
      console.warn(`Reason: ${mysqlError.message}`);
      console.log('⚙️ [DB] Switching automatically to local SQLite database so server can run seamlessly.');
    }
  }

  // 3. Fallback to SQLite
  const sqliteStorage = path.resolve(dataDir, 'the_ethnic_edit.sqlite');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: sqliteStorage,
    logging: false
  });

  await sequelize.authenticate();
  console.log(`✓ [DB] Connected to SQLite database: ${sqliteStorage}`);
  return sequelize;
};

// Default export placeholder until init is called
export const getSequelize = () => sequelize;
export default () => sequelize;
