import { useMutate, useFetch, useInfiniteFetch } from "@/hooks/query.hook";
import endpoints from "@/lib/endpoints";
import { queryKeys } from "@/lib/queryKeys";
import { toast } from "sonner";
import { 
  IPurchaseResponse, 
  IPurchaseDailyResponse, 
  INewPurchase, 
  IPurchaseView,
  IPurchase
} from "@/components/interface/purchase/purchase.interface";

const onErrorNotification = (error: any) => {
  toast.error(error.response?.data?.message || error.response?.data?.msg || "An error occurred");
};

const onSuccessNotification = (data: any) => {
  toast.success(data?.message || data?.msg || "Success!");
};

export const useFetchPurchases = (
  page: number,
  size: number,
  filterOptions?: Record<string, any>,
  enabled?: boolean
) => {
  const { search, ...filter } = filterOptions ?? { search: undefined };
  const queryParams = {
    page: page?.toString(),
    size: size?.toString(),
    ...(filter ? { ...filter } : {}),
    ...(search ? { search } : {}),
  };

  return useFetch<IPurchaseResponse>(endpoints.PURCHASE, {
    queryKey: queryKeys.purchases.list(queryParams),
    params: queryParams,
    enabled: enabled ?? true,
  });
};

export const useInfinitePurchases = (
  enabled: boolean,
  filters: Record<string, any> = {}
) => {
  return useInfiniteFetch<IPurchaseResponse>(endpoints.PURCHASE, {
    queryKey: queryKeys.purchases.list(filters),
    params: { ...filters, limit: 10 },
    enabled,
  });
};

export const useCreatePurchase = () => {
  return useMutate<INewPurchase>(endpoints.PURCHASE, "post", {
    onError: onErrorNotification,
    onSuccess: onSuccessNotification,
    queryKey: queryKeys.purchases.root,
  });
};

export const useFetchDailyPurchaseReport = (
  date: Date,
  enabled?: boolean
) => {
  const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const queryParams = {
    date: formattedDate,
  };
  return useFetch<IPurchaseDailyResponse>(endpoints.PURCHASE + `/daily-report`, {
    queryKey: queryKeys.purchases.list(queryParams),
    params: queryParams,
    enabled: enabled ?? true,
  });
};

export const useFetchPurchase = (id: string, enabled?: boolean) => {
  return useFetch<{ data: IPurchaseView }>(`${endpoints.PURCHASE}/${id}`, {
    queryKey: queryKeys.purchases.detail(id),
    enabled: enabled ?? !!id,
  });
};

export const useUpdatePurchase = (id: string) => {
  return useMutate<Partial<IPurchase>>(`${endpoints.PURCHASE}/${id}`, "patch", {
    onError: onErrorNotification,
    onSuccess: () => toast.success("Purchase updated successfully!"),
    queryKey: queryKeys.purchases.root,
  });
};

export const useDeletePurchase = () => {
  return useMutate(
    (data: { id: string }) => `${endpoints.PURCHASE}/${data.id}`,
    "delete",
    {
      onError: onErrorNotification,
      onSuccess: () => toast.success("Purchase Deleted successfully!"),
      queryKey: queryKeys.purchases.root,
    }
  );
};
