import mongoose from 'mongoose';

const { Schema } = mongoose;

const documentSchema = new Schema({
  name: { type: Schema.Types.String },
  path: { type: Schema.Types.String },
});

const kycSchema = new Schema({
  name: { type: Schema.Types.String },
  path: { type: Schema.Types.String },
});

const employeeSchema = new Schema(
  {
    empID: { type: Schema.Types.String, required: true, unique: true },
    name: { type: Schema.Types.String, required: true },

    typeOfService: {
      type: Schema.Types.String,
      enum: ["Cleaning", "Maintenance", "Security", "Driving"],
    },

    organizationName: {
      type: Schema.Types.String,
      enum: ["ASBL", "Inncircles", "A2Z Helpers", "Urban Company"],
      required: true,
    },

    languagesKnown: {
      type: [Schema.Types.String],
      enum: ["English", "Hindi", "Tamil", "Telugu", "Bengali"],
      default: [],
    },

    gender: {
      type: Schema.Types.String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },

    phone: { type: Schema.Types.String, required: true },
    email: { type: Schema.Types.String, required: false },

    documents: [documentSchema],
    kyc: kycSchema,

    profilePicture: {
      type: Schema.Types.String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Employee", employeeSchema);
