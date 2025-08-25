import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const url = 'mongodb://localhost:27017/employee_crud'
    await mongoose.connect(process.env.MONGO_URI ? process.env.MONGO_URI : url);
    console.log('MongoDB connected');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
