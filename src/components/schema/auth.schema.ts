import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters long")
    .nonempty("Name is required"),

  phoneNumber: z
    .string()
    .regex(
      /^(09[0-9]{8}|07[0-9]{8}|\+2519[0-9]{8}|\+2517[0-9]{8})$/,
      "Phone number must be a valid Ethiopian number (e.g. 0912345678 or +251912345678 or 0712345678 or +251712345678)"
    )
    .nonempty("Phone number is required"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/\d/, "Password must contain at least one number")
    .regex(
      /[!@#$%^&*(),.?":{}|<>]/,
      "Password must contain at least one special character"
    )
    .nonempty("Password is required"),

  isSuper: z.boolean(),
});

export const signInSchema = z.object({
  phoneNumber: z
    .string()
    .regex(
      /^(09[0-9]{8}|07[0-9]{8}|\+2519[0-9]{8}|\+2517[0-9]{8})$/,
      "Phone number must be a valid Ethiopian number (e.g. 0912345678 or +251912345678 0712345678 or +251712345678)"
    )
    .nonempty("Phone number is required"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    // .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    // .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    // .regex(/\d/, "Password must contain at least one number")
    // .regex(
    //   /[!@#$%^&*(),.?":{}|<>]/,
    //   "Password must contain at least one special character"
    // )
    .nonempty("Password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
