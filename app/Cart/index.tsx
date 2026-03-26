import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import {
  CartItem,
  getCart,
  updateQuantity,
  removeFromCart,
  clearCart,
} from "../../services/cartService";
import { Ionicons } from "@expo/vector-icons";

export default function CartScreen() {
  const [cart, setCart] = useState<CartItem[]>([]);

  useFocusEffect(
    useCallback(() => {
      getCart().then(setCart);
    }, []),
  );

  const handleUpdateQty = async (id: number, qty: number) => {
    if (qty <= 0) return;
    await updateQuantity(id, qty);
    getCart().then(setCart);
  };

  const handleRemove = async (id: number) => {
    Alert.alert("Xóa sản phẩm", "Bạn có chắc muốn xóa?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          await removeFromCart(id);
          getCart().then(setCart);
        },
      },
    ]);
  };

  const handleClear = async () => {
    Alert.alert("Xóa giỏ hàng", "Xóa toàn bộ sản phẩm?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa hết",
        style: "destructive",
        onPress: async () => {
          await clearCart();
          setCart([]);
        },
      },
    ]);
  };

  const formatPrice = (price: any) => {
    if (typeof price === "string") return price;
    return Number(price).toLocaleString("vi-VN") + "₫";
  };

  const total = cart.reduce((sum, item) => {
    const price =
      typeof item.price === "string"
        ? Number(item.price.replace(/[^\d]/g, ""))
        : item.price;
    return sum + price * item.quantity;
  }, 0);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#333" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Giỏ hàng ({cart.length})</Text>

        {cart.length > 0 ? (
          <TouchableOpacity onPress={handleClear}>
            <Text style={styles.clearText}>Xóa hết</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 50 }} />
        )}
      </View>

      {cart.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Ionicons name="cart-outline" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>Giỏ hàng trống</Text>
          <Text style={styles.emptySubtitle}>
            Hãy thêm sản phẩm vào giỏ nhé!
          </Text>

          <TouchableOpacity
            style={styles.shopBtn}
            onPress={() => router.navigate("/(tabs)")}
          >
            <Text style={styles.shopBtnText}>Mua sắm ngay</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView showsVerticalScrollIndicator={false}>
            {cart.map((item) => (
              <View key={item.id} style={styles.cartItem}>
                <Image source={{ uri: item.image }} style={styles.itemImg} />

                <View style={styles.itemInfo}>
                  <Text style={styles.itemName} numberOfLines={2}>
                    {item.name}
                  </Text>

                  <Text style={styles.itemPrice}>
                    {formatPrice(item.price)}
                  </Text>

                  <View style={styles.qtyRow}>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() =>
                        handleUpdateQty(item.id, item.quantity - 1)
                      }
                    >
                      <Ionicons name="remove" size={16} color="#333" />
                    </TouchableOpacity>

                    <Text style={styles.qtyValue}>{item.quantity}</Text>

                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() =>
                        handleUpdateQty(item.id, item.quantity + 1)
                      }
                    >
                      <Ionicons name="add" size={16} color="#333" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.itemRight}>
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => handleRemove(item.id)}
                  >
                    <Ionicons name="trash-outline" size={18} color="#e74c3c" />
                  </TouchableOpacity>

                  <Text style={styles.itemTotal}>
                    {formatPrice(item.price * item.quantity)}
                  </Text>
                </View>
              </View>
            ))}

            <View style={{ height: 120 }} />
          </ScrollView>

          <View style={styles.bottomBar}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tổng tiền:</Text>
              <Text style={styles.totalValue}>{formatPrice(total)}</Text>
            </View>

            <TouchableOpacity
              style={styles.checkoutBtn}
              onPress={() => router.push("/Checkout")}
            >
              <Text style={styles.checkoutBtnText}>
                Thanh toán ({cart.length} sản phẩm)
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
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

  headerTitle: { fontSize: 16, fontWeight: "700" },

  clearText: { color: "#FF3B30", fontSize: 14, fontWeight: "600" },

  emptyWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },

  emptyTitle: { fontSize: 20, fontWeight: "700", color: "#1a1a1a" },

  emptySubtitle: { fontSize: 14, color: "#888" },

  shopBtn: {
    marginTop: 10,
    backgroundColor: "#3498db",
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 14,
  },

  shopBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },

  cartItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 12,
    gap: 12,
  },

  itemImg: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
  },

  itemInfo: { flex: 1, gap: 4 },

  itemName: { fontSize: 13, fontWeight: "600", color: "#1a1a1a" },

  itemPrice: { fontSize: 13, color: "#FF3B30", fontWeight: "700" },

  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 4,
  },

  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#f3f3f3",
    justifyContent: "center",
    alignItems: "center",
  },

  qtyValue: {
    fontSize: 15,
    fontWeight: "700",
    minWidth: 20,
    textAlign: "center",
  },

  itemRight: {
    alignItems: "flex-end",
    justifyContent: "space-between",
  },

  removeBtn: { padding: 4 },

  itemTotal: { fontSize: 13, fontWeight: "700", color: "#1a1a1a" },

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

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  totalLabel: { fontSize: 15, color: "#888" },

  totalValue: { fontSize: 20, fontWeight: "800", color: "#FF3B30" },

  checkoutBtn: {
    backgroundColor: "#3498db",
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },

  checkoutBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
