"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var documentSchema = new mongoose_1.default.Schema({
    name: String,
    path: String,
});
var kycSchema = new mongoose_1.default.Schema({
    name: String,
    path: String,
});
var employeeSchema = new mongoose_1.default.Schema({
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
exports.default = mongoose_1.default.model('Employee', employeeSchema);
