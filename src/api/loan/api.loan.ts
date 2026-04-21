import { useMutate, useFetch, useInfiniteFetch } from "@/hooks/query.hook";
import endpoints from "@/lib/endpoints";
import { queryKeys } from "@/lib/queryKeys";
import { toast } from "sonner";
import { IAccount } from "@/api/account/api.account";
import {
  INewLoanTranx,
  IUpdateLoanTranx,
} from "@/components/interface/loan/loan.interface";

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

export const useInfiniteLoanPartners = (
  enabled: boolean = true,
  filterOptions?: Record<string, any>,
) => {
  return useInfiniteFetch<any>(endpoints.LOANPARTNERS, {
    queryKey: queryKeys.loans.partners.list(filterOptions),
    enabled,
    params: { ...filterOptions, limit: 10 },
  });
};

export const useGetLoanTransactionsInfinite = (
  partnerId: string,
  enabled?: boolean,
) => {
  return useInfiniteFetch<any>(endpoints.LOANPARTNERTRANX + `/${partnerId}`, {
    queryKey: queryKeys.loans.partners.transactions(partnerId),
    params: { limit: 10 },
    enabled: enabled ?? true,
  });
};

export const useCreateLoanTranx = () => {
  return useMutate<INewLoanTranx>(endpoints.LOANTRANSACTION, "post", {
    onError: onErrorNotification,
    onSuccess: () => toast.success("Loan transaction created successfully!"),
    queryKey: queryKeys.loans.partners.root,
  });
};

export const useFetchPartnersTranx = (id: string, enabled?: boolean) => {
  return useFetch<any>(endpoints.LOANTRANSACTION + `/${id}`, {
    queryKey: queryKeys.loans.detail(id),
    enabled: enabled ?? !!id,
  });
};

export const useUpdateLoanTx = () => {
  return useMutate<IUpdateLoanTranx>(
    (data: IUpdateLoanTranx) => `${endpoints.LOANTRANSACTION}/${data.id}`,
    "patch",
    {
      onError: onErrorNotification,
      onSuccess: () => toast.success("Loan transaction updated successfully!"),
      queryKey: queryKeys.loans.partners.root,
    },
  );
};

export const useDeleteLoanTx = () => {
  return useMutate(
    (data: { id: string }) => `${endpoints.LOANTRANSACTION}/${data.id}`,
    "delete",
    {
      onError: onErrorNotification,
      onSuccess: () => toast.success("Loan transaction deleted successfully!"),
      queryKey: queryKeys.loans.partners.root,
    },
  );
};
