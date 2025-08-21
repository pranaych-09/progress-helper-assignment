import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import Employee from '../models/employee.model';

export const uploadDocument = async (req: Request, res: Response) => {
  try {
    const { empID } = req.params;
    const { name } = req.body;
    const file = req.file;

    if (!file || !name) {
      return res.status(400).json({ message: 'Missing document or name' });
    }

    const employee = await Employee.findOneAndUpdate(
      { empID },
      {
        $push: {
          documents: {
            name,
            path: file.path.replace(/\\/g, '/'), 
            originalName: file.originalname
          }
        }
      },
      { new: true }
    );

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.status(200).json(employee);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Upload failed' });
  }
};

export const getDocumentByName = async (req: Request, res: Response) => {
  try {
    const { empID, docName } = req.params;

    const employee = await Employee.findOne({ empID });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const doc = employee.documents.find(d => d.name === docName);
    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const filePath = path.resolve((doc as { path: string }).path);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File missing on disk' });
    }

    res.sendFile(filePath);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not fetch document' });
  }
};
