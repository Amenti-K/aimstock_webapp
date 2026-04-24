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
import { AlertTriangle, Info, WifiOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { LockButton } from "@/components/security/LockButton";

function NetworkBanner() {
  const [isOnline, setIsOnline] = React.useState(true);

  React.useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-destructive text-destructive-foreground py-2 px-4 flex items-center justify-center gap-2 text-xs font-medium animate-in slide-in-from-top duration-300 shadow-md">
      <WifiOff className="h-3 w-3" />
      <span>You are currently offline. Check your connection.</span>
    </div>
  );
}

export default function DrawerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const isMobile = useIsMobile();
  const { isExpired, isPastDue, isTrialing, daysLeft } = useSubscription();

  const [isPastDueDismissed, setIsPastDueDismissed] = React.useState(false);
  const [isTrialDismissed, setIsTrialDismissed] = React.useState(false);

  const pageName =
    pathname.split("/").filter(Boolean).pop()?.replace(/-/g, " ") ||
    "dashboard";

  // Guard: if subscription is expired and user is NOT on an allowed page,
  // redirect to /blocked/pay. This is a secondary guard — ClientProviders
  // already handles this on first load; this catches in-app navigations.
  React.useEffect(() => {
    if (
      isExpired &&
      !pathname.startsWith("/setting/subscription") &&
      !pathname.startsWith("/blocked")
    ) {
      router.replace("/blocked/pay");
    }
  }, [isExpired, pathname, router]);

  if (
    isExpired &&
    !pathname.startsWith("/setting/subscription") &&
    !pathname.startsWith("/blocked")
  ) {
    return null;
  }

  return (
    <SidebarProvider>
      <NetworkBanner />
      <UserDrawerSidebar />
      <SidebarInset className="relative flex flex-col min-h-screen">
        <header className="flex h-14 items-center gap-2 border-b bg-background px-4 sticky top-0 z-10 sm:pt-0 pt-[env(safe-area-inset-top)]">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-4" />
          <LockButton />
          <h1 className="text-sm font-medium capitalize">{pageName}</h1>
        </header>
        <main className="flex-1 overflow-auto bg-muted/30 p-4 sm:p-5 space-y-4">
          {/* Past Due Alert */}
          {isPastDue && (!isMobile || !isPastDueDismissed) && (
            <Alert
              variant="destructive"
              className={cn(
                "bg-destructive/10 border-destructive/20 shadow-sm transition-all animate-in fade-in slide-in-from-top-2",
                isMobile && "relative pr-10",
              )}
            >
              <AlertTriangle className="h-4 w-4" />
              <div className="flex flex-col sm:flex-row w-full sm:items-center justify-between gap-3">
                <div>
                  <AlertTitle>Action Required</AlertTitle>
                  <AlertDescription className="text-xs sm:text-sm">
                    Your subscription is past due. You have {daysLeft} day
                    {daysLeft !== 1 ? "s" : ""} before access is restricted.
                  </AlertDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    className="h-8 text-xs px-3"
                    onClick={() => router.push("/setting/subscription/plans")}
                  >
                    Renew Now
                  </Button>
                </div>
              </div>
              {isMobile && (
                <button
                  onClick={() => setIsPastDueDismissed(true)}
                  className="absolute top-2 right-2 p-1 text-destructive hover:bg-destructive/20 rounded-full transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </Alert>
          )}

          {/* Trial Alert */}
          {isTrialing && (!isMobile || !isTrialDismissed) && (
            <Alert
              className={cn(
                "bg-primary/5 border-primary/20 shadow-sm transition-all animate-in fade-in slide-in-from-top-2",
                isMobile && "relative pr-10",
              )}
            >
              <Info className="h-4 w-4 text-primary" />
              <div className="flex flex-col sm:flex-row w-full sm:items-center justify-between gap-3">
                <div>
                  <AlertTitle>Trial Period</AlertTitle>
                  <AlertDescription className="text-xs sm:text-sm">
                    Your trial expires in {daysLeft} day
                    {daysLeft !== 1 ? "s" : ""}. Upgrade now to keep all
                    features.
                  </AlertDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    className="h-8 text-xs px-3"
                    onClick={() => router.push("/setting/subscription/plans")}
                  >
                    Upgrade
                  </Button>
                </div>
              </div>
              {isMobile && (
                <button
                  onClick={() => setIsTrialDismissed(true)}
                  className="absolute top-2 right-2 p-1 text-muted-foreground hover:bg-muted rounded-full transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </Alert>
          )}

          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

// Helper function for conditional classes
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
