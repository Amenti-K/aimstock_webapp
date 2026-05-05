import { EthiopianFinancialInstitution } from "@/components/interface/interface.account";
// import dayjs from "dayjs";

export const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};

export const formatCurrency = (
  amount: number | string,
  onlyNumber = false,
  decimal = 2,
) => {
  const num = typeof amount === "string" ? Number(amount) : (amount ?? 0);
  if (Number.isNaN(num)) return String(amount);
  return onlyNumber
    ? num.toLocaleString(undefined, {
        minimumFractionDigits: decimal,
        maximumFractionDigits: decimal,
      })
    : `Br. ${num.toLocaleString(undefined, {
        minimumFractionDigits: decimal,
        maximumFractionDigits: decimal,
      })}`;
};

// export const formatDate = (date: string | Date) => {
//   return dayjs(date).format("MMM D, YYYY");
// };

// export const formatRelativeDate = (date: string | Date) => {
//   return dayjs();
// };

export const fromatBanks = (bank: EthiopianFinancialInstitution) => {
  switch (bank) {
    case EthiopianFinancialInstitution.TELEBIRR:
      return "Telebirr";
    case EthiopianFinancialInstitution.CBE:
      return "CBE";
    case EthiopianFinancialInstitution.DBE:
      return "DBE";
    case EthiopianFinancialInstitution.AWASH_BANK:
      return "Awash Bank";
    case EthiopianFinancialInstitution.DASHEN_BANK:
      return "Dashen Bank";
    case EthiopianFinancialInstitution.BANK_OF_ABYSSINIA:
      return "Bank of Abyssinia";
    case EthiopianFinancialInstitution.HIBRET_BANK:
      return "Hibret Bank";
    case EthiopianFinancialInstitution.NIB_INTERNATIONAL_BANK:
      return "Nib International Bank";
    case EthiopianFinancialInstitution.COOPERATIVE_BANK_OF_OROMIA:
      return "Cooperative Bank of Oromia";
    case EthiopianFinancialInstitution.OROMIA_INTERNATIONAL_BANK:
      return "Oromia International Bank";
    case EthiopianFinancialInstitution.WEGAGEN_BANK:
      return "Wegagen Bank";
    case EthiopianFinancialInstitution.ZEMEN_BANK:
      return "Zemen Bank";
    case EthiopianFinancialInstitution.BERHAN_BANK:
      return "Berhan Bank";
    case EthiopianFinancialInstitution.BUNNA_BANK:
      return "Bunna Bank";
    case EthiopianFinancialInstitution.LION_BANK:
      return "Lion Bank";
    case EthiopianFinancialInstitution.ABAY_BANK:
      return "Abay Bank";
    case EthiopianFinancialInstitution.ADDIS_INTERNATIONAL_BANK:
      return "Addis International Bank";
    case EthiopianFinancialInstitution.ENAT_BANK:
      return "Enat Bank";
    case EthiopianFinancialInstitution.GLOBAL_BANK_ETHIOPIA:
      return "Global Bank Ethiopia";
    case EthiopianFinancialInstitution.ZAMZAM_BANK:
      return "Zamzam Bank";
    case EthiopianFinancialInstitution.HIJRA_BANK:
      return "Hijra Bank";
    case EthiopianFinancialInstitution.AHADU_BANK:
      return "Ahadu Bank";
    case EthiopianFinancialInstitution.AMHARA_BANK:
      return "Amhara Bank";
    case EthiopianFinancialInstitution.SIINQEE_BANK:
      return "Siinqee Bank";
    case EthiopianFinancialInstitution.TSEDEY_BANK:
      return "Tsedey Bank";
    case EthiopianFinancialInstitution.GADAA_BANK:
      return "Gadaa Bank";
    case EthiopianFinancialInstitution.SHABELLE_BANK:
      return "Shabelle Bank";
    default:
      return bank;
  }
};
