import React, { useCallback, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import {
  Order,
  getOrders,
  cancelOrder,
  syncOrderStatus,
} from "../../services/orderService";
import { auth } from "../../config/firebaseConfig";

const STATUS_LABEL: Record<Order["status"], string> = {
  pending: "⏳ Chờ xác nhận",
  processing: "⚙️ Đang xử lý",
  shipped: "🚚 Đang giao",
  delivered: "✅ Đã giao",
  cancelled: "❌ Đã hủy",
};

const STATUS_COLOR: Record<Order["status"], string> = {
  pending: "#FF9500",
  processing: "#3498db",
  shipped: "#9b59b6",
  delivered: "#2ecc71",
  cancelled: "#e74c3c",
};

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [user, setUser] = useState(auth.currentUser);

  useFocusEffect(
    useCallback(() => {
      // Cập nhật trạng thái user mỗi khi vào tab
      const currentUser = auth.currentUser;
      setUser(currentUser);

      // Chỉ load đơn hàng nếu đã đăng nhập
      if (currentUser) {
        getOrders().then(setOrders);
      } else {
        setOrders([]);
      }
    }, []),
  );

  const handleCancel = (id: string) => {
    Alert.alert("Hủy đơn hàng", "Bạn có chắc muốn hủy đơn này?", [
      { text: "Không", style: "cancel" },
      {
        text: "Hủy đơn",
        style: "destructive",
        onPress: async () => {
          await cancelOrder(id);
          getOrders().then(setOrders);
        },
      },
    ]);
  };

  const formatPrice = (price: any) => {
    const num =
      typeof price === "string" ? Number(price.replace(/[^\d]/g, "")) : price;
    return num.toLocaleString("vi-VN") + "₫";
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  useFocusEffect(
    useCallback(() => {
      const currentUser = auth.currentUser;
      setUser(currentUser);

      if (currentUser) {
        // Sync status từ server trước rồi mới load
        syncOrderStatus().then(() => {
          getOrders().then(setOrders);
        });
      } else {
        setOrders([]);
      }
    }, []),
  );

  // Chưa đăng nhập → hiện màn hình yêu cầu đăng nhập
  if (!user) {
    return (
      <View style={styles.root}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Đơn hàng của tôi</Text>
        </View>
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyIcon}>🔒</Text>
          <Text style={styles.emptyTitle}>Chưa đăng nhập</Text>
          <Text style={styles.emptySubtitle}>
            Vui lòng đăng nhập để xem đơn hàng
          </Text>
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => router.push("/Login")}
          >
            <Text style={styles.loginBtnText}>Đăng nhập ngay</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Đơn hàng của tôi</Text>
      </View>

      {orders.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={styles.emptyTitle}>Chưa có đơn hàng nào</Text>
          <Text style={styles.emptySubtitle}>Hãy mua sắm và đặt hàng nhé!</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {orders.map((order) => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <View>
                  <Text style={styles.orderId}>
                    #{order.id.slice(-6).toUpperCase()}
                  </Text>
                  <Text style={styles.orderDate}>
                    {formatDate(order.createdAt)}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: STATUS_COLOR[order.status] + "20" },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: STATUS_COLOR[order.status] },
                    ]}
                  >
                    {STATUS_LABEL[order.status]}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />
              {order.items.map((item, index) => (
                <View key={index} style={styles.orderItem}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    • {item.name}
                  </Text>
                  <Text style={styles.itemQty}>x{item.quantity}</Text>
                </View>
              ))}

              <View style={styles.divider} />
              <View style={styles.orderFooter}>
                <View>
                  <Text style={styles.paymentMethod}>
                    {order.paymentMethod === "cod" ? "🚚 COD" : "🏦 Banking"}
                  </Text>
                  <Text style={styles.orderTotal}>
                    {formatPrice(order.total)}
                  </Text>
                </View>
                {order.status === "pending" && (
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => handleCancel(order.id)}
                  >
                    <Text style={styles.cancelBtnText}>Hủy đơn</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
          <View style={{ height: 30 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f8f8f8" },
  header: {
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 12,
    backgroundColor: "#fff",
  },
  headerTitle: { fontSize: 22, fontWeight: "800" },
  emptyWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    padding: 30,
  },
  emptyIcon: { fontSize: 64 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: "#1a1a1a" },
  emptySubtitle: { fontSize: 14, color: "#888", textAlign: "center" },
  loginBtn: {
    marginTop: 10,
    backgroundColor: "#3498db",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 14,
  },
  loginBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  orderCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  orderId: { fontSize: 15, fontWeight: "700", color: "#1a1a1a" },
  orderDate: { fontSize: 12, color: "#888", marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: "600" },
  divider: { height: 1, backgroundColor: "#f0f0f0", marginVertical: 10 },
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  itemName: { fontSize: 13, color: "#444", flex: 1 },
  itemQty: { fontSize: 13, color: "#888" },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  paymentMethod: { fontSize: 12, color: "#888", marginBottom: 4 },
  orderTotal: { fontSize: 16, fontWeight: "800", color: "#FF3B30" },
  cancelBtn: {
    borderWidth: 1.5,
    borderColor: "#e74c3c",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  cancelBtnText: { color: "#e74c3c", fontWeight: "600", fontSize: 13 },
});
