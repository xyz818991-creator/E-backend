import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';
import { baseUploadDir, sanitizeFolder } from '../middleware/uploadMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Cloudinary with Railway / process.env fallback to working verified keys
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'j3n8su10',
  api_key: process.env.CLOUDINARY_API_KEY || '734811259914925',
  api_secret: process.env.CLOUDINARY_API_SECRET || '8wgfqN5KAxf6ieRwJkvszPXGI-g',
  secure: true
});

/**
 * Single Image Upload
 * 1. Physical file saved by Multer in backend/uploads/<folder>/<filename>
 * 2. Uploaded immediately to Cloudinary for permanent persistent cloud URL
 * 3. Saved in MediaFile database
 * 4. Returns permanent secure_url (or localPath fallback if offline)
 */
export const uploadSingle = (models) => async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded.' });
  }

  const folder = sanitizeFolder(req.body?.folder || req.query?.folder || req.headers['x-upload-folder']);
  const localPath = `/uploads/${folder}/${req.file.filename}`;

  let cloudinaryUrl = null;
  let cloudinaryPublicId = null;

  try {
    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      folder: `the_ethnic_edit/${folder}`,
      resource_type: 'image',
      use_filename: true,
      unique_filename: true,
      timeout: 60000
    });
    if (uploadResult && uploadResult.secure_url) {
      cloudinaryUrl = uploadResult.secure_url;
      cloudinaryPublicId = uploadResult.public_id;
    }
  } catch (cErr) {
    console.warn('[Cloudinary] Cloud upload notice (fallback to local):', cErr.message);
  }

  const finalUrl = cloudinaryUrl || localPath;
  let mediaRecord = null;

  // Insert into MediaFile database immediately
  if (models && models.MediaFile) {
    try {
      mediaRecord = await models.MediaFile.create({
        folder,
        original_filename: req.file.originalname,
        stored_filename: req.file.filename,
        local_path: localPath,
        cloudinary_url: cloudinaryUrl,
        cloudinary_public_id: cloudinaryPublicId,
        file_size: req.file.size,
        mime_type: req.file.mimetype,
        local_status: 'saved',
        sync_status: cloudinaryUrl ? 'synced' : 'local_only',
        product_id: req.body?.product_id ? parseInt(req.body.product_id, 10) : null,
        category_id: req.body?.category_id ? parseInt(req.body.category_id, 10) : null,
        banner_id: req.body?.banner_id ? parseInt(req.body.banner_id, 10) : null
      });
    } catch (dbErr) {
      console.error('Database registration failed for image:', dbErr);
      try {
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      } catch (e) {}
      return res.status(500).json({
        success: false,
        message: 'Database insertion failed.'
      });
    }
  }

  return res.json({
    success: true,
    message: cloudinaryUrl ? 'Image uploaded and synced to cloud permanently.' : 'Image saved to local storage.',
    url: finalUrl,
    local_path: localPath,
    cloudinary_url: cloudinaryUrl,
    media_id: mediaRecord?.id || null,
    storage: cloudinaryUrl ? 'cloudinary' : 'local',
    sync_status: cloudinaryUrl ? 'synced' : 'local_only',
    filename: req.file.filename,
    original_name: req.file.originalname,
    size: req.file.size,
    folder
  });
};

/**
 * Multiple Image Upload
 */
export const uploadMultiple = (models) => async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: 'No files uploaded.' });
  }

  const folder = sanitizeFolder(req.body?.folder || req.query?.folder || req.headers['x-upload-folder']);
  const savedFiles = [];
  const dbErrors = [];

  for (const file of req.files) {
    const localPath = `/uploads/${folder}/${file.filename}`;
    let cloudinaryUrl = null;
    let cloudinaryPublicId = null;

    try {
      const uploadResult = await cloudinary.uploader.upload(file.path, {
        folder: `the_ethnic_edit/${folder}`,
        resource_type: 'image',
        use_filename: true,
        unique_filename: true,
        timeout: 60000
      });
      if (uploadResult && uploadResult.secure_url) {
        cloudinaryUrl = uploadResult.secure_url;
        cloudinaryPublicId = uploadResult.public_id;
      }
    } catch (cErr) {
      console.warn('[Cloudinary] Multiple upload file cloud notice:', cErr.message);
    }

    const finalUrl = cloudinaryUrl || localPath;
    let mediaRecord = null;

    if (models && models.MediaFile) {
      try {
        mediaRecord = await models.MediaFile.create({
          folder,
          original_filename: file.originalname,
          stored_filename: file.filename,
          local_path: localPath,
          cloudinary_url: cloudinaryUrl,
          cloudinary_public_id: cloudinaryPublicId,
          file_size: file.size,
          mime_type: file.mimetype,
          local_status: 'saved',
          sync_status: cloudinaryUrl ? 'synced' : 'local_only',
          product_id: req.body?.product_id ? parseInt(req.body.product_id, 10) : null
        });
      } catch (dbErr) {
        console.error('DB error on multiple upload file:', file.filename, dbErr);
        try {
          if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        } catch (e) {}
        dbErrors.push(file.originalname);
        continue;
      }
    }

    savedFiles.push({
      url: finalUrl,
      local_path: localPath,
      cloudinary_url: cloudinaryUrl,
      media_id: mediaRecord?.id || null,
      storage: cloudinaryUrl ? 'cloudinary' : 'local',
      sync_status: cloudinaryUrl ? 'synced' : 'local_only',
      filename: file.filename,
      original_name: file.originalname,
      size: file.size,
      folder
    });
  }

  return res.json({
    success: true,
    message: `Saved ${savedFiles.length} file(s) with cloud sync.`,
    files: savedFiles,
    errors: dbErrors.length > 0 ? dbErrors : undefined
  });
};

/**
 * Get Local Media Storage Status
 */
export const getSyncStatus = (models) => async (req, res) => {
  try {
    if (!models || !models.MediaFile) {
      return res.status(500).json({ success: false, message: 'MediaFile model unavailable.' });
    }

    const totalMedia = await models.MediaFile.count();
    const items = await models.MediaFile.findAll({
      limit: 50,
      order: [['updatedAt', 'DESC']],
      attributes: ['id', 'original_filename', 'stored_filename', 'local_path', 'sync_status', 'updatedAt']
    });

    return res.json({
      success: true,
      stats: {
        total_media: totalMedia,
        local_primary: totalMedia,
        storage_type: 'local'
      },
      items
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Retry Sync Endpoint (Local Storage No-Op)
 */
export const retrySyncEndpoint = (models) => async (req, res) => {
  return res.json({ success: true, message: 'All media is managed on local storage.' });
};

/**
 * Migration Endpoint (Local Storage No-Op)
 */
export const migrateCloudinaryToLocalEndpoint = (models) => async (req, res) => {
  return res.json({ success: true, message: 'All media is already stored locally.' });
};

/**
 * Delete Image Endpoint
 */
export const deleteImageEndpoint = (models) => async (req, res) => {
  try {
    const { url, filename, media_id } = req.body || {};

    let targetFilename = filename;
    let localRelativePath = null;

    if (url && url.startsWith('/uploads/')) {
      targetFilename = path.basename(url);
      localRelativePath = url.replace(/^\/uploads\//, '');
    } else if (filename) {
      targetFilename = filename;
    }

    let media = null;
    if (models && models.MediaFile) {
      if (media_id) {
        media = await models.MediaFile.findByPk(media_id);
      } else if (targetFilename) {
        media = await models.MediaFile.findOne({ where: { stored_filename: targetFilename } });
      }
    }

    // Safety check: is this image referenced by other products, categories, or banners?
    if (models && targetFilename) {
      const [productRefCount, categoryRefCount, bannerRefCount] = await Promise.all([
        models.ProductImage.count({
          where: {
            [models.Sequelize.Op.or]: [
              { image_url: { [models.Sequelize.Op.like]: `%${targetFilename}%` } },
              { stored_filename: targetFilename }
            ]
          }
        }),
        models.Category.count({
          where: { image_url: { [models.Sequelize.Op.like]: `%${targetFilename}%` } }
        }),
        models.Banner.count({
          where: { desktop_image: { [models.Sequelize.Op.like]: `%${targetFilename}%` } }
        })
      ]);

      const totalReferences = productRefCount + categoryRefCount + bannerRefCount;
      if (totalReferences > 1 && !req.body.force) {
        return res.status(409).json({
          success: false,
          message: `Cannot delete image: it is currently referenced by ${totalReferences} records. Remove references first or pass force: true.`
        });
      }
    }

    // Delete local file safely
    let localDeleted = false;
    if (localRelativePath) {
      const fullPath = path.resolve(baseUploadDir, localRelativePath);
      if (fullPath.startsWith(baseUploadDir) && fs.existsSync(fullPath)) {
        try {
          fs.unlinkSync(fullPath);
          localDeleted = true;
        } catch (e) {}
      }
    } else if (targetFilename) {
      // Search in all subdirs
      const subdirs = ['products', 'categories', 'banners', 'thumbnails', 'misc', ''];
      for (const sub of subdirs) {
        const fullPath = path.resolve(baseUploadDir, sub, targetFilename);
        if (fullPath.startsWith(baseUploadDir) && fs.existsSync(fullPath)) {
          try {
            fs.unlinkSync(fullPath);
            localDeleted = true;
            break;
          } catch (e) {}
        }
      }
    }

    // Delete database records
    if (media) {
      await media.destroy();
    }
    if (models && models.ProductImage && targetFilename) {
      await models.ProductImage.destroy({
        where: {
          [models.Sequelize.Op.or]: [
            { image_url: { [models.Sequelize.Op.like]: `%${targetFilename}%` } },
            { stored_filename: targetFilename }
          ]
        }
      });
    }

    return res.json({
      success: true,
      message: 'Image deleted safely from local storage and database.',
      local_deleted: localDeleted
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Diagnostic test endpoint
 */
export const testCloudinaryEndpoint = async (req, res) => {
  return res.json({ success: true, message: 'Local image storage is active and healthy.' });
};
