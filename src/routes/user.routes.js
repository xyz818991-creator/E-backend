import express from 'express';
import { getUserProfile, updateUserProfile } from '../controllers/user.controller.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

export const createUserRouter = (models) => {
  const router = express.Router();
  router.get('/profile', authenticateToken, getUserProfile(models));
  router.put('/profile', authenticateToken, updateUserProfile(models));
  return router;
};

export default createUserRouter;

