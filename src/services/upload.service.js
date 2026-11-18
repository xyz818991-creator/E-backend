import fs from 'fs';
import path from 'path';

export class UploadService {
  constructor(baseUploadDir) {
    this.baseUploadDir = baseUploadDir;
  }

  deleteLocalFile(relativePath) {
    try {
      const fullPath = path.resolve(this.baseUploadDir, relativePath.replace(/^\/uploads\//, ''));
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        return true;
      }
    } catch (e) {
      console.warn('Failed to delete file:', e.message);
    }
    return false;
  }

  fileExists(relativePath) {
    const fullPath = path.resolve(this.baseUploadDir, relativePath.replace(/^\/uploads\//, ''));
    return fs.existsSync(fullPath);
  }
}

export default UploadService;

