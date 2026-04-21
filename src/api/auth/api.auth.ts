import { useMutate } from "@/hooks/query.hook";
import { useQuery } from "@tanstack/react-query";
import { ILogin, IRegistration } from "@/components/interface/interface.auth";
import endpoints from "@/lib/endpoints";
import AxiosInstance from "@/lib/axiosInstance";
import { AxiosError } from "axios";
import { loginUser } from "@/redux/slices/userAuthSlice";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

// Sign In
export const useSignIn = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { toast } = useToast();

  const onError = (error: AxiosError | any) => {
    toast({
      title: "Error",
      description: error?.response?.data?.message || "Login failed",
      variant: "destructive",
    });
  };

  const onSuccess = (data: any) => {
    // Note: The backend returns data.data for the actual payload using ISingleResponse
    // but the mobile relies on 'data' being the payload. Let's normalize it:
    toast({ title: "Success", description: "Logged in successfully" });
    const payload = data.data || data;

    dispatch(
      loginUser({
        accessToken: payload.accessToken,
        refreshToken: payload.refreshToken,
        company: {
          id: payload.company.id,
          name: payload.company.name,
          setupStep: payload.company.setupStep,
          subscription: payload.subscription,
        },
        user: {
          id: payload.user.userId || payload.user.id,
          name: payload.user.name,
          role: payload.user.role,
          phoneNumber: payload.user.phoneNumber,
          companyId: payload.company.id,
        },
      }),
    );

    // We navigate using router.replace because we don't have mobile's auto-router layout redirect setup perfectly identical yet.
    if (payload.company.setupStep !== 4) {
      router.replace("/app/setup");
    } else {
      router.replace("/app/dashboard");
    }
  };

  return useMutate<ILogin>(endpoints.SIGNIN, "post", {
    onError,
    onSuccess,
  });
};

// Sign Up
export const useSignUp = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { toast } = useToast();

  const onError = (error: AxiosError | any) => {
    toast({
      title: "Error",
      description: error?.response?.data?.message || "Login failed",
      variant: "destructive",
    });
  };

  const onSuccess = (data: any) => {
    toast({ title: "Success", description: "Logged in successfully" });
    const payload = data.data || data;

    dispatch(
      loginUser({
        accessToken: payload.accessToken,
        refreshToken: payload.refreshToken,
        company: {
          id: payload.company.id,
          name: payload.company.name,
          setupStep: payload.company.setupStep,
          subscription: payload.subscription,
        },
        user: {
          id: payload.user.userId || payload.user.id,
          name: payload.user.name,
          role: payload.user.role,
          phoneNumber: payload.user.phoneNumber,
          companyId: payload.company.id,
        },
      }),
    );

    router.replace("/app/setup");
  };

  return useMutate<IRegistration>(endpoints.SIGNUP, "post", {
    onError,
    onSuccess,
  });
};
