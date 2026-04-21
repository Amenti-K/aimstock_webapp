"use client";

import React, { useEffect, useState } from "react";
import ReactQueryProvider from "@/components/providers/ReactQueryProvider";
import { Toaster } from "@/components/ui/toaster";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "@/redux/store";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { SubscriptionProvider, useSubscription } from "@/context/SubscriptionContext";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { useRouter, usePathname } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import { Loader2 } from "lucide-react";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname() || "";

  const { accessToken, company, loading: authLoading } = useAppSelector(
    (state) => state.userAuth,
  );

  const { subscription, isInitialized, loading: subLoading, isExpired } = useSubscription();

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const isAuthPage = pathname.startsWith("/auth");
    const isBlockedPage = pathname.startsWith("/blocked");
    const isSetupPage = pathname.startsWith("/setup");
    const isBillingPage =
      pathname.includes("/setting/company/subscription") ||
      pathname.includes("/blocked");

    // Step 1: Auth check
    if (!accessToken) {
      if (!isAuthPage) {
        router.replace("/auth/login");
      }
      return;
    }

    // Wait for subscription to be initialized
    if (!isInitialized || subLoading) return;

    // Step 2: Subscription
    if (!subscription) {
      if (!isBlockedPage && !isBillingPage) {
        router.replace("/blocked/plans");
      }
      return;
    }

    // Step 3: Setup check
    if (company && company.setupStep !== 4) {
      if (!isSetupPage) {
        router.replace("/setup");
      }
      return;
    }

    // Step 4: Core App
    const isAppRoot = pathname === "/";
    if (isAuthPage || isAppRoot) {
      router.replace("/dashboard");
    } else if (isBlockedPage && !isExpired) {
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

  if (!isMounted || authLoading || (accessToken && (!isInitialized || subLoading))) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
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
            <SubscriptionProvider>
              <AuthGuard>{children}</AuthGuard>
            </SubscriptionProvider>
            <Toaster />
            <SonnerToaster position="top-right" expand={true} richColors />
          </ThemeProvider>
        </ReactQueryProvider>
      </PersistGate>
    </Provider>
  );
}
