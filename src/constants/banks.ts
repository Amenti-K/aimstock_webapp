import { EthiopianFinancialInstitution } from "@/interface/interface.account";

export interface BankMeta {
  name: string;
  logo: any | null;
}

export const BankMappings: Record<EthiopianFinancialInstitution, BankMeta> = {
  [EthiopianFinancialInstitution.ABAY_BANK]: {
    name: "Abay Bank",
    logo: require("@/assets/images/bank-logos/Abay.jpg"),
  },
  [EthiopianFinancialInstitution.ADDIS_INTERNATIONAL_BANK]: {
    name: "Addis International Bank",
    logo: require("@/assets/images/bank-logos/Addis.jpg"),
  },
  [EthiopianFinancialInstitution.AHADU_BANK]: {
    name: "Ahadu Bank",
    logo: require("@/assets/images/bank-logos/Ahadu.jpg"),
  },
  [EthiopianFinancialInstitution.AMHARA_BANK]: {
    name: "Amhara Bank",
    logo: require("@/assets/images/bank-logos/Amhara.jpg"),
  },
  [EthiopianFinancialInstitution.AWASH_BANK]: {
    name: "Awash Bank",
    logo: require("@/assets/images/bank-logos/Awash.jpg"),
  },
  [EthiopianFinancialInstitution.BANK_OF_ABYSSINIA]: {
    name: "Bank of Abyssinia",
    logo: require("@/assets/images/bank-logos/Abyssinia.jpg"),
  },
  [EthiopianFinancialInstitution.BERHAN_BANK]: {
    name: "Berhan Bank",
    logo: require("@/assets/images/bank-logos/Birhan.jpg"),
  },
  [EthiopianFinancialInstitution.BUNNA_BANK]: {
    name: "Bunna Bank",
    logo: null,
  },
  [EthiopianFinancialInstitution.CBE]: {
    name: "Commercial Bank of Ethiopia",
    logo: require("@/assets/images/bank-logos/CBE.jpg"),
  },
  [EthiopianFinancialInstitution.COOPERATIVE_BANK_OF_OROMIA]: {
    name: "Cooperative Bank of Oromia",
    logo: require("@/assets/images/bank-logos/Coop.jpg"),
  },
  [EthiopianFinancialInstitution.DASHEN_BANK]: {
    name: "Dashen Bank",
    logo: require("@/assets/images/bank-logos/Dashen.jpg"),
  },
  [EthiopianFinancialInstitution.DBE]: {
    name: "Development Bank of Ethiopia",
    logo: require("@/assets/images/bank-logos/DBE.jpg"),
  },
  [EthiopianFinancialInstitution.ENAT_BANK]: {
    name: "Enat Bank",
    logo: require("@/assets/images/bank-logos/Enat.jpg"),
  },
  [EthiopianFinancialInstitution.GADAA_BANK]: {
    name: "Gadaa Bank",
    logo: require("@/assets/images/bank-logos/Gadda.jpg"),
  },
  [EthiopianFinancialInstitution.GLOBAL_BANK_ETHIOPIA]: {
    name: "Global Bank Ethiopia",
    logo: require("@/assets/images/bank-logos/Global.jpg"),
  },
  [EthiopianFinancialInstitution.HIJRA_BANK]: {
    name: "Hijra Bank",
    logo: null,
  },
  [EthiopianFinancialInstitution.HIBRET_BANK]: {
    name: "Hibret Bank",
    logo: require("@/assets/images/bank-logos/Hibret.jpg"),
  },
  [EthiopianFinancialInstitution.LION_BANK]: {
    name: "Lion Bank",
    logo: null,
  },
  [EthiopianFinancialInstitution.NIB_INTERNATIONAL_BANK]: {
    name: "Nib International Bank",
    logo: require("@/assets/images/bank-logos/Nib.jpg"),
  },
  [EthiopianFinancialInstitution.OROMIA_INTERNATIONAL_BANK]: {
    name: "Oromia International Bank",
    logo: require("@/assets/images/bank-logos/Oromia.jpg"),
  },
  [EthiopianFinancialInstitution.SHABELLE_BANK]: {
    name: "Shabelle Bank",
    logo: null,
  },
  [EthiopianFinancialInstitution.SIINQEE_BANK]: {
    name: "Siinqee Bank",
    logo: require("@/assets/images/bank-logos/Siinqee.jpg"),
  },
  [EthiopianFinancialInstitution.TELEBIRR]: {
    name: "TeleBirr",
    logo: require("@/assets/images/bank-logos/tele.jpg"),
  },
  [EthiopianFinancialInstitution.TSEDEY_BANK]: {
    name: "Tsedey Bank",
    logo: require("@/assets/images/bank-logos/Tsedey.jpg"),
  },
  [EthiopianFinancialInstitution.WEGAGEN_BANK]: {
    name: "Wegagen Bank",
    logo: require("@/assets/images/bank-logos/Wegagen.jpg"),
  },
  [EthiopianFinancialInstitution.ZAMZAM_BANK]: {
    name: "ZamZam Bank",
    logo: require("@/assets/images/bank-logos/Zamzam.jpg"),
  },
  [EthiopianFinancialInstitution.ZEMEN_BANK]: {
    name: "Zemen Bank",
    logo: require("@/assets/images/bank-logos/Zemen.jpg"),
  },
};

export const getBankName = (key?: EthiopianFinancialInstitution) =>
  key ? (BankMappings[key]?.name ?? key.replaceAll("_", " ")) : "Unknown";

export const getBankLogo = (key?: EthiopianFinancialInstitution) =>
  key ? (BankMappings[key]?.logo ?? null) : null;

export const BankOptions = Object.entries(BankMappings).map(
  ([key, { name, logo }]) => ({
    label: name,
    value: key,
    logo,
  }),
);
