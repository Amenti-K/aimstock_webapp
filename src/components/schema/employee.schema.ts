import { z } from "zod";

export const employeeSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phoneNumber: z
    .string()
    .min(10, "Phone number must be at least 10 characters"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional(), // Optional for edit
  roleId: z.string().optional(),
});

export type EmployeeFormValues = z.infer<typeof employeeSchema>;
