import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base upload directory
export const baseUploadDir = path.resolve(__dirname, '../../uploads');

// Subdirectories as required by Phase 2
export const UPLOAD_FOLDERS = ['products', 'categories', 'banners', 'thumbnails', 'reviews', 'returns', 'misc'];

// Ensure all subdirectories exist on startup
export const ensureUploadDirs = () => {
  if (!fs.existsSync(baseUploadDir)) {
    fs.mkdirSync(baseUploadDir, { recursive: true });
  }
  for (const folder of UPLOAD_FOLDERS) {
    const dir = path.join(baseUploadDir, folder);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
};
ensureUploadDirs();

// Helper to sanitize folder name
export const sanitizeFolder = (folderName) => {
  if (!folderName) return 'products';
  const clean = String(folderName).toLowerCase().trim();
  return UPLOAD_FOLDERS.includes(clean) ? clean : 'products';
};

// Storage configuration with dynamic folder routing & UUID naming
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    ensureUploadDirs();
    const folder = sanitizeFolder(req.body?.folder || req.query?.folder || req.headers['x-upload-folder']);
    const targetDir = path.join(baseUploadDir, folder);
    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    // Clean base name: alphanumeric only, max 35 chars
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 35);
    const uuid = crypto.randomUUID();
    const safeFilename = `${base ? base + '_' : ''}${uuid}${ext}`;
    cb(null, safeFilename);
  }
});

// Strict MIME and Extension file filter
const fileFilter = (req, file, cb) => {
  const allowedExtensions = /^\.(jpe?g|png|webp|gif|avif|svg)$/i;
  const allowedMimes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/avif',
    'image/svg+xml'
  ];

  const ext = path.extname(file.originalname).toLowerCase();
  const isExtValid = allowedExtensions.test(ext);
  const isMimeValid = allowedMimes.includes(file.mimetype.toLowerCase());

  if (isExtValid && isMimeValid) {
    return cb(null, true);
  }

  cb(new Error(`Invalid file type. Only JPEG, PNG, WEBP, GIF, AVIF, and SVG images are permitted (received: ${file.mimetype}).`));
};

// Multer upload instances
export const upload = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB max file size
    files: 10 // Max 10 files per request
  },
  fileFilter
});
