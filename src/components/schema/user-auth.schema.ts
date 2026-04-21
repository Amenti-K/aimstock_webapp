import { z } from "zod";

export const appSignUpSchema = z
  .object({
    name: z
      .string()
      .min(3, "Name must be at least 3 characters long")
      .nonempty("Name is required"),

    companyName: z
      .string()
      .min(2, "Company Name must be at least 2 characters long")
      .nonempty("Company Name is required"),

    phoneNumber: z
      .string()
      .regex(
        /^(09[0-9]{8}|07[0-9]{8}|\+2519[0-9]{8}|\+2517[0-9]{8})$/,
        "Phone number must be a valid Ethiopian number (e.g. 0912345678 or +251912345678)"
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

    confirmPassword: z.string().nonempty("Confirm password is required"),

    acceptedTerms: z
      .boolean()
      .refine((val) => val === true, {
        message: "You must accept the Terms and Conditions",
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const appSignInSchema = z.object({
  phoneNumber: z
    .string()
    .regex(
      /^(09[0-9]{8}|07[0-9]{8}|\+2519[0-9]{8}|\+2517[0-9]{8})$/,
      "Phone number must be a valid Ethiopian number"
    )
    .nonempty("Phone number is required"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .nonempty("Password is required"),
});

export type AppSignUpInput = z.infer<typeof appSignUpSchema>;
export type AppSignInInput = z.infer<typeof appSignInSchema>;
