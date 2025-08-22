import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import employeeRoutes from './routes/employee.routes';

dotenv.config();
const app = express();  

app.use(cors());
app.use(express.json());

app.use('/api/employees', employeeRoutes);

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));


app.get("/config", (req, res) => {
  res.json({ secretKey: process.env.secretKey }); 
});


export default app;
