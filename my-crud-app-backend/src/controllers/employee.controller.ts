import { Request, Response } from 'express';
import Employee from '../models/employee.model';
import Counter from '../models/counter.model';
import { UploadedFile } from '../types/file.types';
import { EmployeeCreate } from '../types/employee.types';
import { EmployeeFilters } from '../types/employeeFilter.types';
import fs from 'fs/promises';

export const getAllEmployees = async (_req: Request, res: Response) => {
  const employees = await Employee.find();
  res.json(employees);
};

export const getEmployeeById = async (req: Request, res: Response) => {
  const { empID } = req.params;
  try {
    const employee = await Employee.findOne({ empID });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json(employee);
  } catch (err) {
    console.error('Error fetching employee:', err);
    res.status(500).json({ message: 'Failed to fetch employee' });
  }
};

const generateEmpID = async (): Promise<string> => {
  const counter = await Counter.findByIdAndUpdate(
    'empID',
    { $inc: { sequence_value: 1 } },
    { new: true, upsert: true }
  );

  return `EMP${counter.sequence_value.toString().padStart(4, '0')}`;
};

export const deleteEmployee = async (req: Request, res: Response) => {
  const { empID } = req.params;

  try {
    const employee = await Employee.findOne({ empID });

    if (!employee) {
      throw new Error("Employee not found");
    }

    const filePaths: string[] = [];
    if (employee.profilePicture) filePaths.push(employee.profilePicture);
    if (employee.kyc) filePaths.push(employee.kyc.path!);
    if (employee.documents?.length) {
      for (const doc of employee.documents){
        filePaths.push(doc.path!);
      }
    };

    for (const filePath of filePaths) {
      try {
        await fs.unlink(filePath);
        console.log(`Deleted file: ${filePath}`);
      } catch (err: any) {
        if (err.code === "ENOENT") {
          console.warn(`File not found, skipping: ${filePath}`);
        } else {
          console.error(`Error deleting ${filePath}:`, err);
        }
      }
    }

    const deleted = await Employee.findOneAndDelete({ empID });

    if (!deleted) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.status(200).json({ message: 'Employee deleted successfully', deleted });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ message: 'Failed to delete employee' });
  }
};

export const createEmployee = async (req: Request, res: Response) => {
  try {
    const empID = await generateEmpID();
    const body = req.body || {};

    let languagesKnown: string[] = [];
    if (Array.isArray(body.languagesKnown)) {
      languagesKnown = body.languagesKnown;
    } else if (typeof body.languagesKnown === 'string') {
      languagesKnown = [body.languagesKnown];
    }

    let profilePicture = '';
    let documents: UploadedFile[] = [];
    let kyc: UploadedFile | null = null;

    if (req.files && !Array.isArray(req.files)) {
      const filesObj = req.files as { [fieldname: string]: Express.Multer.File[] };

      if (filesObj['profilePicture']?.[0]) {
        profilePicture = filesObj['profilePicture'][0].path.replace(/\\/g, '/');
      }

      if (filesObj['documents']) {
        documents = filesObj['documents'].map((file) => ({
          name: file.originalname,
          path: file.path.replace(/\\/g, '/'),
        }));
      }

      if (filesObj['kyc']?.[0]) {
        const file = filesObj['kyc'][0];
        kyc = {
          name: file.originalname,
          path: file.path.replace(/\\/g, '/'),
        };
      }

    } else if (req.file) {
      profilePicture = req.file.path.replace(/\\/g, '/');

    } else if (req.files && Array.isArray(req.files)) {
      documents = req.files.map((file) => ({
        name: file.originalname,
        path: file.path.replace(/\\/g, '/'),
        originalName: file.originalname
      }));
    }

    const employeeData: EmployeeCreate = {
      empID,
      name: body.name || '',
      typeOfService: body.typeOfService || '',
      organizationName: body.organizationName || '',
      languagesKnown,
      gender: body.gender || '',
      phone: body.phone || '',
      email: body.email || '',
      profilePicture,
      documents,
      kyc
    };

    const newEmp = new Employee(employeeData);
    const saved = await newEmp.save();
    res.status(201).json(saved);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create employee' });
  }
};

export const updateEmployee = async (req: Request, res: Response) => {
  const { empID } = req.params;

  try {
    const updates = { ...req.body };

    const filesObj = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };

    if (filesObj?.['profilePicture']?.[0]) {
      updates.profilePicture = filesObj['profilePicture'][0].path.replace(/\\/g, '/');
    }

    if (filesObj?.['kyc']?.[0]) {
      const kycFile = filesObj['kyc'][0];
      updates.kyc = {
        name: kycFile.originalname,
        path: kycFile.path.replace(/\\/g, '/'),
      };
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No valid updates provided' });
    }

    const updated = await Employee.findOneAndUpdate(
      { empID },
      updates,
      { new: true, runValidators: true }
    );
    // console.log('Updates:', empID, updates);
    if (!updated) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    console.log('Updated employee:', updated);
    res.status(200).json(updated);
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ message: 'Failed to update employee' });
  }
};


export const getEmployeesWithFilters = async (req: Request, res: Response) => {
  try {
    const vair = await Employee.countDocuments();
    const { empID, name, gender, typeOfService, languages, phone, organizationName, page, limit, sortOption } = req.query;
    const filter: EmployeeFilters = {};

    if (empID) {
      filter.empId = empID as string;
    }

    if (name) {
      filter.name = { $regex: new RegExp(name as string, 'i') };
    }

    if (gender) {
      filter.gender = gender as string;
    }

    if (typeOfService) {
      if (Array.isArray(typeOfService)) {
        filter.typeOfService = { $in: typeOfService as string[] };
      } else {
        filter.typeOfService = typeOfService as string;
      }
    }

    if (phone) {
      filter.phone = { $regex: new RegExp(phone as string, 'i') };
    }

    if (organizationName) {
      if (Array.isArray(organizationName)) {
        filter.organizationName = { $in: organizationName as string[] };
      } else {
        filter.organizationName = organizationName as string;
      }
    }

    if (languages) {
      if (Array.isArray(languages)) {
        filter.languagesKnown = { $all: languages as string[] };
      } else {
        filter.languagesKnown = languages as string;
      }
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const totalCount = await Employee.countDocuments(filter);

    let sort: Record<string, 1 | -1> = {};
    switch (sortOption) {
      case 'nameAsc':
        sort = { name: 1 };
        break;
      case 'nameDesc':
        sort = { name: -1 };
        break;
      case 'empIDAsc':
        sort = { empID: 1 };
        break;
      case 'empIDDesc':
        sort = { empID: -1 };
        break;
      default:
        sort = { updatedAt: -1 };
    }
    const employees = await Employee.find(filter)
      .sort(sort)
      .skip(pageNum * limitNum)
      .limit(limitNum);

    res.status(200).json({
      data: employees,
      total: vair,
      currtotal: totalCount,
      page: pageNum,
      limit: limitNum
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Search failed' });
  }
};
