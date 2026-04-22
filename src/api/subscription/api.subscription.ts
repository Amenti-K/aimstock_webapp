import {
  IActivateSubscription,
  ICancelSubscription,
  INewSubscription,
} from "@/components/interface/subscription/subscription.interface";
import { useMutate, useFetch } from "@/hooks/query.hook";

import { useToast } from "@/hooks/use-toast";
import endpoints from "@/lib/endpoints";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

export const useCreateSubscription = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const onError = (error: AxiosError | any) => {
    toast({
      title: "Error",
      description:
        error?.response?.data?.message || "Failed to create subscription",
      variant: "destructive",
    });
  };
  const onSuccess = (data: any) => {
    queryClient.invalidateQueries({
      queryKey: ["company", data.data.companyId],
    });
    toast({
      title: "Success",
      description: "Subscription created successfully",
    });
  };

  return useMutate<INewSubscription>(endpoints.SUBSCRIPTION, "post", {
    onSuccess,
    onError,
  });
};

export const useActivateSubscription = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const onError = (error: AxiosError | any) => {
    toast({
      title: "Error",
      description:
        error?.response?.data?.message || "Failed to activate subscription",
      variant: "destructive",
    });
  };
  const onSuccess = (data: any) => {
    queryClient.invalidateQueries({
      queryKey: ["company", data.data.companyId],
    });
    toast({
      title: "Success",
      description: "Subscription activated successfully",
    });
  };

  return useMutate<IActivateSubscription>(
    endpoints.SUBSCRIPTION + "/activate",
    "post",
    {
      onSuccess,
      onError,
    }
  );
};

export const useCancelSubscription = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const onError = (error: AxiosError | any) => {
    toast({
      title: "Error",
      description:
        error?.response?.data?.message || "Failed to cancel subscription",
      variant: "destructive",
    });
  };
  const onSuccess = (data: any) => {
    queryClient.invalidateQueries({
      queryKey: ["company", data.data.companyId],
    });
    toast({
      title: "Success",
      description: "Subscription canceled successfully",
    });
  };

  return useMutate<ICancelSubscription>(
    endpoints.SUBSCRIPTION + "/cancel",
    "post",
    {
      onSuccess,
      onError,
    }
  );
};

export const useFetchSubscription = (enabled: boolean = true) => {
  return useFetch<any>(endpoints.SUBSCRIPTION + "/mine", {
    queryKey: ["subscription", "mine"],
    enabled,
  });
};

export const useCreateTrialSubscription = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const onError = (error: AxiosError | any) => {
    toast({
      title: "Error",
      description: error?.response?.data?.message || "Failed to start trial",
      variant: "destructive",
    });
  };

  const onSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["subscription", "mine"] });
    queryClient.invalidateQueries({ queryKey: ["company"] });
    toast({
      title: "Trial Started!",
      description: "Your free trial has been activated successfully.",
    });
  };

  return useMutate(endpoints.SUBSCRIPTION + "/trial", "post", {
    onSuccess,
    onError,
  });
};

