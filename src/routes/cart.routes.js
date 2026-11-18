import express from 'express';
import { getCart, addToCart, updateCartItem, removeFromCart } from '../controllers/cart.controller.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

export const createCartRouter = (models) => {
  const router = express.Router();
  router.get('/', authenticateToken, getCart(models));
  router.post('/', authenticateToken, addToCart(models));
  router.put('/', authenticateToken, updateCartItem(models));
  router.delete('/:id', authenticateToken, removeFromCart(models));
  return router;
};

export default createCartRouter;

