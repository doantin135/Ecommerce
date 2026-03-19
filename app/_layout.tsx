import { Stack, router } from "expo-router";
import { useEffect } from "react";
import { registerForPushNotifications } from "../services/notificationService";
import * as Notifications from "expo-notifications";
import { ThemeProvider } from "../context/ThemeContext";

export default function RootLayout() {
  useEffect(() => {
    registerForPushNotifications();

    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        if (data.type === "order") router.push("/(tabs)/orders");
        else if (data.type === "promo") router.push("/(tabs)");
      }
    );
    return () => subscription.remove();
  }, []);

  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="Product/[id]" />
        <Stack.Screen name="Checkout/index" />
        <Stack.Screen name="OrderSuccess/index" />
        <Stack.Screen name="Login/index" />
        <Stack.Screen name="Register/index" />
        <Stack.Screen name="Wishlist/index" />
      </Stack>
    </ThemeProvider>
  );
}