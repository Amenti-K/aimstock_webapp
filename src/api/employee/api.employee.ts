import { useMutate, useFetch, useInfiniteFetch } from "@/hooks/query.hook";
import endpoints from "@/lib/endpoints";
import { queryKeys } from "@/lib/queryKeys";
import { toast } from "sonner";

export interface IEmployee {
  id: string;
  name: string;
  phoneNumber: string;
  roleId: string;
  role?: any;
  isActive: boolean;
  createdAt: string;
}

export interface INewEmployee {
  name: string;
  phoneNumber: string;
  roleId: string;
  password?: string;
}

const onErrorNotification = (error: any) => {
  toast.error(error.response?.data?.message || error.response?.data?.msg || "An error occurred");
};

const onSuccessNotification = (data: any) => {
  toast.success(data?.message || data?.msg || "Success!");
};

export const useGetEmployeesInfinite = (
  filterOptions?: Record<string, any>,
  enabled?: boolean
) => {
  const { search, ...filter } = filterOptions ?? { search: undefined };
  const queryParams = {
    ...(filter ? { ...filter } : {}),
    ...(search ? { search } : {}),
  };

  return useInfiniteFetch<any>(endpoints.EMPLOYEE, {
    queryKey: queryKeys.employees.list(queryParams),
    params: { ...queryParams, limit: 10 },
    enabled: enabled ?? true,
  });
};

export const useCreateEmployee = () => {
  return useMutate<INewEmployee>(endpoints.EMPLOYEE, "post", {
    onError: onErrorNotification,
    onSuccess: onSuccessNotification,
    queryKey: queryKeys.employees.root,
  });
};

export const useFetchEmployeeById = (id: string, enabled?: boolean) => {
  return useFetch<IEmployee>(`${endpoints.EMPLOYEE}/${id}`, {
    queryKey: queryKeys.employees.detail(id),
    enabled: enabled ?? !!id,
  });
};

export const useUpdateEmployee = (id: string) => {
  return useMutate<Partial<INewEmployee>>(`${endpoints.EMPLOYEE}/${id}`, "put", {
    onError: onErrorNotification,
    onSuccess: onSuccessNotification,
    queryKey: queryKeys.employees.root,
  });
};

export const useResetPassword = () => {
  return useMutate(
    (data: { id: string; password?: string }) => `${endpoints.EMPLOYEE}/${data.id}/reset-password`,
    "put",
    {
      onError: onErrorNotification,
      onSuccess: () => toast.success("Password reset successfully!"),
    }
  );
};

export const useDeactivateEmployee = () => {
  return useMutate(
    (data: { id: string }) => `${endpoints.EMPLOYEE}/${data.id}`,
    "delete",
    {
      onError: onErrorNotification,
      onSuccess: () => toast.success("Employee deactivated successfully!"),
      queryKey: queryKeys.employees.root,
    }
  );
};
