"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import { Loader2 } from "lucide-react";

export default function SetupRouterPage() {
  const router = useRouter();
  const { company } = useAppSelector((state) => state.userAuth);

  useEffect(() => {
    if (!company) return;

    if (company.setupStep === 1 || !company.setupStep) {
      router.replace("/app/setup/step1-create-warehouse");
    } else if (company.setupStep === 2) {
      router.replace("/app/setup/step2-create-inventory");
    } else if (company.setupStep === 3) {
      router.replace("/app/setup/step3-create-partners");
    } else if (company.setupStep === 4) {
      router.replace("/app/setup/finished");
    }
  }, [company, router]);

  return (
    <div className="flex w-full min-h-[50vh] items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}
