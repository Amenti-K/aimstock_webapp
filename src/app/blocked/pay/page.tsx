"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { logoutUser } from "@/redux/slices/userAuthSlice";
import { Button } from "@/components/ui/button";
import { CreditCard, LogOut, TimerOff } from "lucide-react";

/**
 * blocked/pay — shown when a user's subscription has expired or been cancelled.
 * The "Renew" button routes to setting/subscription/plans (inside drawer),
 * NOT to blocked/plans which is for first-time users.
 */
export default function BlockedPayPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { company } = useAppSelector((state) => state.userAuth);

  const handleLogout = () => {
    dispatch(logoutUser());
    router.replace("/auth/login");
  };

  const handleRenew = () => {
    router.push("/setting/subscription/plans");
  };

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-background rounded-2xl shadow-xl border p-8 flex flex-col items-center text-center gap-0">
        {/* Icon */}
        <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
          <TimerOff className="w-10 h-10 text-destructive" />
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-bold tracking-tight mb-2">
          Subscription Expired
        </h1>

        {/* Description */}
        <p className="text-muted-foreground mb-8 leading-relaxed">
          Your subscription for{" "}
          <span className="font-semibold text-foreground">
            {company?.name || "your company"}
          </span>{" "}
          has expired. Renew now to continue accessing all features.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Button
            id="blocked-pay-logout"
            variant="outline"
            className="flex-1 gap-2"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
          <Button
            id="blocked-pay-renew"
            className="flex-1 gap-2"
            onClick={handleRenew}
          >
            <CreditCard className="w-4 h-4" />
            Renew Subscription
          </Button>
        </div>
      </div>
    </div>
  );
}
