import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { productAPI, categoryAPI } from "../../services/api";
import { getCartCount } from "../../services/cartService";
import { useTheme } from "../../context/ThemeContext";
import {
  toggleWishlistItem,
  getWishlist,
  WishlistItem,
} from "../../services/wishlistService";
import { SkeletonBanner, SkeletonGrid } from "../../components/SkeletonLoader";

const { width } = Dimensions.get("window");

type Category = {
  id: number;
  label: string;
};

type Product = {
  id: number;
  name: string;
  price: number;
  old_price?: number;
  rating: number;
  sold: number;
  image: string;
  badge?: string;
};

export default function HomeScreen() {
  const { colors, theme, toggleTheme } = useTheme();
  const [search, setSearch] = useState("");
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      getCartCount().then(setCartCount);
    }, []),
  );

  const handleWishlist = async (item: any) => {
    const added = await toggleWishlistItem({
      id: item.id,
      name: item.name,
      price: item.price,
      old_price: item.old_price,
      image: item.image,
      rating: item.rating,
      sold: item.sold,
      badge: item.badge,
    });
    if (added) {
      setWishlist((prev) => [...prev, item.id]);
    } else {
      setWishlist((prev) => prev.filter((id) => id !== item.id));
    }
  };

  const formatPrice = (price: any) => {
    if (typeof price === "string") return price;
    return Number(price).toLocaleString("vi-VN") + "₫";
  };

  useEffect(() => {
    categoryAPI
      .getAll()
      .then((data: any) => {
        // Lọc bỏ category có label là "Tất cả"
        const filtered = data.filter((cat: any) => cat.label !== "Tất cả");
        setCategories(filtered);
      })
      .catch((err: any) => console.log("Category API error:", err));
  }, []);

  useEffect(() => {
    setLoading(true);
    productAPI
      .getAll()
      .then((data: any) => {
        const list = Array.isArray(data) ? data : (data.data ?? []);
        setProducts(list);
      })
      .catch((err: any) => console.log("Product API error:", err))
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(
    useCallback(() => {
      getCartCount().then(setCartCount);
      getWishlist().then((items) => setWishlist(items.map((i) => i.id)));
    }, []),
  );

  const filteredProducts = Array.isArray(products)
    ? activeCategory === null
      ? products
      : products.filter((p: any) => p.category_id === activeCategory)
    : [];
  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={theme === "dark" ? "light-content" : "dark-content"}
      />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.header }]}>
        <View>
          <Text style={[styles.hello, { color: colors.subtext }]}>
            Xin chào 👋
          </Text>
          <Text style={[styles.brand, { color: colors.text }]}>ShopNow</Text>
        </View>

        <View style={styles.headerActions}>
          {/* Dark Mode Toggle */}
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: colors.input }]}
            onPress={toggleTheme}
          >
            <Text style={{ fontSize: 16 }}>
              {theme === "dark" ? "☀️" : "🌙"}
            </Text>
          </TouchableOpacity>

          {/* Thông báo */}
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: colors.input }]}
          >
            <Image
              style={[styles.iconImg, { tintColor: colors.text }]}
              source={{
                uri: "https://img.icons8.com/ios-filled/100/appointment-reminders.png",
              }}
            />
          </TouchableOpacity>

          {/* Giỏ hàng */}
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: colors.input }]}
            onPress={() => router.push("/(tabs)/cart")}
          >
            <Image
              style={[styles.iconImg, { tintColor: colors.text }]}
              source={{
                uri: "https://img.icons8.com/ios-filled/100/shopping-cart.png",
              }}
            />
            {cartCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* User */}
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: colors.input }]}
            onPress={() => router.navigate("/(tabs)/profile")}
          >
            <Image
              style={[styles.iconImg, { tintColor: colors.text }]}
              source={{
                uri: "https://img.icons8.com/ios-filled/100/user.png",
              }}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Search - luôn hiện */}
        <View
          style={[
            styles.searchWrap,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Image
            style={[styles.searchIcon, { tintColor: colors.subtext }]}
            source={{ uri: "https://img.icons8.com/ios-filled/100/search.png" }}
          />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Tìm kiếm sản phẩm..."
            placeholderTextColor={colors.subtext}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {loading ? (
          <>
            <SkeletonBanner />
            <SkeletonGrid />
          </>
        ) : (
          <>
            {/* Banner */}
            <View style={styles.bannerWrap}>
              <Image
                source={{ uri: "https://picsum.photos/seed/banner/800/360" }}
                style={styles.bannerImg}
              />
              <View style={styles.bannerContent}>
                <Text style={styles.bannerTitle}>Giảm đến 50%</Text>
              </View>
            </View>

            {/* Categories */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.catList}
            >
              <TouchableOpacity
                style={[
                  styles.catChip,
                  { backgroundColor: colors.card },
                  activeCategory === null && styles.catChipActive,
                ]}
                onPress={() => setActiveCategory(null)}
              >
                <Text
                  style={[
                    styles.catText,
                    { color: colors.subtext },
                    activeCategory === null && styles.catTextActive,
                  ]}
                >
                  Tất cả
                </Text>
              </TouchableOpacity>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.catChip,
                    { backgroundColor: colors.card },
                    activeCategory === cat.id && styles.catChipActive,
                  ]}
                  onPress={() => setActiveCategory(cat.id)}
                >
                  <Text
                    style={[
                      styles.catText,
                      { color: colors.subtext },
                      activeCategory === cat.id && styles.catTextActive,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Section Header */}
            <View style={styles.secHeader}>
              <Text style={[styles.secTitle, { color: colors.text }]}>
                Nổi bật
              </Text>
            </View>

            {/* Product Grid */}
            <View style={styles.grid}>
              {filteredProducts
                .filter((item) =>
                  item.name.toLowerCase().includes(search.toLowerCase()),
                )
                .map((item) => (
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
                      <Image
                        source={{ uri: item.image }}
                        style={styles.cardImg}
                      />
                      {item.badge && (
                        <View style={styles.cardBadge}>
                          <Text style={styles.cardBadgeText}>{item.badge}</Text>
                        </View>
                      )}
                      <TouchableOpacity
                        style={styles.wishBtn}
                        onPress={() => handleWishlist(item)}
                      >
                        <Text
                          style={[
                            styles.wishIcon,
                            {
                              color: wishlist.includes(item.id)
                                ? "#FF3B30"
                                : "#ccc",
                            },
                          ]}
                        >
                          {wishlist.includes(item.id) ? "♥" : "♡"}
                        </Text>
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
                      <Text
                        style={[styles.cardMeta, { color: colors.subtext }]}
                      >
                        ⭐ {item.rating} • Đã bán {item.sold}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
            </View>
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const CARD_WIDTH = (width - 48) / 2;

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
  hello: { fontSize: 12 },
  brand: { fontSize: 22, fontWeight: "800" },
  headerActions: { flexDirection: "row", gap: 8 },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
  },
  iconImg: { width: 18, height: 18 },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "red",
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: { color: "#fff", fontSize: 9 },
  searchWrap: {
    flexDirection: "row",
    margin: 20,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 46,
    alignItems: "center",
    borderWidth: 1,
  },
  searchIcon: { width: 16, height: 16, marginRight: 10 },
  searchInput: { flex: 1 },
  bannerWrap: {
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: "hidden",
    height: 150,
    marginBottom: 20,
  },
  bannerImg: { width: "100%", height: "100%", position: "absolute" },
  bannerContent: { flex: 1, justifyContent: "center", alignItems: "center" },
  bannerTitle: { color: "#fff", fontSize: 24, fontWeight: "800" },
  catList: { paddingHorizontal: 20, gap: 8 },
  catChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  catChipActive: { backgroundColor: "#000" },
  catText: {},
  catTextActive: { color: "#fff" },
  secHeader: { paddingHorizontal: 20, marginTop: 16, marginBottom: 14 },
  secTitle: { fontSize: 18, fontWeight: "800" },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
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
  cardBadgeText: { color: "#fff", fontSize: 10 },
  wishBtn: { position: "absolute", top: 8, right: 8 },
  wishIcon: { fontSize: 16 },
  cardBody: { padding: 10 },
  cardName: { fontSize: 13, fontWeight: "600" },
  cardPriceRow: { flexDirection: "row", gap: 6, marginTop: 6 },
  cardPrice: { color: "#FF3B30", fontWeight: "800" },
  cardOldPrice: { textDecorationLine: "line-through", color: "#aaa" },
  cardMeta: { fontSize: 11, marginTop: 6 },
});
