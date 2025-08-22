import mongoose from 'mongoose';


const documentSchema = new mongoose.Schema({
  name: String,
  path: String,
});

const kycSchema = new mongoose.Schema({
  name: String,
  path: String,
});

const employeeSchema = new mongoose.Schema({
  empID: { type: String, required: true, unique: true },
  name: { type: String, required: true },

  typeOfService: {
    type: String,
    enum: ["Cleaning", "Maintenance", "Security", "Driving"], 
  },

  organizationName: {
    type: String,
    enum: ["ASBL", "Inncircles", "A2Z Helpers", "Urban Company"], 
    required: true
  },

  languagesKnown: {
    type: [String],
    enum: ["English", "Hindi", "Tamil", "Telugu", "Bengali"], 
    default: []
  },

  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
    required: true
  },

  phone: { type: String, required: true },
  email: { type: String, required: false },

  documents: [documentSchema],
  kyc: kycSchema,  

  profilePicture: {
    type: String,
    default: ''
  }
}, { timestamps: true });


export default mongoose.model('Employee', employeeSchema);
