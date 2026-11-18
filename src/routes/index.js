import express from 'express';
import { createAuthRouter } from './authRoutes.js';
import { createProductRouter } from './productRoutes.js';
import { createCategoryRouter } from './categoryRoutes.js';
import { createOrderRouter } from './orderRoutes.js';
import { createPaymentRouter } from './paymentRoutes.js';
import { createUploadRouter } from './uploadRoutes.js';
import { createBannerRouter } from './bannerRoutes.js';
import { createCouponRouter } from './couponRoutes.js';
import { createInquiryRouter } from './inquiryRoutes.js';
import { createReviewRouter } from './reviewRoutes.js';
import { createNotificationRouter } from './notificationRoutes.js';
import { createAdminRouter } from './adminRoutes.js';
import { createUserRouter } from './user.routes.js';
import { createStoreRouter } from './store.routes.js';

export const setupRoutes = (app, models) => {
  const apiRouter = express.Router();

  apiRouter.use('/auth', createAuthRouter(models));
  apiRouter.use('/users', createUserRouter(models));
  apiRouter.use('/products', createProductRouter(models));
  apiRouter.use('/categories', createCategoryRouter(models));
  apiRouter.use('/orders', createOrderRouter(models));
  apiRouter.use('/payments', createPaymentRouter(models));
  apiRouter.use('/banners', createBannerRouter(models));
  apiRouter.use('/coupons', createCouponRouter(models));
  apiRouter.use('/inquiries', createInquiryRouter(models));
  apiRouter.use('/reviews', createReviewRouter(models));
  apiRouter.use('/notifications', createNotificationRouter(models));
  apiRouter.use('/admin', createAdminRouter(models));
  apiRouter.use('/admin/uploads', createUploadRouter(models));
  apiRouter.use('/store', createStoreRouter(models));

  app.use('/api', apiRouter);
};

export default setupRoutes;

