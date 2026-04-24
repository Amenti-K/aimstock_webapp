import { useTranslation } from "react-i18next";
import { useCallback, useEffect } from "react";

export const useLanguage = () => {
  const { i18n, t } = useTranslation();

  const changeLanguage = useCallback(
    (lng: string) => {
      i18n.changeLanguage(lng);
      if (typeof window !== "undefined") {
        document.documentElement.lang = lng;
        // Amharic is LTR, but this is good practice if adding RTL later
        document.documentElement.dir = lng === "ar" ? "rtl" : "ltr";
      }
    },
    [i18n]
  );

  useEffect(() => {
    // Sync html lang attribute on mount or when language changes
    if (typeof window !== "undefined") {
      document.documentElement.lang = i18n.language;
    }
  }, [i18n.language]);

  return {
    language: i18n.language,
    changeLanguage,
    t,
    isAmharic: i18n.language === "am",
    isEnglish: i18n.language === "en",
  };
};
