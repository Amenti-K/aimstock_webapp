import { EmployeeFormValues } from "@/components/schema/employee.schema";

export interface IEmployee {
  id: string;
  name: string;
  phoneNumber: string;
  role?: string;
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
