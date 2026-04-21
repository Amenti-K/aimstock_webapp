import { z } from "zod";
import {
  BillingInterval,
  FeatureKey,
  LimitMetric,
} from "@/components/interface/subscription/subscription.interface";

export const planLimitSchema = z.object({
  metric: z.nativeEnum(LimitMetric, {
    message: "Limit metric is required",
  }),
  value: z.coerce
    .number({ message: "Limit value must be a number" })
    .int("Limit must be an integer")
    .min(0, "Limit cannot be negative")
    .nullable(),
});

export const planFeatureSchema = z.object({
  feature: z.nativeEnum(FeatureKey, {
    message: "Feature key is required",
  }),
  enabled: z.boolean(),
});

export const planPriceSchema = z.object({
  amount: z.coerce
    .number({ message: "Price amount is required" })
    .min(0, "Price cannot be negative"),
  currency: z.string().min(1, "Currency is required"),
  interval: z.nativeEnum(BillingInterval, {
    message: "Billing interval is required",
  }),
});

export const planSchema = z
  .object({
    name: z
      .string({ message: "Plan name is required" })
      .min(2, "Plan name must be at least 2 characters"),
    description: z.string().optional(),
    isEnterprise: z.boolean(),
    limits: z.array(planLimitSchema),
    features: z
      .array(planFeatureSchema)
      .min(1, "At least one feature is required"),
    prices: z
      .array(planPriceSchema)
      .min(3, "At least three price (3, 6 and 12 months) is required"),
  })
  .superRefine((data, ctx) => {
    // Ensure unique limit metrics
    const limitMetrics = data.limits.map((l) => l.metric);
    if (new Set(limitMetrics).size !== limitMetrics.length) {
      ctx.addIssue({
        path: ["limits"],
        message: "Each limit metric must be unique",
        code: z.ZodIssueCode.custom,
      });
    }

    // Ensure unique billing intervals
    const intervals = data.prices.map((p) => p.interval);
    if (new Set(intervals).size !== intervals.length) {
      ctx.addIssue({
        path: ["prices"],
        message: "Each billing interval can appear only once",
        code: z.ZodIssueCode.custom,
      });
    }

    // Enterprise plans should not be free
    if (data.isEnterprise) {
      const hasFreePrice = data.prices.some((p) => p.amount === 0);
      if (hasFreePrice) {
        ctx.addIssue({
          path: ["prices"],
          message: "Enterprise plans cannot have free pricing",
          code: z.ZodIssueCode.custom,
        });
      }
    }
  });

export type PlanFormValues = z.infer<typeof planSchema>;
