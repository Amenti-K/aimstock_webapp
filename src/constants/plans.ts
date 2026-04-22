import { BillingInterval } from "@/components/interface/subscription/subscription.interface";

export const plans = [
  {
    id: "starter",
    name: "Starter",
    description:
      "Full ERP for small businesses getting started. Ideal for testing and early growth.",
    limits: {
      warehouses: 2,
      employees: 2,
      users: 3, // including owner
    },
    trialDays: 30,
    pricing: {
      [BillingInterval.THREE_MONTHS]: 1000,
      [BillingInterval.SIX_MONTHS]: 1800,
      [BillingInterval.YEARLY]: 3200,
    },
    features: [
      "Full ERP Access",
      "Inventory Management",
      "2 Warehouses",
      "2 Employees",
      "Basic Reports",
      "Email Support",
    ],
    recommended: false,
  },

  // {
  //   id: "pro",
  //   name: "Pro",
  //   description:
  //     "For growing companies managing multiple warehouses and teams.",
  //   limits: {
  //     warehouses: 5,
  //     employees: 8,
  //     users: 9,
  //   },
  //   trialDays: 14,
  //   pricing: {
  //     [BillingInterval.THREE_MONTHS]: 1500,
  //     [BillingInterval.SIX_MONTHS]: 2300,
  //     [BillingInterval.YEARLY]: 3700,
  //   },
  //   features: [
  //     "Full ERP Access",
  //     "Advanced Inventory & Transfers",
  //     "5 Warehouses",
  //     "8 Employees",
  //     "Analytics & Reports",
  //    c
  //     "Priority Support",
  //   ],
  //   recommended: true,
  // },

  {
    id: "enterprise",
    name: "Enterprise",
    description: "Unlimited scale ERP solution for large organizations.",
    limits: {
      warehouses: "unlimited",
      employees: "unlimited",
      users: "unlimited",
    },
    trialDays: 14,
    pricing: {
      [BillingInterval.THREE_MONTHS]: 1500,
      [BillingInterval.SIX_MONTHS]: 2300,
      [BillingInterval.YEARLY]: 3700,
    },
    features: [
      "Unlimited Warehouses",
      "Unlimited Employees",
      "Advanced Analytics",
      "Advanced Inventory Management",
      "Advanced Inventory & Transfers",
      "Dedicated Support",
    ],
    recommended: true,
  },
];
