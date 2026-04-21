import {
  Activity,
  BadgeDollarSign,
  Boxes,
  BriefcaseBusiness,
  Building2,
  HandCoins,
  Home,
  ReceiptText,
  Settings,
  ShieldCheck,
  UserCog,
  Users,
  WalletCards,
} from "lucide-react";

export const drawerNavItems = [
  { title: "Dashboard", href: "/dashboard", icon: Home },
  { title: "Sales", href: "/sales", icon: BadgeDollarSign },
  { title: "Purchase", href: "/purchase", icon: WalletCards },
  { title: "Inventory", href: "/inventory", icon: Boxes },
  { title: "Account", href: "/account", icon: BriefcaseBusiness },
  { title: "Warehouse", href: "/warehouse", icon: Building2 },
  { title: "Partners", href: "/partner", icon: Users },
  { title: "Expense", href: "/expense", icon: ReceiptText },
  { title: "Loan", href: "/loan", icon: HandCoins },
  { title: "Employee", href: "/employee", icon: UserCog },
  { title: "Adjustment", href: "/adjustment", icon: Activity },
  { title: "Role & Permissions", href: "/role", icon: ShieldCheck },
  { title: "Audit", href: "/audit", icon: Activity },
  { title: "Settings", href: "/setting", icon: Settings },
];

export const moduleMockData: Record<
  string,
  { description: string; stats: Array<{ label: string; value: string }> }
> = {
  sales: {
    description:
      "Track completed sales, due invoices, and recent transactions.",
    stats: [
      { label: "Today Sales", value: "$1,240" },
      { label: "Open Invoices", value: "12" },
      { label: "Items Sold", value: "438" },
    ],
  },
  purchase: {
    description:
      "Manage purchase entries and monitor supplier-side transaction totals.",
    stats: [
      { label: "Today Purchases", value: "$860" },
      { label: "Pending Orders", value: "5" },
      { label: "Suppliers", value: "18" },
    ],
  },
  inventory: {
    description:
      "Monitor stock values, low-stock items, and recent inventory updates.",
    stats: [
      { label: "Total SKU", value: "126" },
      { label: "Low Stock", value: "9" },
      { label: "Stock Value", value: "$48,700" },
    ],
  },
  account: {
    description:
      "Review account balances and reconcile cash/bank transactions quickly.",
    stats: [
      { label: "Cash Balance", value: "$6,120" },
      { label: "Bank Balance", value: "$14,980" },
      { label: "Pending Entries", value: "7" },
    ],
  },
  warehouse: {
    description:
      "Maintain warehouse list, location capacity, and stock movement.",
    stats: [
      { label: "Warehouses", value: "3" },
      { label: "Active Transfers", value: "4" },
      { label: "Utilization", value: "74%" },
    ],
  },
  partner: {
    description:
      "Manage customer/supplier partner records and their transaction history.",
    stats: [
      { label: "Partners", value: "152" },
      { label: "Customers", value: "109" },
      { label: "Suppliers", value: "43" },
    ],
  },
  expense: {
    description: "Capture operating expenses and keep spending under control.",
    stats: [
      { label: "This Month", value: "$2,090" },
      { label: "Pending Approval", value: "6" },
      { label: "Expense Heads", value: "14" },
    ],
  },
  loan: {
    description:
      "Track loan balances, repayments, and partner-level loan details.",
    stats: [
      { label: "Total Loans", value: "$9,600" },
      { label: "Due This Week", value: "$1,250" },
      { label: "Active Partners", value: "8" },
    ],
  },
  employee: {
    description:
      "Manage employee records, onboarding status, and access permissions.",
    stats: [
      { label: "Employees", value: "24" },
      { label: "Active", value: "21" },
      { label: "Pending Invite", value: "3" },
    ],
  },
  adjustment: {
    description:
      "Record inventory adjustments and investigate unexpected stock variance.",
    stats: [
      { label: "This Month", value: "19" },
      { label: "Approved", value: "16" },
      { label: "Pending", value: "3" },
    ],
  },
  role: {
    description:
      "Configure roles and module-level permissions for your organization.",
    stats: [
      { label: "Roles", value: "5" },
      { label: "Custom Permissions", value: "24" },
      { label: "Users Assigned", value: "22" },
    ],
  },
  audit: {
    description:
      "Inspect system events and user activity logs for traceability.",
    stats: [
      { label: "Events Today", value: "98" },
      { label: "Critical Events", value: "2" },
      { label: "Last Sync", value: "2 min ago" },
    ],
  },
  setting: {
    description:
      "Handle company/account/preferences and subscription-related settings.",
    stats: [
      { label: "Company Profile", value: "Complete" },
      { label: "Billing Cycle", value: "Monthly" },
      { label: "Theme", value: "System" },
    ],
  },
};
