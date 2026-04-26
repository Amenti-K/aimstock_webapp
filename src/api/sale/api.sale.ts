import { useMutate, useFetch, useInfiniteFetch } from "@/hooks/query.hook";
import endpoints from "@/lib/endpoints";
import { queryKeys } from "@/lib/queryKeys";
import { toast } from "sonner";
import {
  ISaleResponse,
  ISaleDailyResponse,
  INewSale,
  ISaleView,
  ISale,
} from "@/components/interface/sales/interface.sale";
import {
  IPaginatedResponse,
  IResponse,
} from "@/components/interface/common.interface";

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

export const useFetchSales = (
  page: number,
  size: number,
  filterOptions?: Record<string, any>,
  enabled?: boolean,
) => {
  const { search, ...filter } = filterOptions ?? { search: undefined };
  const queryParams = {
    page: page?.toString(),
    size: size?.toString(),
    ...(filter ? { ...filter } : {}),
    ...(search ? { search } : {}),
  };

  return useFetch<ISaleResponse>(endpoints.SALE, {
    queryKey: queryKeys.sales.list(queryParams),
    params: queryParams,
    enabled: enabled ?? true,
  });
};

export const useInfiniteSales = (
  enabled: boolean,
  filters: Record<string, any> = {},
) => {
  return useInfiniteFetch<IPaginatedResponse<ISale>>(endpoints.SALE, {
    queryKey: queryKeys.sales.list(filters),
    params: { ...filters, limit: 10 },
    enabled,
  });
};

export const useCreateSale = () => {
  return useMutate<INewSale>(endpoints.SALE, "post", {
    onError: onErrorNotification,
    onSuccess: onSuccessNotification,
    queryKey: queryKeys.sales.root,
  });
};

export const useFetchDailySaleReport = (date: Date, enabled?: boolean) => {
  const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  const queryParams = {
    date: formattedDate,
  };
  return useFetch<ISaleDailyResponse>(endpoints.SALE + `/daily-report`, {
    queryKey: queryKeys.sales.list(queryParams),
    params: queryParams,
    enabled: enabled ?? true,
  });
};

export const useFetchSale = (id: string, enabled?: boolean) => {
  return useFetch<IResponse<ISaleView>>(`${endpoints.SALE}/${id}`, {
    queryKey: queryKeys.sales.detail(id),
    enabled: enabled ?? !!id,
  });
};

export const useUpdateSale = (id: string) => {
  return useMutate<Partial<ISale>>(`${endpoints.SALE}/${id}`, "patch", {
    onError: onErrorNotification,
    onSuccess: () => toast.success("Sale updated successfully!"),
    queryKey: queryKeys.sales.root,
  });
};

export const useDeleteSale = () => {
  return useMutate(
    (data: { id: string }) => `${endpoints.SALE}/${data.id}`,
    "delete",
    {
      onError: onErrorNotification,
      onSuccess: () => toast.success("Sale Deleted successfully!"),
      queryKey: queryKeys.sales.root,
    },
  );
};
