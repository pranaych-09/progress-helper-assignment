import express from 'express';
import { getAllEmployees, createEmployee, updateEmployee, getEmployeesWithFilters, deleteEmployee, getEmployeeById } from '../controllers/employee.controller';
import { profilePicUpload } from '../config/multerProfilePic';
import { upload } from '../config/multer';

const router = express.Router();


router.get('/', getEmployeesWithFilters);

router.get('/get/:empID', getEmployeeById);

router.post('/', upload.fields([
  { name: 'profilePicture', maxCount: 1 },
  { name: 'documents', maxCount: 5 },
  { name: 'kyc', maxCount: 1 }
]), createEmployee);

router.put('/:empID', upload.fields([
  { name: 'profilePicture', maxCount: 1 },
  { name: 'kyc', maxCount: 1 }
]), updateEmployee);

router.delete('/:empID', deleteEmployee);

export default router;
