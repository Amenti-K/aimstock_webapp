"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { Button } from "@/components/ui/button";
import { ShieldAlert, CreditCard } from "lucide-react";
import { logoutUser } from "@/redux/slices/userAuthSlice";

export default function BlockedPlansPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { company } = useAppSelector((state) => state.userAuth);

  const handleLogout = () => {
    dispatch(logoutUser());
    router.replace("/auth/login");
  };

  const goToBilling = () => {
    // Navigate to a payment flow or settings/billing
    // This assumes /dashboard/settings/billing exists later
    router.push("/pricing");
  };

  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
        <ShieldAlert className="w-10 h-10 text-destructive" />
      </div>

      <h1 className="text-2xl font-bold tracking-tight mb-2">
        Subscription Expired
      </h1>

      <p className="text-muted-foreground mb-8">
        Your subscription for{" "}
        <span className="font-semibold text-foreground">
          {company?.name || "your company"}
        </span>{" "}
        has expired or requires a valid plan to continue accessing the
        workspace.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 w-full">
        <Button variant="outline" className="flex-1" onClick={handleLogout}>
          Logout
        </Button>
        <Button onClick={goToBilling} className="flex-1 gap-2">
          <CreditCard className="w-4 h-4" />
          Renew Subscription
        </Button>
      </div>
    </div>
  );
}
