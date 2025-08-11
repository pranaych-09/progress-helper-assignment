import express from 'express';
import { upload } from '../config/multer';
import { uploadDocument, getDocumentByName } from '../controllers/document.controller';

const router = express.Router();

// Upload a document for an employee
router.post('/:empID', upload.single('document'), uploadDocument);

// Get a specific document by name
router.get('/:empID/:docName', getDocumentByName);

export default router;
