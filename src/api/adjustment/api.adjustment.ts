import { INewAdjustment } from "@/components/interface/adjustment/adjustment.interface";
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

export const useGetAdjustmentsInfinite = (
  filterOptions?: Record<string, any>,
  enabled?: boolean,
) => {
  const { search, ...filter } = filterOptions ?? { search: undefined };
  const queryParams = {
    ...(filter ? { ...filter } : {}),
    ...(search ? { search } : {}),
  };

  return useInfiniteFetch<any>(endpoints.ADJUSTMENT, {
    queryKey: queryKeys.adjustments.list(queryParams),
    params: { ...queryParams, limit: 10 },
    enabled: enabled ?? true,
  });
};

export const useCreateAdjustment = () => {
  return useMutate<INewAdjustment>(endpoints.ADJUSTMENT, "post", {
    onError: onErrorNotification,
    onSuccess: onSuccessNotification,
    queryKey: queryKeys.adjustments.root,
  });
};

export const useFetchAdjustmentById = (id: string, enabled?: boolean) => {
  return useFetch<any>(`${endpoints.ADJUSTMENT}/${id}`, {
    queryKey: queryKeys.adjustments.detail(id),
    enabled: enabled ?? !!id,
  });
};

export const useUpdateAdjustment = (id: string) => {
  return useMutate<Partial<INewAdjustment>>(
    `${endpoints.ADJUSTMENT}/${id}`,
    "patch",
    {
      onError: onErrorNotification,
      onSuccess: onSuccessNotification,
      queryKey: queryKeys.adjustments.root,
    },
  );
};

export const useDeleteAdjustment = () => {
  return useMutate(
    (data: { id: string }) => `${endpoints.ADJUSTMENT}/${data.id}`,
    "delete",
    {
      onError: onErrorNotification,
      onSuccess: () => toast.success("Adjustment deleted successfully!"),
      queryKey: queryKeys.adjustments.root,
    },
  );
};
