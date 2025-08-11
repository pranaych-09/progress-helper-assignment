import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  name: String,
  path: String,
  originalName: String
});

const kycSchema = new mongoose.Schema({
  name: String,
  path: String,
  originalName: String
});

const employeeSchema = new mongoose.Schema({
  empID: { type: String, required: true, unique: true },
  name: String,
  typeOfService: String,
  organizationName: String,
  languagesKnown: [String],
  gender: String,
  phone: String,
  email: String,
  documents: [documentSchema],
  kyc: kycSchema,  
  profilePicture: {
    type: String,
    default: ''
  }
}, { timestamps: true });

export default mongoose.model('Employee', employeeSchema);
