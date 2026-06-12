import { useFetch, useMutate } from "@/hooks/query.hook";
import endpoints from "@/lib/endpoints";
import { queryKeys } from "@/lib/queryKeys";
import { toast } from "sonner";
import { IResponse } from "@/components/interface/common.interface";

export interface IRegisterDeviceToken {
  token: string;
  platform: "ANDROID" | "IOS" | "WEB";
  provider: "FCM";
}

const onErrorNotification = (error: any) => {
  toast.error(
    error.response?.data?.message ||
      error.response?.data?.msg ||
      "An error occurred",
  );
};

export const useRegisterDeviceToken = () => {
  return useMutate<IRegisterDeviceToken>(
    `${endpoints.NOTIFICATION}/device-tokens`,
    "post",
  );
};

export const useFetchNotifications = (filters?: Record<string, any>) => {
  return useFetch<IResponse<any>>(endpoints.NOTIFICATION, {
    queryKey: queryKeys.notifications.list(filters),
    params: filters,
  });
};

export const useFetchUnreadCount = () => {
  return useFetch<IResponse<{ unreadCount: number }>>(
    `${endpoints.NOTIFICATION}/unread-count`,
    {
      queryKey: queryKeys.notifications.unreadCount(),
    },
  );
};

export const useMarkNotificationAsRead = () => {
  return useMutate(
    (data: { notificationId: string }) =>
      `${endpoints.NOTIFICATION}/${data.notificationId}/read`,
    "patch",
    {
      onError: onErrorNotification,
      queryKey: queryKeys.notifications.root,
    },
  );
};

export const useMarkAllNotificationsAsRead = () => {
  return useMutate(`${endpoints.NOTIFICATION}/read-all`, "patch", {
    onSuccess: () => toast.success("All notifications marked as read"),
    onError: onErrorNotification,
    queryKey: queryKeys.notifications.root,
  });
};
