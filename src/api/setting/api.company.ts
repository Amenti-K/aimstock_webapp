import endpoints from "@/lib/endpoints";
import { queryKeys } from "@/lib/queryKeys";
import { useMutate } from "@/hooks/query.hook";
import { AxiosError } from "axios";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { setCompanyName } from "@/redux/slices/userAuthSlice";

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

export const useUpdateCompany = () => {
  const dispatch = useDispatch();

  const onError = (error: AxiosError | any) => {
    onErrorNotification(error);
  };

  const onSuccess = (data: any) => {
    dispatch(setCompanyName(data.data.name));
    onSuccessNotification("Company profile updated successfully");
  };

  return useMutate((data) => `${endpoints.COMPANY}/${data.id}`, "put", {
    onError,
    onSuccess,
    queryKey: [queryKeys.company.root],
  });
};
