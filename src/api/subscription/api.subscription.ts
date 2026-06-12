import { useMutate, useFetch } from "@/hooks/query.hook";

import { useToast } from "@/hooks/use-toast";
import endpoints from "@/lib/endpoints";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

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
