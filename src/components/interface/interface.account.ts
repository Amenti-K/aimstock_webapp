export interface IAccount {
  id: string;
  name: string;
  type: AccountType;
  bank: EthiopianFinancialInstitution;
  branch: string;
  number: string | undefined;
  balance: number;
  isActive: boolean;
  companyId: string;
  transactions: ITransaction[];
  createdAt: string;
  updatedAt: string;
}

export enum transferType {
  purchase = "purchase",
  sale = "sale",
  expense = "expense",
  transfer = "transfer",
  loan = "loan",
}

export interface ITransaction {
  id: string;
  source: string;
  direction: "in" | "out";
  amount: number;
  description?: string;
  relatedName?: string;
  txSubType?: string;
  createdAt: Date;
}

export interface IAccountDetail {
  id: string;
  name: string;
  type: AccountType;
  bank: EthiopianFinancialInstitution;
  branch: string;
  number: string | undefined;
  balance: number;
  isActive: boolean;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface IAccountCreate {
  name: string;
  bank: EthiopianFinancialInstitution;
  branch?: string;
  number?: string;
  balance: number;
}

export interface IAccountUpdate {
  name?: string;
  bank?: EthiopianFinancialInstitution;
  branch?: string;
}

export enum AccountType {
  Bank = "Bank",
  Cash = "Cash",
}

export enum EthiopianFinancialInstitution {
  TELEBIRR = "TELEBIRR",
  CBE = "CBE",
  DBE = "DBE",
  AWASH_BANK = "AWASH_BANK",
  DASHEN_BANK = "DASHEN_BANK",
  BANK_OF_ABYSSINIA = "BANK_OF_ABYSSINIA",
  HIBRET_BANK = "HIBRET_BANK",
  NIB_INTERNATIONAL_BANK = "NIB_INTERNATIONAL_BANK",
  COOPERATIVE_BANK_OF_OROMIA = "COOPERATIVE_BANK_OF_OROMIA",
  OROMIA_INTERNATIONAL_BANK = "OROMIA_INTERNATIONAL_BANK",
  WEGAGEN_BANK = "WEGAGEN_BANK",
  ZEMEN_BANK = "ZEMEN_BANK",
  BERHAN_BANK = "BERHAN_BANK",
  BUNNA_BANK = "BUNNA_BANK",
  LION_BANK = "LION_BANK",
  ABAY_BANK = "ABAY_BANK",
  ADDIS_INTERNATIONAL_BANK = "ADDIS_INTERNATIONAL_BANK",
  ENAT_BANK = "ENAT_BANK",
  GLOBAL_BANK_ETHIOPIA = "GLOBAL_BANK_ETHIOPIA",
  ZAMZAM_BANK = "ZAMZAM_BANK",
  HIJRA_BANK = "HIJRA_BANK",
  AHADU_BANK = "AHADU_BANK",
  AMHARA_BANK = "AMHARA_BANK",
  SIINQEE_BANK = "SIINQEE_BANK",
  TSEDEY_BANK = "TSEDEY_BANK",
  GADAA_BANK = "GADAA_BANK",
  SHABELLE_BANK = "SHABELLE_BANK",
}

export interface IAccountSelector {
  id: string;
  name: string;
  bank: string;
  balance: string | number;
}

export interface IAccountSelectorResponse {
  data: IAccountSelector[];
}

export interface IAccountTransfer {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
}

export interface IAccountSummary {
  totalBalance: number;
}

export const EthiopianFinancialInstitutionArray = [
  { label: "Tele Birr", value: "TELEBIRR" },
  { label: "Commercial Bank of Ethiopia", value: "CBE" },
  { label: "Development Bank of Ethiopia", value: "DBE" },
  { label: "Awash Bank", value: "AWASH_BANK" },
  { label: "Dashen Bank", value: "DASHEN_BANK" },
  { label: "Bank of Abyssinia", value: "BANK_OF_ABYSSINIA" },
  { label: "Hibret Bank", value: "HIBRET_BANK" },
  { label: "NIB International Bank", value: "NIB_INTERNATIONAL_BANK" },
  { label: "Cooperative Bank of Oromia", value: "COOPERATIVE_BANK_OF_OROMIA" },
  { label: "Oromia International Bank", value: "OROMIA_INTERNATIONAL_BANK" },
  { label: "Wegagen Bank", value: "WEGAGEN_BANK" },
  { label: "Zemen Bank", value: "ZEMEN_BANK" },
  { label: "Berhan Bank", value: "BERHAN_BANK" },
  { label: "Bunna Bank", value: "BUNNA_BANK" },
  { label: "Lion Bank", value: "LION_BANK" },
  { label: "Abay Bank", value: "ABAY_BANK" },
  { label: "Addis International Bank", value: "ADDIS_INTERNATIONAL_BANK" },
  { label: "Enat Bank", value: "ENAT_BANK" },
  { label: "Global Bank Ethiopia", value: "GLOBAL_BANK_ETHIOPIA" },
  { label: "Zamzam Bank", value: "ZAMZAM_BANK" },
  { label: "Hijra Bank", value: "HIJRA_BANK" },
  { label: "Ahadu Bank", value: "AHADU_BANK" },
  { label: "Amhara Bank", value: "AMHARA_BANK" },
  { label: "Siinqee Bank", value: "SIINQEE_BANK" },
  { label: "Tsedey Bank", value: "TSEDEY_BANK" },
  { label: "Gadaa Bank", value: "GADAA_BANK" },
  { label: "Shabelle Bank", value: "SHABELLE_BANK" },
];
