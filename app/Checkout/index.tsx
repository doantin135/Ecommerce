import React, { useState, useCallback, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Alert,
  Image,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { CartItem, getCart, clearCart } from "../../services/cartService";
import { addOrder } from "../../services/orderService";

export default function CheckoutScreen() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [address, setAddress] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "banking">("cod");
  const [loading, setLoading] = useState(false);
  const isSubmitting = useRef(false); // ← dùng ref thay useState

  useFocusEffect(
    useCallback(() => {
      getCart().then(setCart);
    }, []),
  );

  const parsePrice = (price: any): number => {
    if (typeof price === "number") return price;
    if (typeof price === "string") return Number(price.replace(/[^\d]/g, ""));
    return 0;
  };

  const formatPrice = (price: any) => {
    const num = parsePrice(price);
    return num.toLocaleString("vi-VN") + "₫";
  };

  const total = cart.reduce((sum, item) => {
    return sum + parsePrice(item.price) * item.quantity;
  }, 0);

  const shippingFee = 30000;
  const grandTotal = total + shippingFee;

  const handleOrder = async () => {
    if (isSubmitting.current) return; 

    if (!name.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập họ tên");
      return;
    }
    if (!phone.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập số điện thoại");
      return;
    }
    if (!address.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập địa chỉ");
      return;
    }
    if (cart.length === 0) {
      Alert.alert("Lỗi", "Giỏ hàng trống");
      return;
    }

    isSubmitting.current = true;
    setLoading(true);

    try {
      await addOrder({
        items: cart,
        total: grandTotal,
        address,
        name,
        phone,
        note,
        paymentMethod,
      });
      await clearCart();
      router.replace("/OrderSuccess");
    } catch {
      isSubmitting.current = false; 
      Alert.alert("Lỗi", "Đặt hàng thất bại, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thanh toán</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Thông tin giao hàng */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Thông tin giao hàng</Text>
          <TextInput
            style={styles.input}
            placeholder="Họ và tên *"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Số điện thoại *"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            placeholder="Địa chỉ giao hàng *"
            multiline
            numberOfLines={3}
            value={address}
            onChangeText={setAddress}
          />
          <TextInput
            style={styles.input}
            placeholder="Ghi chú (tuỳ chọn)"
            value={note}
            onChangeText={setNote}
          />
        </View>

        {/* Phương thức thanh toán */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💳 Phương thức thanh toán</Text>
          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === "cod" && styles.paymentActive,
            ]}
            onPress={() => setPaymentMethod("cod")}
          >
            <Text style={styles.paymentIcon}>🚚</Text>
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentLabel}>Thanh toán khi nhận hàng</Text>
              <Text style={styles.paymentDesc}>
                COD - Trả tiền mặt khi nhận
              </Text>
            </View>
            <View
              style={[
                styles.radio,
                paymentMethod === "cod" && styles.radioActive,
              ]}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === "banking" && styles.paymentActive,
            ]}
            onPress={() => setPaymentMethod("banking")}
          >
            <Text style={styles.paymentIcon}>🏦</Text>
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentLabel}>Chuyển khoản ngân hàng</Text>
              <Text style={styles.paymentDesc}>
                Banking - Chuyển khoản trước
              </Text>
            </View>
            <View
              style={[
                styles.radio,
                paymentMethod === "banking" && styles.radioActive,
              ]}
            />
          </TouchableOpacity>
        </View>

        {/* Danh sách sản phẩm */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🛍 Sản phẩm ({cart.length})</Text>
          {cart.map((item) => (
            <View key={item.id} style={styles.orderItem}>
              <Image source={{ uri: item.image }} style={styles.orderImg} />
              <View style={styles.orderInfo}>
                <Text style={styles.orderName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.orderQty}>x{item.quantity}</Text>
              </View>
              <Text style={styles.orderPrice}>
                {formatPrice(parsePrice(item.price) * item.quantity)}
              </Text>
            </View>
          ))}
        </View>

        {/* Tóm tắt đơn hàng */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🧾 Tóm tắt đơn hàng</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tạm tính</Text>
            <Text style={styles.summaryValue}>{formatPrice(total)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Phí giao hàng</Text>
            <Text style={styles.summaryValue}>{formatPrice(shippingFee)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Tổng cộng</Text>
            <Text style={styles.totalValue}>{formatPrice(grandTotal)}</Text>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomTotal}>
          <Text style={styles.bottomTotalLabel}>Tổng thanh toán</Text>
          <Text style={styles.bottomTotalValue}>{formatPrice(grandTotal)}</Text>
        </View>
        <TouchableOpacity
          style={[styles.orderBtn, loading && { opacity: 0.7 }]}
          onPress={handleOrder}
          disabled={loading}
        >
          <Text style={styles.orderBtnText}>
            {loading ? "Đang xử lý..." : "Đặt hàng ngay"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f8f8f8" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 12,
    backgroundColor: "#fff",
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#f3f3f3",
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: { fontSize: 20, color: "#333" },
  headerTitle: { fontSize: 16, fontWeight: "700" },
  section: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  input: {
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#333",
    borderWidth: 1,
    borderColor: "#eee",
  },
  inputMultiline: { height: 80, textAlignVertical: "top" },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#eee",
    gap: 12,
  },
  paymentActive: { borderColor: "#3498db", backgroundColor: "#f0f8ff" },
  paymentIcon: { fontSize: 24 },
  paymentInfo: { flex: 1 },
  paymentLabel: { fontSize: 14, fontWeight: "600", color: "#1a1a1a" },
  paymentDesc: { fontSize: 12, color: "#888", marginTop: 2 },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#ddd",
  },
  radioActive: { borderColor: "#3498db", backgroundColor: "#3498db" },
  orderItem: { flexDirection: "row", alignItems: "center", gap: 10 },
  orderImg: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
  },
  orderInfo: { flex: 1 },
  orderName: { fontSize: 13, fontWeight: "600", color: "#1a1a1a" },
  orderQty: { fontSize: 12, color: "#888", marginTop: 2 },
  orderPrice: { fontSize: 13, fontWeight: "700", color: "#FF3B30" },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: { fontSize: 14, color: "#666" },
  summaryValue: { fontSize: 14, color: "#333", fontWeight: "500" },
  divider: { height: 1, backgroundColor: "#f0f0f0" },
  totalLabel: { fontSize: 15, fontWeight: "700", color: "#1a1a1a" },
  totalValue: { fontSize: 18, fontWeight: "800", color: "#FF3B30" },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 20,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderColor: "#f0f0f0",
    gap: 12,
  },
  bottomTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bottomTotalLabel: { fontSize: 14, color: "#888" },
  bottomTotalValue: { fontSize: 20, fontWeight: "800", color: "#FF3B30" },
  orderBtn: {
    backgroundColor: "#3498db",
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  orderBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
