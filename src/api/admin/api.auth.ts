import { useFetch, useMutate } from "@/hooks/query.hook";
import endpoints from "@/lib/endpoints";
import { AxiosError } from "axios";
import { useDispatch } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import { login } from "@/redux/slices/authSlice";
import { useToast } from "@/hooks/use-toast";
import { IRegisterAdmin } from "@/components/interface/admin/admin.interface";

export const useAdminLogin = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const onError = (error: AxiosError | any) => {
    toast({
      title: "Error",
      description: error?.response?.data?.message || "Login failed",
      variant: "destructive",
    });
  };
  const onSuccess = (data: any) => {
    dispatch(login(data));
    queryClient.invalidateQueries({ queryKey: ["admin"] });
    toast({ title: "Success", description: "Logged in successfully" });
  };

  return useMutate(endpoints.ADMIN + "/login", "post", { onSuccess, onError });
};

export const useRegisterAdmin = () => {
  const { toast } = useToast();

  const onError = (error: AxiosError | any) => {
    toast({
      title: "Error",
      description: error?.response?.data?.message || "Failed to register admin",
      variant: "destructive",
    });
  };
  const onSuccess = () => {
    toast({ title: "Success", description: "Admin registered successfully" });
  };

  return useMutate(endpoints.ADMIN + "/register", "post", {
    onSuccess,
    onError,
  });
};

export const useGetMaintenanceStatus = () => {
  return useFetch<{ maintenance: boolean }>(endpoints.ADMIN + "/status", {
    queryKey: ["admin", "maintenance-status"],
  });
};

// Enable system maintenance mode (blocks all non-admin users)
export const useEnableMaintenance = () => {
  const { toast } = useToast();

  const onError = (error: AxiosError | any) => {
    toast({
      title: "Error",
      description:
        error?.response?.data?.message || "Failed to enable maintenance mode",
      variant: "destructive",
    });
  };
  const onSuccess = () => {
    toast({
      title: "Maintenance Enabled",
      description: "System is now in maintenance mode. Users will be blocked.",
    });
  };

  return useMutate(endpoints.ADMIN + "/status/enable", "post", {
    onSuccess,
    onError,
  });
};

// Disable system maintenance mode (restores access)
export const useDisableMaintenance = () => {
  const { toast } = useToast();

  const onError = (error: AxiosError | any) => {
    toast({
      title: "Error",
      description:
        error?.response?.data?.message || "Failed to disable maintenance mode",
      variant: "destructive",
    });
  };
  const onSuccess = () => {
    toast({
      title: "Maintenance Disabled",
      description: "System is back online. Users can now access the app.",
    });
  };

  return useMutate(endpoints.ADMIN + "/status/disable", "post", {
    onSuccess,
    onError,
  });
};
