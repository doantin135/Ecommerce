import React, { useCallback, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import {
  WishlistItem,
  getWishlist,
  removeFromWishlist,
} from "../../services/wishlistService";
import { useTheme } from "../../context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;

export default function WishlistScreen() {
  const { colors, theme } = useTheme();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  useFocusEffect(
    useCallback(() => {
      getWishlist().then(setWishlist);
    }, []),
  );

  const handleRemove = async (id: number) => {
    await removeFromWishlist(id);
    getWishlist().then(setWishlist);
  };

  const formatPrice = (price: any) => {
    if (typeof price === "string") return price;
    return Number(price).toLocaleString("vi-VN") + "₫";
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={theme === "dark" ? "light-content" : "dark-content"}
      />

      <View style={[styles.header, { backgroundColor: colors.header }]}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Yêu thích ({wishlist.length})
        </Text>

        <View style={{ width: 38 }} />
      </View>

      {wishlist.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Ionicons name="heart-outline" size={64} color="#ccc" />

          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Chưa có sản phẩm yêu thích
          </Text>

          <Text style={[styles.emptySubtitle, { color: colors.subtext }]}>
            Nhấn biểu tượng trái tim để lưu sản phẩm
          </Text>

          <TouchableOpacity
            style={styles.shopBtn}
            onPress={() => router.replace("/(tabs)")}
          >
            <Text style={styles.shopBtnText}>Khám phá ngay</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.grid}>
            {wishlist.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.card, { backgroundColor: colors.card }]}
                activeOpacity={0.9}
                onPress={() =>
                  router.push({
                    pathname: "/Product/[id]",
                    params: { id: item.id },
                  })
                }
              >
                <View style={styles.cardImgWrap}>
                  <Image source={{ uri: item.image }} style={styles.cardImg} />

                  {item.badge && (
                    <View style={styles.cardBadge}>
                      <Text style={styles.cardBadgeText}>{item.badge}</Text>
                    </View>
                  )}

                  <TouchableOpacity
                    style={styles.wishBtn}
                    onPress={() => handleRemove(item.id)}
                  >
                    <Ionicons name="heart" size={16} color="#FF3B30" />
                  </TouchableOpacity>
                </View>

                <View style={styles.cardBody}>
                  <Text
                    style={[styles.cardName, { color: colors.text }]}
                    numberOfLines={2}
                  >
                    {item.name}
                  </Text>

                  <View style={styles.cardPriceRow}>
                    <Text style={styles.cardPrice}>
                      {formatPrice(item.price)}
                    </Text>

                    {item.old_price && (
                      <Text style={styles.cardOldPrice}>
                        {formatPrice(item.old_price)}
                      </Text>
                    )}
                  </View>

                  <View style={styles.metaRow}>
                    <Ionicons name="star" size={12} color="#f39c12" />
                    <Text style={[styles.cardMeta, { color: colors.subtext }]}>
                      {item.rating}
                    </Text>
                    <Text style={[styles.cardMeta, { color: colors.subtext }]}>
                      • Đã bán {item.sold}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ height: 30 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 12,
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

  emptyWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    padding: 30,
  },

  emptyTitle: { fontSize: 18, fontWeight: "700" },

  emptySubtitle: { fontSize: 14, textAlign: "center" },

  shopBtn: {
    marginTop: 10,
    backgroundColor: "#3498db",
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 14,
  },

  shopBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },

  card: {
    width: CARD_WIDTH,
    borderRadius: 16,
    overflow: "hidden",
  },

  cardImgWrap: { position: "relative" },

  cardImg: { width: "100%", height: CARD_WIDTH * 0.9 },

  cardBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#FF3B30",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },

  cardBadgeText: { color: "#fff", fontSize: 10, fontWeight: "800" },

  wishBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },

  cardBody: { padding: 10 },

  cardName: { fontSize: 13, fontWeight: "600" },

  cardPriceRow: { flexDirection: "row", gap: 6, marginTop: 6 },

  cardPrice: { color: "#FF3B30", fontWeight: "800" },

  cardOldPrice: { textDecorationLine: "line-through", color: "#aaa" },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
  },

  cardMeta: { fontSize: 11 },
});
