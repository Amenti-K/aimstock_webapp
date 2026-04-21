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
    .optional(),
  address: z.string().optional(),
});

// Schema for array of partners (bulk creation)
export const partnersArraySchema = z.object({
  partners: z.array(partnerSchema).min(1, "At least one partner is required"),
});

export type partnerFormValues = z.infer<typeof partnerSchema>;
export type partnerArrayFormValues = z.infer<typeof partnersArraySchema>;
