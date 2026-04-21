import { z } from "zod";

export enum Module {
  COMPANY = "COMPANY",
  USER = "USER",
  ROLE = "ROLE",
  // Add other modules as needed
}

export enum Permission {
  CREATE = "CREATE",
  READ = "READ",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
}

export const roleSchema = z.object({
  name: z.string().min(2),
  permissions: z.array(
    z.object({
      module: z.nativeEnum(Module),
      actions: z.array(z.nativeEnum(Permission)),
    })
  ),
});

export type RoleFormValues = z.infer<typeof roleSchema>;
