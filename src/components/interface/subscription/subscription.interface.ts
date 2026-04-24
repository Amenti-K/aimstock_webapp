// Subscription interface
export interface ISubscription {
  id: string;
  status: ISubscriptionStatus;
  trialEndsAt: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  companyId: string;
  planId: string;
  plan: IPlan;
  usages: IUsage[];
}

export enum ISubscriptionStatus {
  TRIALING = "TRIALING",
  ACTIVE = "ACTIVE",
  EXPIRED = "EXPIRED",
  PAST_DUE = "PAST_DUE",
  CANCELED = "CANCELED",
  UNPAID = "UNPAID",
}

// Usage interface
export interface IUsage {
  id: string;
  metric: string;
  value: number;
  // lastReset: string;
  // updatedAt: string;
}

// Plan interface
export interface IPlan {
  id: string;
  name: string;
  description?: string;
  isEnterprise: boolean;
  isActive: boolean;
  limits: PlanLimit[];
  features: PlanFeature[];
  prices: PlanPrice[];
}

export interface PlanPrice {
  id: string;
  amount: number;
  currency: string;
  interval: BillingInterval;
}

export enum BillingInterval {
  MONTHLY = "MONTHLY",
  THREE_MONTHS = "THREE_MONTHS",
  SIX_MONTHS = "SIX_MONTHS",
  YEARLY = "YEARLY",
}

export interface PlanLimit {
  metric: LimitMetric;
  value: number | null; // null for unlimited
}

export interface PlanFeature {
  feature: FeatureKey;
  enabled: boolean;
}

export enum FeatureKey {
  ACCOUNT = "ACCOUNT",
  ANALYTICS = "ANALYTICS",
  AUTH = "AUTH",
  COMPANY = "COMPANY",
  EMPLOYEE = "EMPLOYEE",
  EXPENSE = "EXPENSE",
  INVENTORY = "INVENTORY",
  INVENTORY_ADJUSTMENT = "INVENTORY_ADJUSTMENT",
  LOAN = "LOAN",
  PARTNER = "PARTNER",
  PURCHASE = "PURCHASE",
  REPORTS = "REPORTS",
  ROLE = "ROLE",
  SALE = "SALE",
  SUBSCRIPTION = "SUBSCRIPTION",
  WAREHOUSE = "WAREHOUSE",
}

export enum LimitMetric {
  ACCOUNT = "ACCOUNT",
  ANALYTICS = "ANALYTICS",
  AUTH = "AUTH",
  COMPANY = "COMPANY",
  EMPLOYEE = "EMPLOYEE",
  EXPENSE = "EXPENSE",
  INVENTORY = "INVENTORY",
  INVENTORY_ADJUSTMENT = "INVENTORY_ADJUSTMENT",
  LOAN = "LOAN",
  PARTNER = "PARTNER",
  PURCHASE = "PURCHASE",
  REPORTS = "REPORTS",
  ROLE = "ROLE",
  SALE = "SALE",
  SUBSCRIPTION = "SUBSCRIPTION",
  WAREHOUSE = "WAREHOUSE",
  INVOICES_MONTHLY = "INVOICES_MONTHLY",
  STORAGE_GB = "STORAGE_GB",
}
