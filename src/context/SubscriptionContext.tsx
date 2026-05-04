"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useFetchSubscription } from "@/api/subscription/api.subscription";
import {
  ISubscription,
  ISubscriptionStatus,
} from "@/components/interface/subscription/subscription.interface";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { setSubscription } from "@/redux/slices/userAuthSlice";

type SubscriptionContextValue = {
  subscription: ISubscription | null;
  isTrialing: boolean;
  isActive: boolean;
  isPastDue: boolean;
  isExpired: boolean;
  daysLeft?: number;
  isInitialized: boolean;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

const SubscriptionContext = createContext<SubscriptionContextValue | undefined>(
  undefined,
);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { company, accessToken } = useSelector(
    (state: RootState) => state.userAuth,
  );
  const dispatch = useDispatch();

  const sub = company?.subscription;
  const shouldFetch =
    !!accessToken &&
    (!sub ||
      (sub.status !== ISubscriptionStatus.TRIALING &&
        sub.status !== ISubscriptionStatus.ACTIVE &&
        sub.status !== ISubscriptionStatus.EXPIRED &&
        sub.status !== ISubscriptionStatus.CANCELED));

  const {
    data,
    isLoading,
    error: queryError,
    refetch: refetchQuery,
  } = useFetchSubscription(shouldFetch);

  const isNotFoundError =
    queryError &&
    typeof queryError === "object" &&
    "response" in queryError &&
    (queryError as any).response?.status === 404;

  const [isInitialized, setIsInitialized] = useState(false);

  const loading = isLoading;

  useEffect(() => {
    if (!isLoading && accessToken) {
      setIsInitialized(true);
    }
  }, [isLoading, accessToken]);

  useEffect(() => {
    if (data?.data) {
      dispatch(setSubscription(data.data));
    }
  }, [data, dispatch]);

  let isTrialing = false;
  let isActive = false;
  let isPastDue = false;
  let isExpired = false;
  let daysLeft: number | undefined = undefined;

  const subscription = data?.data || company?.subscription || null;

  if (subscription) {
    const now = new Date();
    switch (subscription.status) {
      case ISubscriptionStatus.TRIALING:
        isTrialing = true;
        if (subscription.trialEndsAt) {
          const trialEnd = new Date(subscription.trialEndsAt);
          daysLeft = Math.ceil(
            (trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
          );
        }
        break;
      case ISubscriptionStatus.ACTIVE:
        isActive = true;
        break;
      case ISubscriptionStatus.PAST_DUE:
        isPastDue = true;
        if (subscription.currentPeriodEnd) {
          const periodEnd = new Date(subscription.currentPeriodEnd);
          const graceEnd = new Date(periodEnd);
          graceEnd.setDate(graceEnd.getDate() + 3);
          daysLeft = Math.ceil(
            (graceEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
          );
        }
        break;
      case ISubscriptionStatus.CANCELED:
      case ISubscriptionStatus.EXPIRED:
        isExpired = true;
        break;
    }
  }

  const value: SubscriptionContextValue = {
    subscription,
    isTrialing: false,
    isActive: false,
    isPastDue: false,
    isExpired: true,
    daysLeft,
    isInitialized,
    loading,
    error: isNotFoundError
      ? null
      : queryError
        ? (queryError as any).message
        : null,
    refetch: async () => {
      await refetchQuery();
    },
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error(
      "useSubscription must be used within a SubscriptionProvider",
    );
  }
  return context;
};
