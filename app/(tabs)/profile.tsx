import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Alert,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { auth } from "../../config/firebaseConfig";
import { signOut } from "firebase/auth";
import { useTheme } from "../../context/ThemeContext";
import { sendPromoNotification } from "../../services/notificationService";
import { Ionicons } from "@expo/vector-icons";

export default function ProfileScreen() {
  const [user, setUser] = useState(auth.currentUser);
  const { colors, theme } = useTheme();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return unsubscribe;
  }, []);

  const handleLogout = () => {
    Alert.alert("Đăng xuất", "Bạn có chắc muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: async () => {
          await signOut(auth);
          Alert.alert("Thành công", "Đăng xuất thành công!", [
            {
              text: "OK",
              onPress: () => router.replace("/(tabs)"),
            },
          ]);
        },
      },
    ]);
  };

  if (!user) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <StatusBar
          barStyle={theme === "dark" ? "light-content" : "dark-content"}
        />
        <View style={[styles.header, { backgroundColor: colors.header }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Tài khoản
          </Text>
        </View>

        <View style={styles.centered}>
          <Ionicons name="person-circle-outline" size={72} color="#ccc" />
          <Text style={[styles.title, { color: colors.text }]}>
            Chưa đăng nhập
          </Text>
          <Text style={[styles.subtitle, { color: colors.subtext }]}>
            Đăng nhập để xem thông tin tài khoản
          </Text>

          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => router.push("/Login")}
          >
            <Text style={styles.loginBtnText}>Đăng nhập ngay</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.registerBtn, { borderColor: colors.primary }]}
            onPress={() => router.push("/Register")}
          >
            <Text style={[styles.registerBtnText, { color: colors.primary }]}>
              Tạo tài khoản mới
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={theme === "dark" ? "light-content" : "dark-content"}
      />

      <View style={[styles.header, { backgroundColor: colors.header }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Tài khoản
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.profileCard, { backgroundColor: colors.card }]}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user.displayName?.[0]?.toUpperCase() ??
                user.email?.[0]?.toUpperCase() ??
                "U"}
            </Text>
          </View>

          <View style={styles.profileInfo}>
            <Text style={[styles.name, { color: colors.text }]}>
              {user.displayName ?? "Người dùng"}
            </Text>
            <Text style={[styles.email, { color: colors.subtext }]}>
              {user.email}
            </Text>

            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
            >
              <Ionicons
                name={
                  user.emailVerified
                    ? "checkmark-circle-outline"
                    : "alert-circle-outline"
                }
                size={14}
                color={colors.subtext}
              />
              <Text style={[styles.verified, { color: colors.subtext }]}>
                {user.emailVerified ? "Đã xác thực" : "Chưa xác thực"}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.menuCard, { backgroundColor: colors.card }]}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/(tabs)/orders")}
          >
            <Ionicons name="cube-outline" size={20} color={colors.text} />
            <Text style={[styles.menuLabel, { color: colors.text }]}>
              Đơn hàng của tôi
            </Text>
            <Ionicons name="chevron-forward" size={18} color={colors.subtext} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("../Wishlist")}
          >
            <Ionicons name="heart-outline" size={20} color={colors.text} />
            <Text style={[styles.menuLabel, { color: colors.text }]}>
              Sản phẩm yêu thích
            </Text>
            <Ionicons name="chevron-forward" size={18} color={colors.subtext} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="location-outline" size={20} color={colors.text} />
            <Text style={[styles.menuLabel, { color: colors.text }]}>
              Địa chỉ giao hàng
            </Text>
            <Ionicons name="chevron-forward" size={18} color={colors.subtext} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={colors.text}
            />
            <Text style={[styles.menuLabel, { color: colors.text }]}>
              Đổi mật khẩu
            </Text>
            <Ionicons name="chevron-forward" size={18} color={colors.subtext} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() =>
              sendPromoNotification("Giảm 30% tất cả sản phẩm hôm nay!")
            }
          >
            <Ionicons
              name="notifications-outline"
              size={20}
              color={colors.text}
            />
            <Text style={[styles.menuLabel, { color: colors.text }]}>
              Test thông báo
            </Text>
            <Ionicons name="chevron-forward" size={18} color={colors.subtext} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />
        </View>

        <View style={styles.appInfo}>
          <Text style={[styles.appVersion, { color: colors.subtext }]}>
            ShopNow v1.0.0
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.logoutBtn, { backgroundColor: colors.card }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={18} color="#FF3B30" />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  header: {
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 12,
  },

  headerTitle: { fontSize: 22, fontWeight: "800" },

  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    padding: 30,
  },

  title: { fontSize: 20, fontWeight: "700" },

  subtitle: { fontSize: 14, textAlign: "center" },

  loginBtn: {
    backgroundColor: "#3498db",
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 14,
    width: "100%",
    alignItems: "center",
    marginTop: 8,
  },

  loginBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },

  registerBtn: {
    backgroundColor: "transparent",
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 14,
    width: "100%",
    alignItems: "center",
    borderWidth: 1.5,
  },

  registerBtnText: { fontWeight: "700", fontSize: 15 },

  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    margin: 16,
    borderRadius: 16,
    padding: 16,
  },

  avatar: {
    width: 65,
    height: 65,
    borderRadius: 32,
    backgroundColor: "#3498db",
    justifyContent: "center",
    alignItems: "center",
  },

  avatarText: { color: "#fff", fontSize: 26, fontWeight: "800" },

  profileInfo: { flex: 1, gap: 4 },

  name: { fontSize: 17, fontWeight: "700" },

  email: { fontSize: 13 },

  verified: { fontSize: 12 },

  menuCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: "hidden",
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },

  menuLabel: { flex: 1, fontSize: 14, fontWeight: "500" },

  divider: { height: 1, marginLeft: 52 },

  appInfo: { alignItems: "center", marginTop: 20 },

  appVersion: { fontSize: 12 },

  logoutBtn: {
    margin: 16,
    marginTop: 12,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1.5,
    borderColor: "#FF3B30",
  },

  logoutText: {
    color: "#FF3B30",
    fontWeight: "700",
    fontSize: 15,
  },
});
