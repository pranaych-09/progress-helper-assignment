import { UploadedFile } from "./file.types";

export interface EmployeeCreate {
    empID: string;
    name: string;
    typeOfService: string;
    organizationName: string;
    languagesKnown: string[];
    gender: string;
    phone: string;
    email: string;
    profilePicture: string;
    documents: UploadedFile[];
    kyc: UploadedFile | null;
}