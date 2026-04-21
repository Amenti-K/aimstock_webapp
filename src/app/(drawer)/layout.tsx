"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { UserDrawerSidebar } from "@/components/layout/UserDrawerSidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

import { useSubscription } from "@/context/SubscriptionContext";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Info, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DrawerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const { isExpired, isPastDue, isTrialing, daysLeft } = useSubscription();

  const pageName =
    pathname.split("/").filter(Boolean).pop()?.replace(/-/g, " ") ||
    "dashboard";

  React.useEffect(() => {
    if (
      isExpired &&
      !pathname.includes("/blocked") &&
      !pathname.includes("/plans")
    ) {
      router.replace("/blocked/billing");
    }
  }, [isExpired, pathname, router]);

  if (
    isExpired &&
    !pathname.includes("/blocked") &&
    !pathname.includes("/plans")
  ) {
    return null;
  }

  return (
    <SidebarProvider>
      <UserDrawerSidebar />
      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b bg-background px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-4" />
          <h1 className="text-sm font-medium capitalize">{pageName}</h1>
        </header>
        <main className="flex-1 overflow-auto bg-muted/30 p-5 space-y-4">
          {isPastDue && (
            <Alert
              variant="destructive"
              className="bg-destructive/10 border-destructive/20"
            >
              <AlertTriangle className="h-4 w-4" />
              <div className="flex w-full items-center justify-between">
                <div>
                  <AlertTitle>Action Required</AlertTitle>
                  <AlertDescription>
                    Your subscription is past due. You have {daysLeft} days left
                    before access is restricted.
                  </AlertDescription>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => router.push("/blocked/plans")}
                >
                  Renew Now
                </Button>
              </div>
            </Alert>
          )}
          {isTrialing && (
            <Alert className="bg-primary/5 border-primary/20">
              <Info className="h-4 w-4 text-primary" />
              <div className="flex w-full items-center justify-between">
                <div>
                  <AlertTitle>Trial Period</AlertTitle>
                  <AlertDescription>
                    Your trial expires in {daysLeft} days. Upgrade now to keep
                    all features.
                  </AlertDescription>
                </div>
                <Button size="sm" onClick={() => router.push("/blocked/plans")}>
                  Upgrade
                </Button>
              </div>
            </Alert>
          )}
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
