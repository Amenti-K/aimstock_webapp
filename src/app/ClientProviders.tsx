"use client";

import React, { useEffect, useState } from "react";
import ReactQueryProvider from "@/components/providers/ReactQueryProvider";
import { Toaster } from "@/components/ui/toaster";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "@/redux/store";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import {
  SubscriptionProvider,
  useSubscription,
} from "@/context/SubscriptionContext";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { useRouter, usePathname } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import { Loader2 } from "lucide-react";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname() || "";

  const {
    accessToken,
    company,
    loading: authLoading,
  } = useAppSelector((state) => state.userAuth);

  const {
    subscription,
    isInitialized,
    loading: subLoading,
    isExpired,
  } = useSubscription();

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const isAuthPage = pathname.startsWith("/auth");
    const isBlockedPage = pathname.startsWith("/blocked");
    const isSetupPage = pathname.startsWith("/setup");
    // Billing & plans in settings must be reachable even when expired
    const isSubscriptionSettingPage = pathname.startsWith(
      "/setting/subscription"
    );

    // ── Step 1: Auth check ────────────────────────────────────────────────────
    if (!accessToken) {
      if (!isAuthPage) {
        router.replace("/auth/login");
      }
      return;
    }

    // Wait for subscription context to fully initialise
    if (!isInitialized || subLoading) return;

    // ── Step 2: No subscription at all (first-time user) ─────────────────────
    // subscription === null means they have NEVER had a subscription.
    if (!subscription) {
      const isAllowed =
        isAuthPage || isBlockedPage || isSubscriptionSettingPage;
      if (!isAllowed) {
        router.replace("/blocked/plans");
        return;
      }
      // Prevent first-time users from landing on /blocked/pay
      if (pathname === "/blocked/pay") {
        router.replace("/blocked/plans");
      }
      return;
    }

    // ── Step 3: Expired / cancelled subscription ──────────────────────────────
    // subscription exists but isExpired === true (EXPIRED or CANCELED status).
    if (isExpired) {
      const isAllowed =
        isAuthPage ||
        pathname === "/blocked/pay" ||
        isSubscriptionSettingPage;
      if (!isAllowed) {
        router.replace("/blocked/pay");
        return;
      }
      // Prevent expired users from landing on /blocked/plans (that's for first-timers)
      if (pathname === "/blocked/plans") {
        router.replace("/blocked/pay");
      }
      return;
    }

    // ── Step 4: Active subscription — check company setup ────────────────────
    if (company && company.setupStep !== 4) {
      if (!isSetupPage) {
        router.replace("/setup");
      }
      return;
    }

    // ── Step 5: Fully authenticated & set-up — land on dashboard ─────────────
    const isAppRoot = pathname === "/";
    if (isAuthPage || isAppRoot) {
      router.replace("/dashboard");
    } else if (isBlockedPage) {
      // Active users shouldn't be on /blocked pages
      router.replace("/dashboard");
    }
  }, [
    isMounted,
    accessToken,
    company,
    subscription,
    isExpired,
    isInitialized,
    subLoading,
    pathname,
    router,
  ]);

  if (
    !isMounted ||
    authLoading ||
    (accessToken && (!isInitialized || subLoading))
  ) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}

import { AuthLockProvider, useAuthLock } from "@/context/AuthLockContext";
import { LockScreen } from "@/components/security/LockScreen";
import { useIdleTimer } from "react-idle-timer";

function SessionLockWrapper({ children }: { children: React.ReactNode }) {
  const { lockSession, isLocked, hasPin, isLockEnabled } = useAuthLock();
  const pathname = usePathname();

  const canLock = hasPin && isLockEnabled;

  // Idle Timer: 5 minutes
  useIdleTimer({
    timeout: 1000 * 60 * 5,
    onIdle: () => {
      if (canLock && !isLocked) {
        lockSession();
      }
    },
    debounce: 500,
    disabled: !canLock,
  });

  // Tab Visibility: 30 seconds
  useEffect(() => {
    if (!canLock) return;

    let timeoutId: NodeJS.Timeout;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        // Start 30s timer when tab is hidden
        timeoutId = setTimeout(() => {
          if (canLock && !isLocked) {
            lockSession();
          }
        }, 30000);
      } else {
        // Clear timer if tab becomes visible before 30s
        clearTimeout(timeoutId);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearTimeout(timeoutId);
    };
  }, [canLock, isLocked, lockSession]);

  return (
    <>
      {children}
      <LockScreen />
    </>
  );
}

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ReactQueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AuthLockProvider>
              <SubscriptionProvider>
                <SessionLockWrapper>
                  <AuthGuard>{children}</AuthGuard>
                </SessionLockWrapper>
              </SubscriptionProvider>
            </AuthLockProvider>
            <Toaster />
            <SonnerToaster position="top-right" expand={true} richColors />
          </ThemeProvider>
        </ReactQueryProvider>
      </PersistGate>
    </Provider>
  );
}
