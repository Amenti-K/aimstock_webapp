import { IResponse } from "@/components/interface/common.interface";
import { IPlan } from "@/components/interface/subscription/subscription.interface";
import { useFetch, useMutate } from "@/hooks/query.hook";
import { useToast } from "@/hooks/use-toast";
import endpoints from "@/lib/endpoints";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

export const useFetchPlans = () => {
  return useFetch<IResponse<Array<IPlan>>>(endpoints.PLAN, {
    queryKey: ["plans"],
  });
};

export const useFetchPlanById = (id: string) => {
  return useFetch<IResponse<IPlan>>(endpoints.PLAN + `/${id}`, {
    queryKey: ["plan", id],
    enabled: !!id,
  });
};

export const useCreatePlan = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const onError = (error: AxiosError | any) => {
    toast({
      title: "Error",
      description: error?.response?.data?.message || "Failed to create plan",
      variant: "destructive",
    });
  };
  const onSuccess = (data: any) => {
    queryClient.invalidateQueries({
      queryKey: ["plans"],
    });
    toast({
      title: "Success",
      description: "Plan created successfully",
    });
  };

  return useMutate(endpoints.PLAN, "post", {
    onSuccess,
    onError,
  });
};

export const useUpdatePlan = (id: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const onError = (error: AxiosError | any) => {
    toast({
      title: "Error",
      description: error?.response?.data?.message || "Failed to update plan",
      variant: "destructive",
    });
  };
  const onSuccess = (data: any) => {
    queryClient.invalidateQueries({
      queryKey: ["plans"],
    });
    toast({
      title: "Success",
      description: "Plan updated successfully",
    });
  };

  return useMutate(endpoints.PLAN + `/${id}`, "patch", {
    onSuccess,
    onError,
  });
};

export const useDeactivatePlan = (id: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const onError = (error: AxiosError | any) => {
    toast({
      title: "Error",
      description:
        error?.response?.data?.message || "Failed to deactivate plan",
      variant: "destructive",
    });
  };
  const onSuccess = (data: any) => {
    queryClient.invalidateQueries({
      queryKey: ["plans"],
    });
    toast({
      title: "Success",
      description: "Plan deactivated successfully",
    });
  };

  return useMutate(endpoints.PLAN + `/${id}`, "delete", {
    onSuccess,
    onError,
  });
};
