import express from 'express';
import { getStoreSettings, updateStoreSettings } from '../controllers/store.controller.js';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js';

export const createStoreRouter = (models) => {
  const router = express.Router();
  router.get('/settings', getStoreSettings(models));
  router.put('/settings', authenticateToken, requireAdmin, updateStoreSettings(models));
  return router;
};

export default createStoreRouter;

