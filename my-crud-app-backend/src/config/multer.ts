
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const documentsPath = path.join(__dirname, '../../uploads/documents');

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    if (!fs.existsSync(documentsPath)) {
      fs.mkdirSync(documentsPath, { recursive: true });
    }
    cb(null, documentsPath);
  },
  filename: function (_req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + file.originalname;
    cb(null, uniqueSuffix);
  }
});

export const upload = multer({ storage });

