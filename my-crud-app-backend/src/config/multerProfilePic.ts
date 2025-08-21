import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadPath = path.join(__dirname, '../../uploads/profile-pics');

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true }); 
    }
    cb(null, uploadPath);
  },
  filename: function (_req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

export const profilePicUpload = multer({ storage });
