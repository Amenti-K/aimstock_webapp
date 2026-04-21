import { z } from "zod";

export const signUpSchema = z
  .object({
    name: z
      .string()
      .min(5, "Name must be at least 5 characters long")
      .nonempty("Name is required"),

    phoneNumber: z
      .string()
      .regex(
        /^(09[0-9]{8}|07[0-9]{8}|\+2519[0-9]{8}|\+2517[0-9]{8})$/,
        "Phone number must be a valid Ethiopian number (e.g. 0912345678 or +251912345678 or 0712345678 or +251712345678)",
      )
      .nonempty("Phone number is required"),

    companyName: z
      .string()
      .min(5, "Company name must be at least 5 characters long")
      .nonempty("Company name is required"),

    password: z
      .string()
      .min(6, "Password must be at least 6 characters long")
      .nonempty("Password is required"),

    confirmPassword: z.string().nonempty("Confirm password is required"),
    acceptedTerms: z
      .boolean()
      .refine((val) => val === true, "You must accept the terms and conditions"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const signInSchema = z.object({
  phoneNumber: z
    .string()
    .regex(
      /^(09[0-9]{8}|07[0-9]{8}|\+2519[0-9]{8}|\+2517[0-9]{8})$/,
      "Phone number must be a valid Ethiopian number (e.g. 0912345678 or +251912345678 0712345678 or +251712345678)",
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

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
