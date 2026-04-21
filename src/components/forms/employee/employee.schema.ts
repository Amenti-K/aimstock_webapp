import { z } from "zod";

const phoneRegex = /^(09[0-9]{8}|07[0-9]{8}|\+2519[0-9]{8}|\+2517[0-9]{8})$/;

const baseEmployeeSchema = {
  name: z.string().min(2, "Name is required"),
  phoneNumber: z
    .string()
    .regex(phoneRegex, "Enter a valid Ethiopian phone number"),
  roleId: z.string(),
};

export const createEmployeeSchema = z.object({
  ...baseEmployeeSchema,
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const updateEmployeeSchema = z.object({
  ...baseEmployeeSchema,
});

export const resetPasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type CreateEmployeeFormValues = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeFormValues = z.infer<typeof updateEmployeeSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
