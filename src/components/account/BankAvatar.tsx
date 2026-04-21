import React from "react";
import Image from "next/image";
import { EthiopianFinancialInstitution, AccountType } from "../interface/interface.account";
import { Wallet } from "lucide-react";

interface BankAvatarProps {
  name?: EthiopianFinancialInstitution;
  size?: number;
  type?: AccountType;
  fallbackText?: string;
}

const bankLogos: Record<string, string> = {
  TELEBIRR: "/bank-logos/tele.jpg",
  CBE: "/bank-logos/CBE.jpg",
  DBE: "/bank-logos/DBE.jpg",
  AWASH_BANK: "/bank-logos/Awash.jpg",
  DASHEN_BANK: "/bank-logos/Dashen.jpg",
  BANK_OF_ABYSSINIA: "/bank-logos/Abyssinia.jpg",
  HIBRET_BANK: "/bank-logos/Hibret.jpg",
  NIB_INTERNATIONAL_BANK: "/bank-logos/Nib.jpg",
  COOPERATIVE_BANK_OF_OROMIA: "/bank-logos/Coop.jpg",
  OROMIA_INTERNATIONAL_BANK: "/bank-logos/Oromia.jpg",
  WEGAGEN_BANK: "/bank-logos/Wegagen.jpg",
  ZEMEN_BANK: "/bank-logos/Zemen.jpg",
  BERHAN_BANK: "/bank-logos/Birhan.jpg",
  BUNNA_BANK: "/bank-logos/Anbesa.jpg", // Assuming Bunna is Anbesa or similar, or mapping it correctly
  LION_BANK: "/bank-logos/Anbesa.jpg", 
  ABAY_BANK: "/bank-logos/Abay.jpg",
  ADDIS_INTERNATIONAL_BANK: "/bank-logos/Addis.jpg",
  ENAT_BANK: "/bank-logos/Enat.jpg",
  GLOBAL_BANK_ETHIOPIA: "/bank-logos/Global.jpg",
  ZAMZAM_BANK: "/bank-logos/Zamzam.jpg",
  HIJRA_BANK: "/bank-logos/Zamzam.jpg", // Fallback to Zamzam if missing
  AHADU_BANK: "/bank-logos/Ahadu.jpg",
  AMHARA_BANK: "/bank-logos/Amhara.jpg",
  SIINQEE_BANK: "/bank-logos/Siinqee.jpg",
  TSEDEY_BANK: "/bank-logos/Tsedey.jpg",
  GADAA_BANK: "/bank-logos/Gadda.jpg",
  SHABELLE_BANK: "/bank-logos/Global.jpg", // Fallback
};

const colors = ["bg-blue-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500", "bg-violet-500"];

export const BankAvatar: React.FC<BankAvatarProps> = ({
  name,
  size = 40,
  type = AccountType.Bank,
  fallbackText,
}) => {
  if (type === AccountType.Cash) {
    return (
      <div
        className="flex items-center justify-center rounded-full bg-emerald-500 text-white font-semibold"
        style={{ width: size, height: size, fontSize: size / 2.5 }}
      >
        CA
      </div>
    );
  }

  const logoUrl = name ? bankLogos[name] : null;

  if (logoUrl) {
    return (
      <div 
        className="relative overflow-hidden rounded-full border bg-white flex items-center justify-center p-1"
        style={{ width: size, height: size }}
      >
        <Image
          src={logoUrl}
          alt={name || "Bank logo"}
          width={size}
          height={size}
          className="object-contain"
        />
      </div>
    );
  }

  const initials = (fallbackText || name || "?")
    .split(" ")
    .map((w) => w[0]?.toUpperCase())
    .join("")
    .slice(0, 2);

  const bgIndex = (name?.charCodeAt(0) || 0) % colors.length;
  const bgColor = colors[bgIndex];

  return (
    <div
      className={`flex items-center justify-center rounded-full text-white font-medium ${bgColor}`}
      style={{ width: size, height: size, fontSize: size / 2.5 }}
    >
      {initials}
    </div>
  );
};
