import express from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  adminGetOrders,
  adminUpdateOrderStatus,
  cancelOrder
} from '../controllers/orderController.js';
import { authenticateToken, optionalAuth, requireAdmin } from '../middleware/authMiddleware.js';

export const createOrderRouter = (models) => {
  const router = express.Router();

  // Admin order management (MUST be declared before /:id wildcard)
  router.get('/admin/all', authenticateToken, requireAdmin, adminGetOrders(models));
  router.patch('/admin/:id/status', authenticateToken, requireAdmin, adminUpdateOrderStatus(models));
  router.put('/admin/:id/status', authenticateToken, requireAdmin, adminUpdateOrderStatus(models));
  router.patch('/admin/:id', authenticateToken, requireAdmin, adminUpdateOrderStatus(models));
  router.put('/admin/:id', authenticateToken, requireAdmin, adminUpdateOrderStatus(models));

  // Customer order creation & listing
  router.post('/', optionalAuth, createOrder(models));
  router.get('/my-orders', authenticateToken, getMyOrders(models));

  // Customer order cancellation (pre-packed orders)
  router.post('/:id/cancel', optionalAuth, cancelOrder(models));
  router.patch('/:id/cancel', optionalAuth, cancelOrder(models));

  // Single order lookup by order number or ID
  router.get('/:id', optionalAuth, getOrderById(models));

  return router;
};

