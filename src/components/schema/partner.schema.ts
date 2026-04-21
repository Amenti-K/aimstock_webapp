import z from "zod";

export const partnerSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "Name is too short",
    })
    .nonempty({ message: "Name is required" }),
  phone: z
    .string()
    // .regex(
    //   /^(09[0-9]{8}|07[0-9]{8}|\+2519[0-9]{8}|\+2517[0-9]{8})$/,
    //   "Phone number must be a valid Ethiopian number (e.g. 0912345678 or +251912345678 0712345678 or +251712345678)",
    // )
    .optional(),
  address: z.string().optional(),
  // isActive: z.boolean(),
});

// Schema for array of partners (bulk creation)
export const partnersArraySchema = z.object({
  partners: z.array(partnerSchema).min(1, "At least one partner is required"),
});

export type partnerFormValues = z.infer<typeof partnerSchema>;
export type partnerArrayFormValues = z.infer<typeof partnersArraySchema>;
