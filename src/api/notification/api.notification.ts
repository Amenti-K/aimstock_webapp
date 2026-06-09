import { useFetch, useMutate } from "@/hooks/query.hook";
import endpoints from "@/lib/endpoints";
import { queryKeys } from "@/lib/queryKeys";
import { toast } from "sonner";
import { IResponse } from "@/components/interface/common.interface";

export interface IRegisterDeviceToken {
  /** The raw FCM registration token from the browser. */
  token: string;
  /** Physical device OS. For web app, this stays WEB. */
  platform: "ANDROID" | "IOS" | "WEB";
  /** Push SDK / provider. Currently only FCM. */
  provider: "FCM";
}

const onErrorNotification = (error: any) => {
  toast.error(
    error.response?.data?.message ||
      error.response?.data?.msg ||
      "An error occurred",
  );
};

// const onSuccessNotification = (data: any) => {
//   toast.success(data?.message || data?.msg || "Success!");
// };

/**
 * Hook to register or refresh a browser's push token on the backend.
 * Typically called on app launch within the NotificationContext.
 */
export const useRegisterDeviceToken = () => {
  return useMutate<IRegisterDeviceToken>(
    `${endpoints.NOTIFICATION}/device-tokens`,
    "post",
    {
      onSuccess: () => {
        // Silent success for registration as it's a background activity
      },
      onError: (error) => {
        console.error("Failed to register device token on backend:", error);
      },
    },
  );
};

/**
 * Hook to fetch the authenticated user's notification inbox.
 */
export const useFetchNotifications = (filters?: Record<string, any>) => {
  return useFetch<IResponse<any>>(endpoints.NOTIFICATION, {
    queryKey: queryKeys.notifications.list(filters),
    params: filters,
  });
};

/**
 * Hook to get the current unread count for badge display.
 */
export const useFetchUnreadCount = () => {
  return useFetch<IResponse<{ unreadCount: number }>>(
    `${endpoints.NOTIFICATION}/unread-count`,
    {
      queryKey: queryKeys.notifications.unreadCount(),
    },
  );
};

/**
 * Hook to mark a notification as read.
 */
export const useMarkNotificationAsRead = () => {
  return useMutate(
    (data: { notificationId: string }) =>
      `${endpoints.NOTIFICATION}/${data.notificationId}/read`,
    "patch",
    {
      onSuccess: () => {
        // Usually silent as it happens when clicking
      },
      onError: onErrorNotification,
      queryKey: queryKeys.notifications.root,
    },
  );
};

/**
 * Hook to mark all notifications as read.
 */
export const useMarkAllNotificationsAsRead = () => {
  return useMutate(`${endpoints.NOTIFICATION}/read-all`, "patch", {
    onSuccess: () => toast.success("All notifications marked as read"),
    onError: onErrorNotification,
    queryKey: queryKeys.notifications.root,
  });
};
