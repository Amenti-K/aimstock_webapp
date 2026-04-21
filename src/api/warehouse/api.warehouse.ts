import { useMutate, useFetch, useInfiniteFetch } from "@/hooks/query.hook";
import endpoints from "@/lib/endpoints";
import { queryKeys } from "@/lib/queryKeys";
import { toast } from "sonner";
import {
  IWarehouse,
  IWarehouseResponse,
  IWarehouseSelectResponse,
  IWarehouseDetail,
  INewWarehouse,
} from "@/components/interface/warehouse/warehouse.interface";
import { IResponse } from "@/components/interface/common.interface";

interface BulkWarehouse {
  warehouses: Array<Partial<INewWarehouse>>;
}

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

export const useGetWarehousesInfinite = (
  filterOptions?: Record<string, any>,
  enabled?: boolean,
) => {
  const { search, ...filter } = filterOptions ?? { search: undefined };
  const queryParams = {
    ...(filter ? { ...filter } : {}),
    ...(search ? { search } : {}),
  };

  return useInfiniteFetch<IWarehouseResponse>(endpoints.WAREHOUSE, {
    queryKey: queryKeys.warehouses.list(queryParams),
    params: { ...queryParams, limit: 10 },
    enabled: enabled ?? true,
  });
};

export const useCreateWarehouse = () => {
  return useMutate<IWarehouse>(endpoints.WAREHOUSE, "post", {
    onError: onErrorNotification,
    onSuccess: onSuccessNotification,
    queryKey: queryKeys.warehouses.root,
  });
};

export const useCreateManyWarehouses = () => {
  return useMutate<BulkWarehouse>(endpoints.WAREHOUSE + "/bulk", "post", {
    onError: onErrorNotification,
    onSuccess: onSuccessNotification,
    queryKey: queryKeys.warehouses.root,
  });
};

export const useUpdateWarehouse = (id: string) => {
  return useMutate<IWarehouse>(endpoints.WAREHOUSE + "/" + id, "patch", {
    onError: onErrorNotification,
    onSuccess: onSuccessNotification,
    queryKey: queryKeys.warehouses.root,
  });
};

export const useFetchWarehouseById = (id: string, enabled?: boolean) => {
  return useFetch<IResponse<IWarehouseDetail>>(`${endpoints.WAREHOUSE}/${id}`, {
    queryKey: queryKeys.warehouses.detail(id),
    enabled: enabled ?? !!id,
  });
};

export const useFetchWarehouseSelector = () => {
  return useFetch<IWarehouseSelectResponse>(endpoints.WAREHOUSE + "/select", {
    queryKey: queryKeys.warehouses.selector(),
  });
};

export const useDeleteWarehouse = () => {
  return useMutate(
    (data: Partial<IWarehouse>) => `${endpoints.WAREHOUSE}/${data.id}`,
    "delete",
    {
      onError: onErrorNotification,
      onSuccess: () => onSuccessNotification("Warehouse Deleted successfully!"),
      queryKey: queryKeys.warehouses.root,
    },
  );
};
