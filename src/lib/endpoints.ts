const endpoints = {
  ADMIN: "/admin",

  SIGNUP: "/auth/signup",
  SIGNIN: "/auth/signin",

  ACCOUNT: "/account",
  INACTIVATEACCOUNT: "/account/inactivate",

  WAREHOUSE: "/warehouse",
  PARTNER: "/partner",
  INVENTORY: "/inventory",
  CATEGORIES: "/inventory-category",
  PURCHASE: "/purchase",
  SALE: "/sale",
  ROLE: "/role",
  ADJUSTMENT: "/inventory-adjustment",
  EMPLOYEE: "/employee",
  EXPENSE: "/expense",
  EXPENSETEMPLATE: "/expense-template",
  COMPANY: "/company",
  SUBSCRIPTION: "/subscription",
  PLAN: "/plans",

  LOANINITIAL: "/loan/partner-and-initial",
  LOANTRANSACTION: "/loan/transaction",
  LOANPARTNERTRANX: "/loan/partner",
  LOANPARTNERS: "/loan/partners",

  ANALYTICS: "/anaytics",
  ADMINANALYTICS: "/admin/analytics",

  MAIL: "/mail",
  MAILCONTACT: "/mail/contact",
  AUDITLOG: "/audit-log",
};

export default endpoints;
