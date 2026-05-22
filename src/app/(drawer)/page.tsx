"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingView } from "@/components/common/StateView";
import { useTranslation } from "react-i18next";

export default function DrawerDefaultPage() {
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <LoadingView message={t("common.loading", "Loading...")} />
    </div>
  );
}
