import { IResponse } from "@/components/interface/common.interface";
import {
  IAccount,
  IAccountCreate,
  IAccountDetail,
  IAccountSelectorResponse,
  IAccountSummary,
  IAccountTransfer,
  IAccountUpdate,
} from "@/components/interface/interface.account";
import { AccountFormData } from "@/components/schema/account.schema";
import { useMutate, useFetch, useInfiniteFetch } from "@/hooks/query.hook";
import endpoints from "@/lib/endpoints";
import { queryKeys } from "@/lib/queryKeys";
import { toast } from "sonner";

const onErrorNotification = (error: any) => {
  toast.error(
    error.response?.data?.message ||
      error.response?.data?.msg ||
      "An error occurred",
  );
};

const onSuccessNotification = (data: any) => {
  toast.success(data?.message || data?.msg || "Success!");
};

export const useGetSummary = (enabled?: boolean) => {
  return useFetch<IAccountSummary>(`${endpoints.ACCOUNT}/summary`, {
    queryKey: queryKeys.accounts.summary(),
    enabled: enabled ?? true,
  });
};

export const useGetAccount = (id: string, enabled?: boolean) => {
  return useFetch<IResponse<IAccount>>(`${endpoints.ACCOUNT}/${id}`, {
    queryKey: queryKeys.accounts.detail(id),
    enabled: enabled ?? !!id,
  });
};

export const useGetAccountsInfinite = (
  filterOptions?: Record<string, any>,
  enabled?: boolean,
) => {
  const { search, ...filter } = filterOptions ?? { search: undefined };
  const queryParams = {
    ...(filter ? { ...filter } : {}),
    ...(search ? { search } : {}),
  };

  return useInfiniteFetch<IResponse<Array<IAccountDetail>>>(endpoints.ACCOUNT, {
    queryKey: queryKeys.accounts.list(queryParams),
    params: { ...queryParams, limit: 10 },
    enabled: enabled ?? true,
  });
};

export const useCreateAccount = () => {
  return useMutate<IAccountCreate>(endpoints.ACCOUNT, "post", {
    onError: onErrorNotification,
    onSuccess: onSuccessNotification,
    queryKey: queryKeys.accounts.root,
  });
};

export const useUpdateAccount = () => {
  return useMutate<IAccountUpdate>(
    (data: any) => `${endpoints.ACCOUNT}/${data.id}`,
    "patch",
    {
      onError: onErrorNotification,
      onSuccess: onSuccessNotification,
      queryKey: queryKeys.accounts.root,
    },
  );
};

export const useDeleteAccount = () => {
  return useMutate(
    (data: Partial<AccountFormData>) => `${endpoints.ACCOUNT}/${data.id}`,
    "delete",
    {
      onError: onErrorNotification,
      onSuccess: () => toast.success("Account deleted successfully!"),
      queryKey: queryKeys.accounts.root,
    },
  );
};

export const useFetchAccountSelector = () => {
  return useFetch<IAccountSelectorResponse>(endpoints.ACCOUNT + "/select", {
    queryKey: queryKeys.accounts.selector(),
  });
};

export const useTransferFunds = () => {
  return useMutate<IAccountTransfer>(endpoints.ACCOUNT + "/transfer", "post", {
    onError: onErrorNotification,
    onSuccess: () => toast.success("Funds transferred successfully!"),
    queryKey: queryKeys.accounts.root,
  });
};
