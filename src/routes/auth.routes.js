import express from 'express';
import { login, register, getMe } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

export const createAuthRouter = (models) => {
  const router = express.Router();
  router.post('/login', login(models));
  router.post('/register', register(models));
  router.get('/me', authenticateToken, getMe(models));
  return router;
};

export default createAuthRouter;

