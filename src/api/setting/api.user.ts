import endpoints from "@/lib/endpoints";
import { queryKeys } from "@/lib/queryKeys";
import { useMutate } from "@/hooks/query.hook";
import { updateUser } from "@/redux/slices/userAuthSlice";
import { AxiosError } from "axios";
import { useDispatch } from "react-redux";
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

export interface IUpdateProfile {
  name: string;
  phoneNumber?: string;
}

export interface IChangePassword {
  currentPassword: string;
  newPassword: string;
}

export const useUpdateUserProfile = () => {
  const dispatch = useDispatch();

  const onError = (error: AxiosError | any) => {
    onErrorNotification(error);
  };
  const onSuccess = (data: any) => {
    if (data.data?.name) dispatch(updateUser(data.data));
    onSuccessNotification("Profile updated successfully");
  };

  return useMutate<IUpdateProfile>(
    endpoints.EMPLOYEE + "/update-profile",
    "put",
    {
      onError,
      onSuccess,
      queryKey: [queryKeys.user.root],
    },
  );
};

export const useChangePassword = () => {
  const onError = (error: AxiosError | any) => {
    onErrorNotification(error);
  };
  const onSuccess = (data: any) => {
    onSuccessNotification("Password changed successfully");
  };

  return useMutate<IChangePassword>(
    endpoints.EMPLOYEE + "/change-password",
    "put",
    { onError, onSuccess },
  );
};
