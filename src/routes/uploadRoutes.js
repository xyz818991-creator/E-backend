import express from 'express';
import {
  uploadSingle,
  uploadMultiple,
  getSyncStatus,
  retrySyncEndpoint,
  migrateCloudinaryToLocalEndpoint,
  testCloudinaryEndpoint,
  deleteImageEndpoint
} from '../controllers/uploadController.js';
import { upload } from '../middleware/uploadMiddleware.js';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js';

export const createUploadRouter = (models) => {
  const router = express.Router();

  // Diagnostic route for storage status
  router.get('/status', (req, res) => {
    return res.json({ success: true, storage: 'local' });
  });

  // Admin test connection endpoint (legacy compatibility)
  router.post('/test-connection', testCloudinaryEndpoint);

  // Storage & Cloudinary Sync Status (Phase 4 & 6)
  router.get('/sync-status', authenticateToken, requireAdmin, getSyncStatus(models));

  // Manually retry failed or pending syncs (Phase 4)
  router.post('/sync-retry', authenticateToken, requireAdmin, retrySyncEndpoint(models));

  // Migrate existing Cloudinary images to local storage (Phase 7)
  router.post('/migrate-to-local', authenticateToken, requireAdmin, migrateCloudinaryToLocalEndpoint(models));

  // Public file upload for customer reviews & feedback (local-first)
  router.post('/public', upload.single('image'), uploadSingle(models));

  // Admin file uploads (local-first with background Cloudinary sync)
  router.post('/', authenticateToken, requireAdmin, upload.single('image'), uploadSingle(models));
  router.post('/single', authenticateToken, requireAdmin, upload.single('image'), uploadSingle(models));
  router.post('/multiple', authenticateToken, requireAdmin, upload.array('images', 10), uploadMultiple(models));

  // Delete image endpoint (Phase 8: safe local + DB + cloud deletion)
  router.delete('/', authenticateToken, requireAdmin, deleteImageEndpoint(models));
  router.post('/delete', authenticateToken, requireAdmin, deleteImageEndpoint(models));

  return router;
};
