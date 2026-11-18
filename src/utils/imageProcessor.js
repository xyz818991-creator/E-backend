import path from 'path';

export const sanitizeFileName = (name) => {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
};

export const getFileExtension = (filename) => {
  return path.extname(filename).toLowerCase();
};

export const isImageMimeType = (mime) => {
  return ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif'].includes(mime);
};

