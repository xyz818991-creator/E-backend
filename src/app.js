import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { createAuthRouter } from './routes/authRoutes.js';
import { createProductRouter } from './routes/productRoutes.js';
import { createCategoryRouter } from './routes/categoryRoutes.js';
import { createBannerRouter } from './routes/bannerRoutes.js';
import { createOrderRouter } from './routes/orderRoutes.js';
import { createCouponRouter } from './routes/couponRoutes.js';
import { createPaymentRouter } from './routes/paymentRoutes.js';
import { createAdminRouter } from './routes/adminRoutes.js';
import { createUploadRouter } from './routes/uploadRoutes.js';
import { createReviewRouter } from './routes/reviewRoutes.js';
import { createInquiryRouter } from './routes/inquiryRoutes.js';
import { createNotificationRouter } from './routes/notificationRoutes.js';
import { getStoreSettings } from './controllers/adminController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createApp = (models) => {
  const app = express();

  // Middleware
  app.use(cors({
    origin: (origin, callback) => callback(null, true),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'x-upload-folder',
      'X-Requested-With',
      'Cache-Control',
      'Pragma',
      'Expires',
      'Accept',
      'Origin'
    ]
  }));
  app.options('*', cors());
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // Ensure uploads directory exists on disk so static serving never throws ENOENT
  const uploadDir = path.resolve(__dirname, '../uploads');
  if (!fs.existsSync(uploadDir)) {
    try {
      fs.mkdirSync(uploadDir, { recursive: true });
    } catch (e) {}
  }

  // Serve static uploaded media files from local disk
  app.use('/uploads', express.static(uploadDir, {
    maxAge: '7d',
    index: false,
    fallthrough: true
  }));

  // Clean 404 for missing media files without throwing an internal server error
  app.use('/uploads', (req, res) => {
    res.status(404).json({ success: false, message: 'Media asset not found.' });
  });

  // Prevent caching of dynamic API data so Admin updates reflect immediately on all devices
  app.use('/api', (req, res, next) => {
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store'
    });
    next();
  });

  // Root health & diagnostic check for Railway container monitoring
  app.get('/', (req, res) => {
    res.json({
      status: 'healthy',
      app: 'Vwalah E-Commerce API',
      message: 'Vwalah backend API is running successfully.',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    });
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      app: 'Vwalah E-Commerce API',
      timestamp: new Date().toISOString()
    });
  });

  // Public store settings (contact email, phone, working hours, brand narrative)
  app.get('/api/settings', getStoreSettings(models));

  // Mount API Routers (Passing models for local-first image tracking)
  app.use('/api/admin/uploads', createUploadRouter(models));
  app.use('/api/uploads', createUploadRouter(models));
  app.use('/api/admin', createAdminRouter(models));
  app.use('/api/auth', createAuthRouter(models));
  app.use('/api/products', createProductRouter(models));
  app.use('/api/categories', createCategoryRouter(models));
  app.use('/api/banners', createBannerRouter(models));
  app.use('/api/orders', createOrderRouter(models));
  app.use('/api/coupons', createCouponRouter(models));
  app.use('/api/payments', createPaymentRouter(models));
  app.use('/api/reviews', createReviewRouter(models));
  app.use('/api/inquiries', createInquiryRouter(models));
  app.use('/api/notifications', createNotificationRouter(models));
  app.use('/api/admin/notifications', createNotificationRouter(models));

  // 404 handler for unknown API routes
  app.use('/api/*', (req, res) => {
    res.status(404).json({ success: false, message: `Endpoint ${req.originalUrl} not found.` });
  });

  // Global error handler
  app.use((err, req, res, next) => {
    if (err.code === 'ENOENT' || err.statusCode === 404 || err.status === 404) {
      return res.status(404).json({
        success: false,
        message: 'The requested resource was not found.'
      });
    }
    console.error('Express Error Handler:', err);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Internal Server Error'
    });
  });

  return app;
};

