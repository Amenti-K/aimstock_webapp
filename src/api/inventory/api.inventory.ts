import {
  IPaginatedResponse,
  IResponse,
} from "@/components/interface/common.interface";
import {
  IInventory,
  IInventoryAnalytics,
  IInventoryDetail,
  INewInventory,
  ISelectorWarehouseInventoryResponse,
} from "@/components/interface/inventory/inventory.interface";
import { useFetch, useMutate, useInfiniteFetch } from "@/hooks/query.hook";
import endpoints from "@/lib/endpoints";
import { queryKeys } from "@/lib/queryKeys";
import { toast } from "sonner";

interface BulkInventory {
  inventories: Array<Partial<INewInventory>>;
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

export const useCreateBulkInventory = () => {
  return useMutate<BulkInventory>(endpoints.INVENTORY + "/bulk", "post", {
    onError: onErrorNotification,
    onSuccess: onSuccessNotification,
    queryKey: queryKeys.inventories.root,
  });
};

export const useCreateInventory = () => {
  return useMutate<INewInventory>(endpoints.INVENTORY, "post", {
    onError: onErrorNotification,
    onSuccess: onSuccessNotification,
    queryKey: queryKeys.inventories.root,
  });
};

export const useCreateQuickInventory = () => {
  return useMutate<any>(endpoints.INVENTORY + "/quick", "post", {
    onError: onErrorNotification,
    onSuccess: onSuccessNotification,
    queryKey: queryKeys.inventories.root,
  });
};

export const useGetInventoriesInfinite = (
  filterOptions?: Record<string, any>,
  enabled?: boolean,
) => {
  const { search, ...filter } = filterOptions ?? { search: undefined };
  const queryParams = {
    ...(filter ? { ...filter } : {}),
    ...(search ? { search } : {}),
  };

  return useInfiniteFetch<IPaginatedResponse<Array<IInventory>>>(
    endpoints.INVENTORY,
    {
      queryKey: queryKeys.inventories.list(queryParams),
      params: { ...queryParams, limit: 10 },
      enabled: enabled ?? true,
    },
  );
};

export const useFetchInventory = (id: string, enabled?: boolean) => {
  return useFetch<IResponse<IInventoryDetail>>(`${endpoints.INVENTORY}/${id}`, {
    queryKey: queryKeys.inventories.detail(id),
    enabled: enabled ?? !!id,
  });
};

export const useFetchWarehouseInventorySelector = (
  warehouseId: string,
  enabled?: boolean,
) => {
  return useFetch<ISelectorWarehouseInventoryResponse>(
    `${endpoints.INVENTORY}/select/${warehouseId}`,
    {
      queryKey: queryKeys.warehouses.inventories(warehouseId),
      enabled: enabled ?? !!warehouseId,
    },
  );
};

export const useFetchInventoryAnalytics = (
  id: string,
  enabled?: boolean,
  filters: Record<string, any> = {},
) => {
  return useFetch<IResponse<IInventoryAnalytics>>(
    `${endpoints.INVENTORY}/analytics/${id}`,
    {
      queryKey: queryKeys.inventories.analytics(id, filters),
      params: { ...filters },
      enabled: enabled ?? !!id,
    },
  );
};

export const useUpdateInventory = (id: string) => {
  return useMutate<Partial<IInventory>>(
    `${endpoints.INVENTORY}/${id}`,
    "patch",
    {
      onError: onErrorNotification,
      onSuccess: () => toast.success("Inventory updated successfully!"),
      queryKey: queryKeys.inventories.root,
    },
  );
};

export const useDeleteInventory = () => {
  return useMutate(
    (data: { id: string }) => `${endpoints.INVENTORY}/${data.id}`,
    "delete",
    {
      onError: onErrorNotification,
      onSuccess: () => toast.success("Inventory deleted successfully!"),
      queryKey: queryKeys.inventories.root,
    },
  );
};
