import { Request, Response } from 'express';
import Employee from '../models/employee.model';
import Counter from '../models/counter.model';

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
    // console.log('Generated empID:', empID);
    // console.log('Request body:', req.body);
    // console.log('Files in request:', req.files);
    // console.log('File in request:', req.file);

    const body = req.body || {};
    const name = body.name || '';
    const typeOfService = body.typeOfService || '';
    const organizationName = body.organizationName || '';
    let languagesKnown = body.languagesKnown || [];
    const gender = body.gender || '';
    const phone = body.phone || '';
    const email = body.email || '';

    // If languagesKnown is a string (single value), convert to array
    if (typeof languagesKnown === 'string') {
      languagesKnown = [languagesKnown];
    }

    let profilePicture = '';
    let documents: any[] = [];
    let kyc: any = null;

    if (req.files && !Array.isArray(req.files)) {
      const filesObj = req.files as { [fieldname: string]: Express.Multer.File[] };
      if (filesObj['profilePicture'] && filesObj['profilePicture'][0]) {
        profilePicture = filesObj['profilePicture'][0].path.replace(/\\/g, '/');
      }
      if (filesObj['documents']) {
        documents = filesObj['documents'].map((file: any) => ({
          name: file.originalname,
          path: file.path.replace(/\\/g, '/'),
          originalName: file.originalname
        }));
      }

      if (filesObj['kyc'] && filesObj['kyc'][0]) {
        const file = filesObj['kyc'][0];
        kyc = {
          name: file.originalname,
          path: file.path.replace(/\\/g, '/'),
          originalName: file.originalname
        };
      }
    } else if (req.file) {
      // multer.single()
      profilePicture = req.file.path.replace(/\\/g, '/');
    } else if (req.files && Array.isArray(req.files)) {
      // multer.array()
      documents = (req.files as Express.Multer.File[]).map((file: any) => ({
        name: file.originalname,
        path: file.path.replace(/\\/g, '/'),
        originalName: file.originalname
      }));
    }

    const employeeData = {
      empID,
      name,
      typeOfService,
      organizationName,
      languagesKnown: Array.isArray(languagesKnown) ? languagesKnown : [languagesKnown],
      gender,
      phone,
      email,
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
        originalName: kycFile.originalname
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
    console.log('Updates:', empID, updates);
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
    const vair = (await Employee.find()).length;
    const { empID, name, gender, typeOfService, languages, phone, organizationName,page,limit,sortOption } = req.query;

    const filter: Record<string, any> = {};

    if (empID) {
      filter.empID = empID;
    }

    if (name) {
      filter.name = { $regex: new RegExp(name as string, 'i') }; // case-insensitive partial match
    }

    if (gender) {
      filter.gender = gender;
    }

    if (typeOfService) {
      if (Array.isArray(typeOfService)) {
        filter.typeOfService = { $in: typeOfService };
      } else {
        filter.typeOfService = typeOfService;
      }
    }


    if (phone) {
      filter.phone = phone;
    }

    if (organizationName) {
      if (Array.isArray(organizationName)) {
        filter.organizationName = { $in: organizationName };
      } else {
        filter.organizationName = organizationName;
      }
    }

    if (languages) {
      if (Array.isArray(languages)) {
        filter.languagesKnown = { $all: languages }; // Must know *all* languages
      } else {
        filter.languagesKnown = languages; // Single language match
      }
    }
    const pageNum = parseInt(page as string) || 0;
    const limitNum = parseInt(limit as string) || 5;
    const totalCount = (await Employee.find(filter)).length;

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

    const employees = await Employee.find(filter).sort(sort).skip(pageNum*limitNum).limit(limitNum);
    res.status(200).json({
      data:employees,
      total:vair,
      currtotal : totalCount,
      page:pageNum,
      limit: limitNum
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Search failed' });
  }


};