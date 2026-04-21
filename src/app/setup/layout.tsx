"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import { Loader2 } from "lucide-react";

export default function SetupLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { accessToken, company, loading } = useAppSelector((state) => state.userAuth);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;

    if (!accessToken) {
      router.replace("/app/auth/login");
      return;
    }

    if (company?.setupStep === 4) {
      router.replace("/app/dashboard");
      return;
    }
  }, [isReady, accessToken, company, router]);

  if (!isReady || loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Optional: Add a Topbar or Header specific to Setup here if needed */}
      <div className="flex w-full px-4 py-8 max-w-5xl mx-auto h-full">
        {children}
      </div>
    </div>
  );
}
