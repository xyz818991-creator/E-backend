import express from 'express';
import {
  recordSocialClick,
  getAdminNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
} from '../controllers/notificationController.js';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js';

export const createNotificationRouter = (models) => {
  const router = express.Router();

  // Public endpoint for customer click events
  router.post('/social-click', recordSocialClick(models));

  // Admin protected notification endpoints
  router.get('/admin', authenticateToken, requireAdmin, getAdminNotifications(models));
  router.get('/', authenticateToken, requireAdmin, getAdminNotifications(models));
  router.patch('/admin/mark-all-read', authenticateToken, requireAdmin, markAllAsRead(models));
  router.patch('/mark-all-read', authenticateToken, requireAdmin, markAllAsRead(models));
  router.patch('/admin/:id/read', authenticateToken, requireAdmin, markAsRead(models));
  router.patch('/:id/read', authenticateToken, requireAdmin, markAsRead(models));
  router.delete('/admin/:id', authenticateToken, requireAdmin, deleteNotification(models));
  router.delete('/:id', authenticateToken, requireAdmin, deleteNotification(models));

  return router;
};

