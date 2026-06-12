import { EmployeeFormValues } from "@/components/schema/employee.schema";
import { IRole } from "../role/role.interface";

export interface IEmployee {
  id: string;
  name: string;
  phoneNumber: string;
  role?: IRole;
  joinedAt: Date;
}

export interface INewEmployee {
  name: string;
  phoneNumber: string;
  password: string;
  roleId?: string;
}

export interface IEmployeeFormProps {
  onEdit?: (values: EmployeeFormValues) => void;
  selectedEmployeeId?: string | null;
}
