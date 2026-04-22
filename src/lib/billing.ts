export const BANK_DETAILS = {
  CBE: {
    name: "Commercial Bank of Ethiopia",
    accountName: "Amenti Kebede",
    accountNumber: "1000359192006",
    type: "bank" as const,
  },
  BOA: {
    name: "Bank of Abyssinia",
    accountName: "Amenti Kebede",
    accountNumber: "64167367",
    type: "bank" as const,
  },
  TELE: {
    name: "Telebirr",
    accountName: "Amenti",
    accountNumber: "+251946801171",
    type: "mobile" as const,
  },
} as const;

export type BankKey = keyof typeof BANK_DETAILS;

export const SUPPORT_LINKS = {
  telegram: "https://t.me/aim_stock",
};
