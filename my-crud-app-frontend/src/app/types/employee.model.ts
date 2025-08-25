export interface Employee {
  empID: string;
  name: string;
  typeOfService: string;
  organizationName: string;
  languagesKnown: string[];
  gender: string;
  phone: string;
  email: string;
  profilePicture?: string;
  documents?: string[];
}
