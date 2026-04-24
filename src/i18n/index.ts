import i18n, { use } from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en_common from "./en/common.json";
import en_accounts from "./en/account.json";
import en_inventory from "./en/inventory.json";
import en_analytics from "./en/analytics.json";
import en_purchase from "./en/purchase.json";
import en_sales from "./en/sale.json";
import en_guard from "./en/guard.json";
import en_warehouse from "./en/warehouse.json";
import en_auth from "./en/auth.json";
import en_partners from "./en/partners.json";
import en_expense from "./en/expense.json";
import en_employee from "./en/employee.json";
import en_adjustment from "./en/adjustment.json";
import en_role from "./en/role.json";
import en_setting from "./en/setting.json";
import en_subscription from "./en/subscription.json";
import en_plan from "./en/plan.json";
import en_loan from "./en/loan.json";
import en_setupSteps from "./en/setupSteps.json";
import en_audit from "./en/audit.json";

import am_common from "./am/common.json";
import am_accounts from "./am/account.json";
import am_inventory from "./am/inventory.json";
import am_analytics from "./am/analytics.json";
import am_purchase from "./am/purchase.json";
import am_sales from "./am/sale.json";
import am_guard from "./am/guard.json";
import am_warehouse from "./am/warehouse.json";
import am_auth from "./am/auth.json";
import am_partners from "./am/partners.json";
import am_expense from "./am/expense.json";
import am_employee from "./am/employee.json";
import am_adjustment from "./am/adjustment.json";
import am_role from "./am/role.json";
import am_setting from "./am/setting.json";
import am_subscription from "./am/subscription.json";
import am_plan from "./am/plan.json";
import am_loan from "./am/loan.json";
import am_setupSteps from "./am/setupSteps.json";
import am_audit from "./am/audit.json";

const resources = {
  en: {
    translation: {
      common: en_common,
      auth: en_auth,
      accounts: en_accounts,
      inventory: en_inventory,
      analytics: en_analytics,
      purchase: en_purchase,
      sales: en_sales,
      guard: en_guard,
      warehouse: en_warehouse,
      partners: en_partners,
      expense: en_expense,
      employee: en_employee,
      adjustment: en_adjustment,
      role: en_role,
      setting: en_setting,
      subscription: en_subscription,
      plan: en_plan,
      loan: en_loan,
      setup: en_setupSteps,
      audit: en_audit,
    },
  },
  am: {
    translation: {
      common: am_common,
      auth: am_auth,
      accounts: am_accounts,
      inventory: am_inventory,
      analytics: am_analytics,
      purchase: am_purchase,
      sales: am_sales,
      guard: am_guard,
      warehouse: am_warehouse,
      partners: am_partners,
      expense: am_expense,
      employee: am_employee,
      adjustment: am_adjustment,
      role: am_role,
      setting: am_setting,
      subscription: am_subscription,
      plan: am_plan,
      loan: am_loan,
      setup: am_setupSteps,
      audit: am_audit,
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    // compatibilityJSON: "v4",
    resources,
    fallbackLng: "en",
    detection: {
      // order specifies which storage to check first
      order: ["localStorage", "querystring", "cookie", "navigator", "htmlTag"],
      // cache the language in localStorage to make it "stick" forever
      caches: ["localStorage", "cookie"],
    },
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });

export default i18n;
