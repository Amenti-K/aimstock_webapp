import { NextResponse } from "next/server";

export async function GET() {
  const swContent = `
    importScripts("https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js");
    importScripts("https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js");

    firebase.initializeApp({
      apiKey: "${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}",
      authDomain: "${process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}",
      projectId: "${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}",
      storageBucket: "${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}",
      messagingSenderId: "${process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID}",
      appId: "${process.env.NEXT_PUBLIC_FIREBASE_APP_ID}",
    });

    const messaging = firebase.messaging();

    messaging.onBackgroundMessage((payload) => {
    //   console.log("Background message received:", payload);
      const notificationTitle = payload.notification?.title || "AIM Stock Notification";
      const notificationOptions = {
        body: payload.notification?.body,
        icon: "../../../public/icon.png",
        data: payload.data || {},
      };

      self.registration.showNotification(notificationTitle, notificationOptions);
    });

    self.addEventListener('notificationclick', (event) => {
      event.notification.close();
      const targetUrl = event.notification.data?.link || '/dashboard';
      
      event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
          for (const client of clientList) {
            if (client.url === targetUrl && 'focus' in client) {
              return client.focus();
            }
          }
          if (clients.openWindow) {
            return clients.openWindow(targetUrl);
          }
        })
      );
    });
  `;

  return new NextResponse(swContent, {
    headers: {
      "Content-Type": "application/javascript",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Service-Worker-Allowed": "/",
    },
  });
}
