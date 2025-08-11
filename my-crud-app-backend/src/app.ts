import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import employeeRoutes from './routes/employee.routes';
import documentRoutes from './routes/document.routes';

dotenv.config();
const app = express();  

app.use(cors());
app.use(express.json());

app.use('/api/employees', employeeRoutes);
app.use('/api/documents', documentRoutes);

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

export default app;
