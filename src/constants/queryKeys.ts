export const queryKeys = {
  accounts: {
    root: ["accounts"] as const,
    lists: () => [...queryKeys.accounts.root, "list"] as const,
    list: (filters?: any) =>
      [...queryKeys.accounts.lists(), filters ?? {}] as const,
    summary: () => [...queryKeys.accounts.root, "summary"] as const,
    selector: () => [...queryKeys.accounts.root, "selector"] as const,
    detail: (id: string) => [...queryKeys.accounts.root, "detail", id] as const,
  },

  adjustments: {
    root: ["adjustments"] as const,
    lists: () => [...queryKeys.adjustments.root, "list"] as const,
    list: (filters: any) =>
      [...queryKeys.adjustments.lists(), filters] as const,
    detail: (id: string) =>
      [...queryKeys.adjustments.root, "detail", id] as const,
  },

  analytics: {
    root: ["analytics"] as const,
    summary: () => [...queryKeys.analytics.root, "summary"] as const,
    pieChart: (filters?: any) =>
      [...queryKeys.analytics.root, "piechart", filters ?? {}] as const,
    profit: (filters?: any) =>
      [...queryKeys.analytics.root, "profit", filters ?? {}] as const,
  },

  auditLogs: {
    root: ["audit"] as const,
    lists: () => [...queryKeys.auditLogs.root, "list"] as const,
    list: (filters: any) => [...queryKeys.auditLogs.lists(), filters] as const,
    detail: (id: string) =>
      [...queryKeys.auditLogs.root, "detail", id] as const,
  },

  auth: {
    root: ["auth"] as const,
    login: () => [...queryKeys.auth.root, "login"] as const,
    register: () => [...queryKeys.auth.root, "register"] as const,
    maintenance: () => ["system", "maintenance-status"] as const,
  },

  company: {
    root: ["company"] as const,
    lists: () => [...queryKeys.company.root, "list"] as const,
    list: (filters: any) => [...queryKeys.company.lists(), filters] as const,
    detail: (id: string) => [...queryKeys.company.root, "detail", id] as const,
  },

  employees: {
    root: ["employees"] as const,
    lists: () => [...queryKeys.employees.root, "list"] as const,
    list: (filters: any) => [...queryKeys.employees.lists(), filters] as const,
    detail: (id: string) =>
      [...queryKeys.employees.root, "detail", id] as const,
  },

  expenses: {
    root: ["expenses"] as const,
    lists: () => [...queryKeys.expenses.root, "list"] as const,
    list: (filters: any) => [...queryKeys.expenses.lists(), filters] as const,
    detail: (id: string) => [...queryKeys.expenses.root, "detail", id] as const,
  },

  inventories: {
    root: ["inventories"] as const,
    lists: () => [...queryKeys.inventories.root, "list"] as const,
    list: (filters?: any) =>
      [...queryKeys.inventories.lists(), filters ?? {}] as const,
    selector: (params?: any) =>
      [...queryKeys.inventories.root, "selector", params ?? {}] as const,
    detail: (id: string) =>
      [...queryKeys.inventories.root, "detail", id] as const,
    analytics: (id: string, filters?: any) =>
      [...queryKeys.inventories.root, "analytics", id, filters ?? {}] as const,
    report: (filters?: any) =>
      [...queryKeys.inventories.root, "report", filters ?? {}] as const,
  },

  loans: {
    root: ["loans"] as const,
    partners: {
      root: ["loanPartners"] as const,
      lists: () => [...queryKeys.loans.partners.root, "infinite"] as const,
      list: (filters?: any) =>
        [...queryKeys.loans.partners.lists(), filters ?? {}] as const,
      transactions: (partnerId?: string) =>
        [...queryKeys.loans.partners.root, "transactions", partnerId].filter(
          Boolean,
        ),
    },
    detail: (id: string) => [...queryKeys.loans.root, "detail", id] as const,
  },

  partners: {
    root: ["partners"] as const,
    lists: () => [...queryKeys.partners.root, "list"] as const,
    list: (filters: any) => [...queryKeys.partners.lists(), filters] as const,
    detail: (id: string) => [...queryKeys.partners.root, "detail", id] as const,
    selector: () => [...queryKeys.partners.root, "selector"] as const,
  },

  plans: {
    root: ["plans"] as const,
    list: () => [...queryKeys.plans.root, "list"] as const,
  },

  purchases: {
    root: ["purchases"] as const,
    lists: () => [...queryKeys.purchases.root, "list"] as const,
    list: (filters?: any) =>
      [...queryKeys.purchases.lists(), filters ?? {}] as const,
    detail: (id: string) =>
      [...queryKeys.purchases.root, "detail", id] as const,
  },

  reports: {
    root: ["reports"] as const,
    purchaseAnalytics: (filters?: any) =>
      [...queryKeys.reports.root, "purchaseAnalytics", filters ?? {}] as const,
    salesAnalytics: (filters?: any) =>
      [...queryKeys.reports.root, "salesAnalytics", filters ?? {}] as const,
  },

  roles: {
    root: ["roles"] as const,
    lists: () => [...queryKeys.roles.root, "list"] as const,
    list: (filters: any) => [...queryKeys.roles.lists(), filters] as const,
    detail: (id: string) => [...queryKeys.roles.root, "detail", id] as const,
    selector: () => [...queryKeys.roles.root, "selector"] as const,
  },

  sales: {
    root: ["sales"] as const,
    lists: () => [...queryKeys.sales.root, "list"] as const,
    list: (filters?: any) =>
      [...queryKeys.sales.lists(), filters ?? {}] as const,
    detail: (id: string) => [...queryKeys.sales.root, "detail", id] as const,
  },

  subscription: {
    root: ["subscription"] as const,
    mine: () => [...queryKeys.subscription.root, "mine"] as const,
  },

  user: {
    root: ["user"] as const,
    profile: () => [...queryKeys.user.root, "profile"] as const,
  },

  warehouses: {
    root: ["warehouses"] as const,
    lists: () => [...queryKeys.warehouses.root, "list"] as const,
    list: (filters: any) => [...queryKeys.warehouses.lists(), filters] as const,
    selector: () => [...queryKeys.warehouses.root, "selector"] as const,
    detail: (id: string) =>
      [...queryKeys.warehouses.root, "detail", id] as const,
    inventories: (warehouseId: string) =>
      ["warehouse-inventories", "selector", "warehouse", warehouseId] as const,
  },
};
