import multer from 'multer';
import path from 'path';

// Disk storage configuration
const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, path.join(__dirname, '../../uploads/documents'));
  },
  filename: function (_req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + file.originalname;
    cb(null, uniqueSuffix);
  }
});

export const upload = multer({ storage });
