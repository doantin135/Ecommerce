import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Dimensions,
  Alert,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { productAPI } from "../../services/api";
import { addToCart } from "../../services/cartService";
import { auth } from "../../config/firebaseConfig";
import {
  toggleWishlistItem,
  isInWishlist,
} from "../../services/wishlistService";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

type Product = {
  id: number;
  name: string;
  price: string;
  old_price?: string;
  rating: string;
  sold: string;
  image: string;
  badge?: string;
  category?: { label: string };
};

export default function ProductDetail() {
  const { id } = useLocalSearchParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [inWishlist, setInWishlist] = useState(false);

  const checkAuth = () => {
    if (!auth.currentUser) {
      Alert.alert("Chưa đăng nhập", "Vui lòng đăng nhập để mua hàng", [
        { text: "Hủy", style: "cancel" },
        { text: "Đăng nhập", onPress: () => router.push("/Login") },
      ]);
      return false;
    }
    return true;
  };

  const handleAddToCart = async () => {
    if (!checkAuth()) return;
    if (!product) return;

    await addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity,
    });

    Alert.alert("Thành công", "Đã thêm vào giỏ hàng!");
  };

  const handleWishlist = async () => {
    if (!product) return;
    const added = await toggleWishlistItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      rating: Number(product.rating),
      sold: Number(product.sold),
      badge: product.badge,
    });
    setInWishlist(added);
  };

  useEffect(() => {
    productAPI
      .getOne(Number(id))
      .then((data) => setProduct(data))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (product) {
      isInWishlist(product.id).then(setInWishlist);
    }
  }, [product]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.centered}>
        <Text>Không tìm thấy sản phẩm</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#333" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Chi tiết sản phẩm</Text>

        <TouchableOpacity style={styles.iconBtn} onPress={handleWishlist}>
          <Ionicons
            name={inWishlist ? "heart" : "heart-outline"}
            size={20}
            color={inWishlist ? "#FF3B30" : "#ccc"}
          />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image */}
        <View style={styles.imageWrap}>
          <Image source={{ uri: product.image }} style={styles.productImage} />
        </View>

        <View style={styles.content}>
          {/* Category */}
          {product.category && (
            <Text style={styles.category}>{product.category.label}</Text>
          )}

          {/* Name */}
          <Text style={styles.name}>{product.name}</Text>

          {/* Rating */}
          <View style={styles.metaRow}>
            <View style={styles.ratingWrap}>
              <Ionicons name="star" size={14} color="#f39c12" />
              <Text style={styles.ratingText}>{product.rating}</Text>
            </View>
            <Text style={styles.soldText}>Đã bán: {product.sold}</Text>
          </View>

          {/* Price */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>{product.price}</Text>
            {product.old_price && (
              <Text style={styles.oldPrice}>{product.old_price}</Text>
            )}
          </View>

          {/* Quantity */}
          <View style={styles.qtySection}>
            <Text style={styles.sectionTitle}>Số lượng</Text>
            <View style={styles.qtyRow}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Ionicons name="remove" size={16} color="#333" />
              </TouchableOpacity>

              <Text style={styles.qtyValue}>{quantity}</Text>

              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQuantity(quantity + 1)}
              >
                <Ionicons name="add" size={16} color="#333" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Description */}
          <View style={styles.descSection}>
            <Text style={styles.sectionTitle}>Mô tả sản phẩm</Text>
            <Text style={styles.descText}>
              {product.name} là sản phẩm chất lượng cao, được đánh giá{" "}
              {product.rating}/5 sao.
            </Text>
          </View>

          {/* Shipping */}
          <View style={styles.shippingCard}>
            <View style={styles.shipRow}>
              <Ionicons name="car-outline" size={16} color="#444" />
              <Text style={styles.shippingItem}>
                Giao hàng miễn phí toàn quốc
              </Text>
            </View>
            <View style={styles.shipRow}>
              <Ionicons name="refresh-outline" size={16} color="#444" />
              <Text style={styles.shippingItem}>Đổi trả trong 7 ngày</Text>
            </View>
            <View style={styles.shipRow}>
              <Ionicons
                name="checkmark-circle-outline"
                size={16}
                color="#444"
              />
              <Text style={styles.shippingItem}>Hàng chính hãng</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.cartBtn} onPress={handleAddToCart}>
          <Ionicons name="cart-outline" size={18} color="#3498db" />
          <Text style={styles.cartBtnText}> Thêm vào giỏ</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buyBtn}
          onPress={() => {
            if (!checkAuth()) return;
            router.push("/Checkout");
          }}
        >
          <Text style={styles.buyBtnText}>Mua ngay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f8f8f8" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },

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

  imageWrap: { backgroundColor: "#fff" },
  productImage: { width: width, height: width * 0.85 },

  content: { padding: 20 },

  category: {
    fontSize: 12,
    color: "#3498db",
    fontWeight: "600",
    marginBottom: 6,
  },

  name: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 12,
  },

  metaRow: { flexDirection: "row", gap: 10, marginBottom: 16 },

  ratingWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#fff9e6",
    padding: 6,
    borderRadius: 6,
  },

  ratingText: { fontSize: 12 },

  soldText: { fontSize: 12, color: "#888" },

  priceRow: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
  },

  price: { fontSize: 22, color: "#FF3B30", fontWeight: "800" },
  oldPrice: { textDecorationLine: "line-through", color: "#aaa" },

  qtySection: { marginBottom: 20 },

  sectionTitle: { fontWeight: "700", marginBottom: 8 },

  qtyRow: { flexDirection: "row", alignItems: "center", gap: 12 },

  qtyBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },

  qtyValue: { fontWeight: "700" },

  descSection: { marginBottom: 20 },

  descText: { color: "#666" },

  shippingCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },

  shipRow: { flexDirection: "row", gap: 8, alignItems: "center" },

  shippingItem: { fontSize: 13 },

  bottomBar: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#fff",
    gap: 10,
  },

  cartBtn: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#3498db",
    borderRadius: 12,
  },

  cartBtnText: { color: "#3498db", fontWeight: "700" },

  buyBtn: {
    flex: 1,
    backgroundColor: "#3498db",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  buyBtnText: { color: "#fff", fontWeight: "700" },
});
