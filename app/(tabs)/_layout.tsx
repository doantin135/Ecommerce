import { Tabs, useFocusEffect } from "expo-router";
import { Image, View, Text, StyleSheet } from "react-native";
import { useCallback, useState } from "react";
import { getCartCount } from "../../services/cartService";
import { useTheme } from "../../context/ThemeContext";

function CartIcon({ color }: { color: string }) {
  const [count, setCount] = useState(0);
  useFocusEffect(
    useCallback(() => {
      getCartCount().then(setCount);
    }, []),
  );
  return (
    <View>
      <Image
        source={{ uri: "https://img.icons8.com/ios-filled/100/shopping-cart.png" }}
        style={[styles.tabIcon, { tintColor: color }]}
      />
      {count > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count > 99 ? "99+" : count}</Text>
        </View>
      )}
    </View>
  );
}

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: 75,
          paddingBottom: 16,
          paddingTop: 10,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.subtext,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600", marginTop: 2 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Trang chủ",
          tabBarIcon: ({ color }) => (
            <Image
              source={{ uri: "https://img.icons8.com/ios-filled/100/home.png" }}
              style={[styles.tabIcon, { tintColor: color }]}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Tìm kiếm",
          tabBarIcon: ({ color }) => (
            <Image
              source={{ uri: "https://img.icons8.com/ios-filled/100/search.png" }}
              style={[styles.tabIcon, { tintColor: color }]}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: "Giỏ hàng",
          tabBarIcon: ({ color }) => <CartIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: "Đơn hàng",
          tabBarIcon: ({ color }) => (
            <Image
              source={{ uri: "https://img.icons8.com/ios-filled/100/receipt.png" }}
              style={[styles.tabIcon, { tintColor: color }]}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Tài khoản",
          tabBarIcon: ({ color }) => (
            <Image
              source={{ uri: "https://img.icons8.com/ios-filled/100/user.png" }}
              style={[styles.tabIcon, { tintColor: color }]}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIcon: { width: 26, height: 26 },
  badge: {
    position: "absolute",
    top: -4,
    right: -8,
    backgroundColor: "#FF3B30",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 3,
  },
  badgeText: { color: "#fff", fontSize: 9, fontWeight: "700" },
});