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
} from "../../services/wishlistService";
import { SkeletonBanner, SkeletonGrid } from "../../components/SkeletonLoader";

import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const { colors, theme, toggleTheme } = useTheme();

  const [search, setSearch] = useState("");
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      getCartCount().then(setCartCount);
      getWishlist().then((items) =>
        setWishlist(items.map((i) => i.id)),
      );
    }, []),
  );

  const handleWishlist = async (item: any) => {
    const added = await toggleWishlistItem(item);
    if (added) {
      setWishlist((prev) => [...prev, item.id]);
    } else {
      setWishlist((prev) => prev.filter((id) => id !== item.id));
    }
  };

  const formatPrice = (price: any) => {
    return Number(price).toLocaleString("vi-VN") + "₫";
  };

  useEffect(() => {
    categoryAPI.getAll().then((data: any) => {
      const filtered = data.filter((c: any) => c.label !== "Tất cả");
      setCategories(filtered);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    productAPI
      .getAll()
      .then((data: any) => {
        setProducts(Array.isArray(data) ? data : data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts =
    activeCategory === null
      ? products
      : products.filter((p: any) => p.category_id === activeCategory);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={theme === "dark" ? "light-content" : "dark-content"}
      />

      {/* HEADER */}
      <View style={[styles.header, { backgroundColor: colors.header }]}>
        <View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Text style={[styles.hello, { color: colors.subtext }]}>
              Xin chào
            </Text>
            <Ionicons name="hand-left-outline" size={16} color={colors.subtext} />
          </View>

          <Text style={[styles.brand, { color: colors.text }]}>
            ShopNow
          </Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: colors.input }]}
            onPress={toggleTheme}
          >
            <Ionicons
              name={theme === "dark" ? "sunny" : "moon"}
              size={18}
              color={colors.text}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: colors.input }]}
          >
            <Ionicons name="notifications-outline" size={18} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: colors.input }]}
            onPress={() => router.push("/(tabs)/cart")}
          >
            <Ionicons name="cart-outline" size={18} color={colors.text} />
            {cartCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: colors.input }]}
            onPress={() => router.navigate("/(tabs)/profile")}
          >
            <Ionicons name="person-outline" size={18} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* SEARCH */}
        <View
          style={[
            styles.searchWrap,
            { borderColor: colors.border, backgroundColor: colors.card },
          ]}
        >
          <Ionicons name="search" size={16} color={colors.subtext} />
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
            {/* BANNER */}
            <Image
              source={{ uri: "https://picsum.photos/800/300" }}
              style={styles.banner}
            />

            {/* CATEGORY */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.catList}
            >
              <TouchableOpacity
                style={[
                  styles.catChip,
                  activeCategory === null && styles.catChipActive,
                ]}
                onPress={() => setActiveCategory(null)}
              >
                <Text
                  style={[
                    styles.catText,
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
                    activeCategory === cat.id && styles.catChipActive,
                  ]}
                  onPress={() => setActiveCategory(cat.id)}
                >
                  <Text
                    style={[
                      styles.catText,
                      activeCategory === cat.id && styles.catTextActive,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* PRODUCTS */}
            <View style={styles.grid}>
              {filteredProducts
                .filter((p) =>
                  p.name.toLowerCase().includes(search.toLowerCase()),
                )
                .map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.card, { backgroundColor: colors.card }]}
                    onPress={() =>
                      router.push({
                        pathname: "/Product/[id]",
                        params: { id: item.id },
                      })
                    }
                  >
                    <Image
                      source={{ uri: item.image }}
                      style={styles.cardImg}
                    />

                    
                    <TouchableOpacity
                      style={styles.wishBtn}
                      onPress={() => handleWishlist(item)}
                    >
                      <Ionicons
                        name={
                          wishlist.includes(item.id)
                            ? "heart"
                            : "heart-outline"
                        }
                        size={18}
                        color={
                          wishlist.includes(item.id)
                            ? "#FF3B30"
                            : "#ccc"
                        }
                      />
                    </TouchableOpacity>

                    <Text
                      numberOfLines={2}
                      style={{ color: colors.text, fontWeight: "600" }}
                    >
                      {item.name}
                    </Text>

                    <Text style={{ color: "#FF3B30", fontWeight: "700" }}>
                      {formatPrice(item.price)}
                    </Text>

                    
                    <View style={styles.ratingRow}>
                      <Ionicons name="star" size={12} color="#f5a623" />
                      <Text style={{ color: colors.subtext }}>
                        {item.rating} • Đã bán {item.sold}
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
    gap: 8,
    borderWidth: 1,
  },

  searchInput: { flex: 1 },

  banner: {
    width: "90%",
    height: 150,
    alignSelf: "center",
    borderRadius: 12,
  },

  catList: {
    paddingHorizontal: 16,
    gap: 8,
    marginVertical: 10,
  },

  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#eee",
  },

  catChipActive: {
    backgroundColor: "#000",
  },

  catText: {
    fontSize: 12,
  },

  catTextActive: {
    color: "#fff",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 12,
  },

  card: {
    width: CARD_WIDTH,
    borderRadius: 16,
    padding: 10,
  },

  cardImg: {
    width: "100%",
    height: CARD_WIDTH * 0.9,
    borderRadius: 12,
  },

  wishBtn: {
    position: "absolute",
    top: 8,
    right: 8,
  },

  ratingRow: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
    marginTop: 4,
  },
});