import { z } from "zod";

// Base schema properties
const baseEmployeeSchema = {
  name: z.string().min(2, "Name is required"),
  phoneNumber: z
    .string()
    .regex(
      /^(09[0-9]{8}|07[0-9]{8}|\+2519[0-9]{8}|\+2517[0-9]{8})$/,
      "Phone number must be a valid Ethiopian number (e.g. 0912345678 or +251912345678 or 0712345678 or +251712345678)",
    )
    .nonempty("Phone number is required"),
  roleId: z.string().optional(),
};

export const createEmployeeSchema = z.object({
  ...baseEmployeeSchema,
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const updateEmployeeSchema = z.object({
  ...baseEmployeeSchema,
  // Password is NOT included in update schema as it's handled separately
  id: z.string().optional(),
});

export const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

export type CreateEmployeeSchema = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeSchema = z.infer<typeof updateEmployeeSchema>;
export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
// Backward compatibility if needed, though better to migrate
export const employeeSchema = createEmployeeSchema;
export type EmployeeFormValues = CreateEmployeeSchema | UpdateEmployeeSchema;
