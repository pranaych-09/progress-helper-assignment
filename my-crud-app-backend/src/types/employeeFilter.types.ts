export interface EmployeeFilters{
    empId? : string;
    name? : { $regex : RegExp};
    gender? : string;
    typeOfService?: string | {$in : string[]};
    organizationName? : string | {$in :string[]};
    phone? : { $regex : RegExp};
    languagesKnown? : string | {$all : string[]};
}