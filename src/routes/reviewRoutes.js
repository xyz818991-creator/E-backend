import express from 'express';
import { createReviewController } from '../controllers/reviewController.js';
import { upload } from '../middleware/uploadMiddleware.js';

export const createReviewRouter = (models) => {
  const router = express.Router();
  const controller = createReviewController(models);

  router.get('/', controller.getReviews);
  router.get('/product/:productId', (req, res, next) => {
    req.query.product_id = req.params.productId;
    return controller.getReviews(req, res, next);
  });
  router.post('/', controller.createReview);
  router.post('/upload', upload.array('images', 4), controller.uploadReviewImages);

  return router;
};

