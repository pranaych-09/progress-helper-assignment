import dotenv from 'dotenv';
dotenv.config();

import mongoose from "mongoose";
import employeeModel from "./models/employee.model";
import { ServiceType } from "./enums/service-type.enum";
import { OrganizationName } from "./enums/organization-name.enum";
import { Language } from "./enums/language.enum";

const genders = ["Male", "Female", "Other"] as const;

function randomItem<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const defaultKYC = {
  name: "Passport.jpg",
  path: "/Users/pranay/Desktop/myprojs/pranay-assignment/progress-helper-assignment/my-crud-app-backend/uploads/documents/1755773853289-Passport.jpg"
};

function generateFakeEmployee(i: number) {
  return {
    empID: `EMP${1000 + i}`,
    name: `Employee ${i}`,
    typeOfService: randomItem(Object.values(ServiceType)),
    organizationName: randomItem(Object.values(OrganizationName)),
    languagesKnown: [randomItem(Object.values(Language))],
    gender: randomItem(genders),
    phone: `98765${String(10000 + i).slice(-5)}`,
    email: `employee${i}@test.com`,
    profilePicture: "",
    documents: [],
    kyc: defaultKYC,
  };
}


async function seedEmployees() {
  try {
      console.log("MONGO_URI is:", process.env.MONGO_URI);
    const uri = process.env.MONGO_URI!.toString();

    await mongoose.connect(uri);
    console.log("Connected to MongoDB");

    const employees = [];
    for (let i = 1; i <= 1000; i++) {
      employees.push(generateFakeEmployee(i));
    }

    await employeeModel.insertMany(employees);
    console.log("Successfully inserted 1000 employees!");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding data:", err);
    process.exit(1);
  }
}

seedEmployees();