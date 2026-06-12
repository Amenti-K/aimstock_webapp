"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { messaging, requestForToken } from "@/lib/firebase";
import { onMessage, MessagePayload } from "firebase/messaging";
import { useRegisterDeviceToken } from "@/api/notification/api.notification";
import { useAppSelector } from "@/redux/hooks";
import { toast } from "sonner";

interface NotificationContextType {
  devicePushToken: string | null;
  notification: MessagePayload | null;
  error: Error | null;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotification must be used within a NotificationProvider",
    );
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [devicePushToken, setDevicePushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<MessagePayload | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const { accessToken } = useAppSelector((state) => state.userAuth);
  const { mutate: registerToken } = useRegisterDeviceToken();

  useEffect(() => {
    // Only attempt registration if user is logged in
    if (!accessToken) return;

    const initNotifications = async () => {
      try {
        // 1. Check browser support
        if (!("Notification" in window)) {
          console.warn("This browser does not support desktop notification");
          return;
        }

        // 2. Request permission if not already granted
        if (Notification.permission === "default") {
          const permission = await Notification.requestPermission();
          if (permission !== "granted") return;
        }

        // 3. Get FCM Token
        const token = await requestForToken();
        if (token) {
          setDevicePushToken(token);

          // 4. Register with backend as WEB platform
          registerToken({
            token: token,
            platform: "WEB",
            provider: "FCM",
          });
        }

        // 5. Foreground message handling
        if (messaging) {
          const unsubscribe = onMessage(messaging, (payload) => {
            // console.log("Foreground message received:", payload);
            setNotification(payload);

            // Show in-app toast
            toast.info(payload.notification?.title || "New Notification", {
              description: payload.notification?.body,
              action: payload.data?.link
                ? {
                    label: "View",
                    onClick: () => window.open(payload.data?.link, "_blank"),
                  }
                : undefined,
            });
          });

          return unsubscribe;
        }
      } catch (err) {
        console.error("Notification initialization error:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    };

    const cleanup = initNotifications();

    return () => {
      cleanup.then((unsubscribe) => unsubscribe?.());
    };
  }, [accessToken, registerToken]);

  return (
    <NotificationContext.Provider
      value={{ devicePushToken, notification, error }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
