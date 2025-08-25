import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import employeeRoutes from './routes/employee.routes';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();
const app = express();  

app.use(cors());
app.use(express.json());

app.use('/api/employees', employeeRoutes);

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get("/config", (req, res) => {
  res.json({ secretKey: process.env.secretKey }); 
});

app.get('/test-error', (req, res) => {
  throw new Error("Something broke!");
});

app.use(errorHandler);

export default app;