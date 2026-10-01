import { useEffect } from "react";
import { Platform } from "react-native";
import { router } from "expo-router";
import * as Notifications from "expo-notifications";

// Local notifications, raised by the app itself (booking confirmed, list over budget). They work in
// Expo Go on Android and iOS. Server-sent push would also need a development build and an Expo push token.
const supported = Platform.OS !== "web";
const ANDROID_CHANNEL = "orders";

if (supported) {
  // Show the banner even while the app is open.
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

let ready: Promise<boolean> | null = null;

// Creates the Android channel and asks for permission the first time a notification is sent.
function ensureReady() {
  if (!supported) return Promise.resolve(false);
  ready ??= (async () => {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL, {
        name: "Orders & budget",
        importance: Notifications.AndroidImportance.HIGH,
      });
    }
    if ((await Notifications.getPermissionsAsync()).granted) return true;
    return (await Notifications.requestPermissionsAsync()).granted;
  })().catch((error) => {
    console.warn("Notifications are unavailable:", error);
    return false;
  });
  return ready;
}

// Shows a notification now. `url` is an app route opened when it's tapped, e.g. "/property/<id>".
export async function notify(title: string, body: string, url?: string) {
  if (!(await ensureReady())) return;
  await Notifications.scheduleNotificationAsync({
    content: { title, body, data: url ? { url } : {} },
    trigger: Platform.OS === "android" ? { channelId: ANDROID_CHANNEL } : null,
  });
}

// Opens the screen a notification points to when it's tapped, including when the tap launched the app.
// `enabled` should become true once the root navigator is mounted.
export function useNotificationTapNavigation(enabled: boolean) {
  useEffect(() => {
    if (!supported || !enabled) return;

    const open = (response: Notifications.NotificationResponse | null) => {
      const url = response?.notification.request.content.data?.url;
      if (typeof url === "string") router.push(url as never);
    };

    open(Notifications.getLastNotificationResponse());
    Notifications.clearLastNotificationResponse();
    const subscription = Notifications.addNotificationResponseReceivedListener(open);
    return () => subscription.remove();
  }, [enabled]);
}
