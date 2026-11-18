import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { initDatabase } from './config/database.js';
import { defineModels } from './models/index.js';
import { seedDatabase } from './utils/seed.js';
import { createApp } from './app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const PORT = process.env.PORT || 5000;

export async function autoMigrateSchema(sequelize) {
  try {
    const dialect = sequelize.getDialect();
    if (dialect === 'mysql') {
      console.log('🔄 [DB Migration] Checking MySQL schema for missing columns...');
      try {
        const [columns] = await sequelize.query("SHOW COLUMNS FROM `products`");
        const colNames = new Set(columns.map((c) => c.Field));

        const productCols = [
          { name: 'material', sql: 'VARCHAR(120) NULL DEFAULT "24K Antique Matte Gold Plating"' },
          { name: 'colour', sql: 'VARCHAR(80) NULL DEFAULT "Antique Gold & Ruby"' },
          { name: 'occasion', sql: 'VARCHAR(100) NULL DEFAULT "Bridal & Festive"' },
          { name: 'collection_type', sql: 'VARCHAR(100) NULL DEFAULT "Temple Heritage"' },
          { name: 'weight', sql: 'VARCHAR(50) NULL DEFAULT "85 grams"' },
          { name: 'dimensions', sql: 'VARCHAR(100) NULL DEFAULT "Standard Adjustable"' },
          { name: 'rating', sql: 'DECIMAL(3, 1) NULL DEFAULT 4.8' },
          { name: 'reviews_count', sql: 'INT NULL DEFAULT 50' },
          { name: 'is_featured', sql: 'TINYINT(1) NULL DEFAULT 0' },
          { name: 'is_published', sql: 'TINYINT(1) NULL DEFAULT 1' }
        ];

        for (const col of productCols) {
          if (!colNames.has(col.name)) {
            console.log(`✓ [DB Migration] Adding missing column \`${col.name}\` to \`products\` table...`);
            await sequelize.query(`ALTER TABLE \`products\` ADD COLUMN \`${col.name}\` ${col.sql}`);
          }
        }

        try {
          const [imgCols] = await sequelize.query("SHOW COLUMNS FROM `product_images`");
          const imgColNames = new Set(imgCols.map((c) => c.Field));
          if (!imgColNames.has('public_id')) {
            await sequelize.query('ALTER TABLE `product_images` ADD COLUMN `public_id` VARCHAR(255) NULL');
          }
          if (!imgColNames.has('local_path')) {
            await sequelize.query('ALTER TABLE `product_images` ADD COLUMN `local_path` TEXT NULL');
          }
          if (!imgColNames.has('stored_filename')) {
            await sequelize.query('ALTER TABLE `product_images` ADD COLUMN `stored_filename` VARCHAR(255) NULL');
          }
          if (!imgColNames.has('cloudinary_url')) {
            await sequelize.query('ALTER TABLE `product_images` ADD COLUMN `cloudinary_url` TEXT NULL');
          }
          if (!imgColNames.has('sync_status')) {
            await sequelize.query("ALTER TABLE `product_images` ADD COLUMN `sync_status` ENUM('pending', 'synced', 'failed') DEFAULT 'synced'");
          }
        } catch (imgErr) { }

        try {
          await sequelize.query(`
            CREATE TABLE IF NOT EXISTS \`media_files\` (
              \`id\` INT AUTO_INCREMENT PRIMARY KEY,
              \`product_id\` INT NULL,
              \`category_id\` INT NULL,
              \`banner_id\` INT NULL,
              \`folder\` VARCHAR(50) DEFAULT 'products',
              \`original_filename\` VARCHAR(255) NOT NULL,
              \`stored_filename\` VARCHAR(255) NOT NULL UNIQUE,
              \`local_path\` VARCHAR(500) NOT NULL,
              \`cloudinary_url\` TEXT NULL,
              \`cloudinary_public_id\` VARCHAR(255) NULL,
              \`file_size\` INT NULL,
              \`mime_type\` VARCHAR(100) NULL,
              \`local_status\` ENUM('saved', 'missing') DEFAULT 'saved',
              \`sync_status\` ENUM('pending', 'synced', 'failed') DEFAULT 'pending',
              \`sync_attempts\` INT DEFAULT 0,
              \`sync_error\` TEXT NULL,
              \`last_sync_at\` DATETIME NULL,
              \`createdAt\` DATETIME NOT NULL,
              \`updatedAt\` DATETIME NOT NULL,
              INDEX \`idx_media_stored\` (\`stored_filename\`),
              INDEX \`idx_media_sync\` (\`sync_status\`),
              INDEX \`idx_media_folder\` (\`folder\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
          `);
        } catch (mediaErr) { }

        try {
          const [revCols] = await sequelize.query("SHOW COLUMNS FROM `reviews`");
          const revColNames = new Set(revCols.map((c) => c.Field));
          if (!revColNames.has('location')) {
            await sequelize.query('ALTER TABLE `reviews` ADD COLUMN `location` VARCHAR(100) NULL DEFAULT "Verified Patron"');
          }
          if (!revColNames.has('product_name')) {
            await sequelize.query('ALTER TABLE `reviews` ADD COLUMN `product_name` VARCHAR(150) NULL');
          }
          if (!revColNames.has('image_url')) {
            await sequelize.query('ALTER TABLE `reviews` ADD COLUMN `image_url` TEXT NULL');
          }
          if (!revColNames.has('title')) {
            await sequelize.query('ALTER TABLE `reviews` ADD COLUMN `title` VARCHAR(255) NULL AFTER `customer_name`');
          }
          if (!revColNames.has('images')) {
            await sequelize.query('ALTER TABLE `reviews` ADD COLUMN `images` JSON NULL AFTER `image_url`');
          }
          await sequelize.query('ALTER TABLE `reviews` MODIFY COLUMN `product_id` INT NULL');
        } catch (revErr) {
          // reviews table will be created by sync if not present
        }

        try {
          const [ordCols] = await sequelize.query("SHOW COLUMNS FROM `orders`");
          const ordColNames = new Set(ordCols.map((c) => c.Field));
          if (!ordColNames.has('cancellation_reason')) {
            await sequelize.query('ALTER TABLE `orders` ADD COLUMN `cancellation_reason` VARCHAR(255) NULL');
          }
          if (!ordColNames.has('cancelled_at')) {
            await sequelize.query('ALTER TABLE `orders` ADD COLUMN `cancelled_at` DATETIME NULL');
          }
        } catch (ordErr) { }

        console.log('✓ [DB Migration] MySQL columns verified.');
      } catch (tableErr) {
        // Table may not exist yet, sync will create it
      }
    } else if (dialect === 'sqlite') {
      try {
        const [prodCols] = await sequelize.query("PRAGMA table_info(products);");
        const prodColNames = new Set(prodCols.map((c) => c.name));
        const sqliteProductCols = [
          { name: 'material', sql: 'VARCHAR(120) DEFAULT "24K Antique Matte Gold Plating"' },
          { name: 'colour', sql: 'VARCHAR(80) DEFAULT "Antique Gold & Ruby"' },
          { name: 'occasion', sql: 'VARCHAR(100) DEFAULT "Bridal & Festive"' },
          { name: 'collection_type', sql: 'VARCHAR(100) DEFAULT "Temple Heritage"' },
          { name: 'weight', sql: 'VARCHAR(50) DEFAULT "85 grams"' },
          { name: 'dimensions', sql: 'VARCHAR(100) DEFAULT "Standard Adjustable"' },
          { name: 'rating', sql: 'DECIMAL(3, 1) DEFAULT 4.8' },
          { name: 'reviews_count', sql: 'INT DEFAULT 50' },
          { name: 'is_featured', sql: 'BOOLEAN DEFAULT 0' },
          { name: 'is_published', sql: 'BOOLEAN DEFAULT 1' }
        ];
        for (const col of sqliteProductCols) {
          if (prodCols.length > 0 && !prodColNames.has(col.name)) {
            await sequelize.query(`ALTER TABLE products ADD COLUMN ${col.name} ${col.sql};`);
          }
        }

        const [revCols] = await sequelize.query("PRAGMA table_info(reviews);");
        const revColNames = new Set(revCols.map((c) => c.name));
        if (revCols.length > 0 && !revColNames.has('location')) {
          await sequelize.query("ALTER TABLE reviews ADD COLUMN location VARCHAR(100) DEFAULT 'Verified Patron';");
        }
        if (revCols.length > 0 && !revColNames.has('product_name')) {
          await sequelize.query("ALTER TABLE reviews ADD COLUMN product_name VARCHAR(150);");
        }
        if (revCols.length > 0 && !revColNames.has('image_url')) {
          await sequelize.query("ALTER TABLE reviews ADD COLUMN image_url TEXT;");
        }
      } catch (e) { }
    }

    // Automated cleanup of deprecated categories and hardcoded seed piece on live server deployment
    try {
      const deprecated = "'antique-jewellery', 'american-diamond-jewellery', 'daily-wear-jewellery', 'festive-collections', 'daily-wear', 'american-diamond'";
      await sequelize.query(`DELETE FROM product_images WHERE product_id IN (SELECT id FROM products WHERE slug = 'royal-heritage-necklace-set' OR category_id IN (SELECT id FROM categories WHERE slug IN (${deprecated})))`);
      await sequelize.query(`DELETE FROM products WHERE slug = 'royal-heritage-necklace-set' OR category_id IN (SELECT id FROM categories WHERE slug IN (${deprecated}))`);
      await sequelize.query(`DELETE FROM categories WHERE slug IN (${deprecated})`);
      // Clean up hardcoded dummy admin phone number from live cloud database
      await sequelize.query("UPDATE users SET phone = NULL WHERE email = 'admin@theethnicedit.com' AND phone = '+91 1234456899'");
    } catch (cleanErr) { }
  } catch (err) {
    console.warn('⚠️ [DB Migration Notice]:', err.message);
  }
}

async function bootstrap() {
  try {
    console.log('✨ [Server] Starting Vwalah Full-Stack API...');

    // 1. Initialize DB (MySQL or SQLite fallback)
    const sequelize = await initDatabase();

    // 2. Define Models and Associations
    const models = defineModels(sequelize);

    // 3. Migrate and Sync Tables
    try {
      await sequelize.sync({ alter: true });
    } catch (syncErr) {
      console.warn('Sync alter notice:', syncErr.message);
      await sequelize.sync({ alter: false });
    }
    await autoMigrateSchema(sequelize);
    console.log('✓ [DB] Tables synchronized successfully.');

    // 4. Seed Database with initial data if empty
    await seedDatabase(models);

    // 5. Create Express App
    const app = createApp(models);

    // 6. Start HTTP Server with smart port retry
    const server = app.listen(PORT, () => {
      console.log(`\n======================================================`);
      console.log(`🚀 [Server] Vwalah API running on port ${PORT}`);
      console.log(`📍 REST API URL: http://localhost:${PORT}/api`);
      console.log(`🖼️ Media Uploads: http://localhost:${PORT}/uploads`);
      console.log(`🔐 Admin Login: admin@theethnicedit.com / admin123`);
      console.log(`👤 Customer:    customer@theethnicedit.com / customer123`);
      console.log(`======================================================\n`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        const fallbackPort = Number(PORT) + 1;
        console.warn(`⚠️ [Server] Port ${PORT} in use, switching to port ${fallbackPort}...`);
        app.listen(fallbackPort, () => {
          console.log(`🚀 [Server] Vwalah API running on fallback port ${fallbackPort}`);
        });
      } else {
        console.error('Server error:', err);
      }
    });
  } catch (err) {
    console.error('Fatal Server Boot Error:', err);
    process.exit(1);
  }
}

bootstrap();
