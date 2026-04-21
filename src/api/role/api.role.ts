import { useMutate, useFetch, useInfiniteFetch } from "@/hooks/query.hook";
import endpoints from "@/lib/endpoints";
import { queryKeys } from "@/lib/queryKeys";
import { toast } from "sonner";
import axiosInstance from "@/lib/axiosInstance";


export interface IRole {
  id: string;
  name: string;
  description?: string;
  permissions: any[];
}

export interface INewRole {
  name: string;
  description?: string;
  permissions: string[];
}

const onErrorNotification = (error: any) => {
  toast.error(error.response?.data?.message || error.response?.data?.msg || "An error occurred");
};

const onSuccessNotification = (data: any) => {
  toast.success(data?.message || data?.msg || "Success!");
};

export const useGetRolesInfinite = (
  filterOptions?: Record<string, any>,
  enabled?: boolean
) => {
  const { search, ...filter } = filterOptions ?? { search: undefined };
  const queryParams = {
    ...(filter ? { ...filter } : {}),
    ...(search ? { search } : {}),
  };

  return useInfiniteFetch<any>(endpoints.ROLE, {
    queryKey: queryKeys.roles.list(queryParams),
    params: { ...queryParams, limit: 10 },
    enabled: enabled ?? true,
  });
};

export const useCreateRole = () => {
  return useMutate<INewRole>(endpoints.ROLE, "post", {
    onError: onErrorNotification,
    onSuccess: onSuccessNotification,
    queryKey: queryKeys.roles.root,
  });
};

export const useUpdateRole = (id: string) => {
  return useMutate<Partial<INewRole>>(`${endpoints.ROLE}/${id}`, "patch", {
    onError: onErrorNotification,
    onSuccess: onSuccessNotification,
    queryKey: queryKeys.roles.root,
  });
};

export const useFetchRoleById = (id: string, enabled?: boolean) => {
  return useFetch<IRole>(`${endpoints.ROLE}/${id}`, {
    queryKey: queryKeys.roles.detail(id),
    enabled: enabled ?? !!id,
  });
};

export const useDeleteRole = () => {
  return useMutate(
    (data: { id: string }) => `${endpoints.ROLE}/${data.id}`,
    "delete",
    {
      onError: onErrorNotification,
      onSuccess: () => toast.success("Role deleted successfully!"),
      queryKey: queryKeys.roles.root,
    }
  );
};

export const useFetchRoleSelector = () => {
  return useFetch<any>(endpoints.ROLE + "/select", {
    queryKey: queryKeys.roles.selector(),
  });
};

export const fetchRolePermissionsApi = async (roleId: string) => {
  const { data } = await axiosInstance.get(`${endpoints.ROLE}/permissions/${roleId}`);
  return data;
};

