import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    
    shouldShowBanner: true, 
    shouldShowList: true,   
  }),
});


export const registerForPushNotifications = async (): Promise<string | null> => {
  if (!Device.isDevice) {
    console.log("Thông báo chỉ hoạt động trên thiết bị thật");
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Không có quyền thông báo");
    return null;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "ShopNow",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#3498db",
    });
  }

  return "granted";
};

// Gửi thông báo đặt hàng thành công
export const sendOrderNotification = async (orderId: string) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: " Đặt hàng thành công!",
      body: `Đơn hàng #${orderId} đã được xác nhận. Chúng tôi sẽ giao hàng trong 2-3 ngày.`,
      data: { type: "order", orderId },
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 1 },

  });
};

// Gửi thông báo khuyến mãi
export const sendPromoNotification = async (message: string) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: " Ưu đãi hôm nay!",
      body: message,
      data: { type: "promo" },
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 1 },

  });
};

// Gửi thông báo giao hàng
export const sendShippingNotification = async (orderId: string) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Đơn hàng đang được giao!",
      body: `Đơn hàng #${orderId} đang trên đường đến bạn.`,
      data: { type: "shipping", orderId },
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 1 },

  });
};