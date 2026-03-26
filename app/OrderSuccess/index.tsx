import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function OrderSuccessScreen() {
  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.content}>
        <Ionicons name="checkmark-circle" size={80} color="#2ecc71" />

        <Text style={styles.title}>Đặt hàng thành công!</Text>
        <Text style={styles.subtitle}>
          Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đang được xử lý.
        </Text>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="car-outline" size={18} color="#555" />
            <Text style={styles.infoItem}> Giao hàng trong 2-3 ngày</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="phone-portrait-outline" size={18} color="#555" />
            <Text style={styles.infoItem}>
              {" "}
              Theo dõi đơn trong mục Đơn hàng
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={18}
              color="#555"
            />
            <Text style={styles.infoItem}> Hỗ trợ 24/7 nếu có vấn đề</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.homeBtn}
          onPress={() => router.replace("/(tabs)")}
        >
          <Text style={styles.homeBtnText}>Về trang chủ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f8f8f8" },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
    gap: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1a1a1a",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    lineHeight: 22,
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    gap: 12,
    marginTop: 10,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  infoItem: {
    fontSize: 14,
    color: "#444",
    lineHeight: 22,
  },
  homeBtn: {
    backgroundColor: "#3498db",
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 10,
  },
  homeBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
