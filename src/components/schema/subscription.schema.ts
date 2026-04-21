import { z } from "zod";
import {
  BillingInterval,
  SubscriptionStatus,
} from "../interface/subscription/subscription.interface";

export const subscriptionActionSchema = z
  .object({
    action: z.enum(["CREATE", "ACTIVATE", "EXTEND"]),
    planId: z.string().optional(),
    status: z.nativeEnum(SubscriptionStatus).optional(),
    duration: z.nativeEnum(BillingInterval),
  })
  .superRefine((data, ctx) => {
    // 1. Validation for CREATE action
    if (data.action === "CREATE") {
      if (!data.planId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["planId"],
          message: "Plan is required",
        });
      }

      if (data.status === SubscriptionStatus.ACTIVE && !data.duration) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["duration"],
          message: "Billing duration is required",
        });
      }
    }

    // 2. Validation for ACTIVATE or EXTEND actions
    if (data.action === "ACTIVATE" || data.action === "EXTEND") {
      if (!data.duration) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["duration"],
          message: "Billing duration is required",
        });
      }
    }
  });

export type SubscriptionActionFormValues = z.infer<
  typeof subscriptionActionSchema
>;
