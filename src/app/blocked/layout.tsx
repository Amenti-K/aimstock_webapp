"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import { Loader2 } from "lucide-react";

export default function BlockedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { accessToken, company, loading } = useAppSelector(
    (state) => state.userAuth,
  );
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;

    if (!accessToken) {
      router.replace("/auth/login");
      return;
    }

    // We don't forcefully redirect OUT of blocked here if they are naturally blocked.
    // However, if they are NOT blocked (e.g., active subscription, no maintenance mode),
    // and they try to visit /blocked, we should ideally redirect them back to the dashboard.
    // For now, this layout ensures they are at least authenticated.
  }, [isReady, accessToken, router]);

  if (!isReady || loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-background rounded-xl shadow-lg border p-8 sm:p-12">
        {children}
      </div>
    </div>
  );
}
