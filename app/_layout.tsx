import { Stack } from "expo-router"
import {useFonts} from "expo-font"
import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import * as WebBrowser from "expo-web-browser";
import GlobalProvider from "@/lib/global-provider";
import { ShoppingListProvider } from "@/lib/shopping-list";
import { useNotificationTapNavigation } from "@/lib/notifications";
import { KeyboardAvoidingView, Platform } from "react-native";

// On web, Google sign-in redirects back to this app inside a popup; this hands the
// redirect URL (with the auth code) back to openAuthSessionAsync and closes the popup.
WebBrowser.maybeCompleteAuthSession();

export default function RootLayout() {
  const color = "color : s"
  const [fontsLoaded] = useFonts({
    "Rubik-Bold": require("../assets/fonts/Rubik-Bold.ttf"),
    "Rubik-ExtraBold": require("../assets/fonts/Rubik-ExtraBold.ttf"),
    "Rubik-Light": require("../assets/fonts/Rubik-Light.ttf"),
    "Rubik-Medium": require("../assets/fonts/Rubik-Medium.ttf"),
    "Rubik-Regular": require("../assets/fonts/Rubik-Regular.ttf"),
    "Rubik-SemiBold": require("../assets/fonts/Rubik-SemiBold.ttf"),
  });
  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // The Stack below only mounts once fonts load, so wait for that before navigating.
  useNotificationTapNavigation(fontsLoaded);

  if (!fontsLoaded) {
    return null;
  }
  return (
        <GlobalProvider>
          <ShoppingListProvider>
          <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
          <Stack screenOptions={{headerShown : false }} />

          </KeyboardAvoidingView>
          </ShoppingListProvider>
        </GlobalProvider>


);
}
