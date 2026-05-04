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

    const step = company.setupStep || 1;

    if (step === 1) {
      router.replace("/setup/step1-create-warehouse");
    } else if (step === 2) {
      router.replace("/setup/step2-create-inventory");
    } else if (step === 3) {
      router.replace("/setup/step3-create-partners");
    } else if (step === 4) {
      router.replace("/setup/finished");
    }
  }, [company, router]);

  return (
    <div className="flex w-full min-h-[50vh] items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}
