import z from "zod";

export const partnerSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export type PartnerFormValues = z.infer<typeof partnerSchema>;
