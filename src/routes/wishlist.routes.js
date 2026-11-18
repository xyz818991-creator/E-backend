import express from 'express';
import { getWishlist, addToWishlist, removeFromWishlist } from '../controllers/wishlist.controller.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

export const createWishlistRouter = (models) => {
  const router = express.Router();
  router.get('/', authenticateToken, getWishlist(models));
  router.post('/', authenticateToken, addToWishlist(models));
  router.delete('/:id', authenticateToken, removeFromWishlist(models));
  return router;
};

export default createWishlistRouter;

