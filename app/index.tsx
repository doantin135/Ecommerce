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
import { productAPI, categoryAPI } from "../services/api";
import { getCartCount } from "../services/cartService";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;

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
  const [search, setSearch] = useState("");
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [cartCount, setCartCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      getCartCount().then(setCartCount);
    }, []),
  );

  const toggleWishlist = (id: string) => {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const formatPrice = (price: number) => {
    return Number(price).toLocaleString("vi-VN") + "₫";
  };

  useEffect(() => {
    categoryAPI.getAll().then(setCategories).catch(console.log);
  }, []);

  useEffect(() => {
    productAPI.getAll().then(setProducts).catch(console.log);
  }, []);

  const filteredProducts =
    activeCategory === null
      ? products
      : products.filter((p: any) => p.category_id === activeCategory);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <View>
          <Text style={styles.hello}>Xin chào</Text>
          <Text style={styles.brand}>ShopNow</Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconBtn}>
            <Image
              style={styles.iconImg}
              source={{
                uri: "https://img.icons8.com/ios-filled/100/appointment-reminders.png",
              }}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.push("/Cart")}
          >
            <Image
              style={styles.iconImg}
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

          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.push("/Login")}
          >
            <Image
              style={styles.iconImg}
              source={{
                uri: "https://img.icons8.com/ios-filled/100/user.png",
              }}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.searchWrap}>
          <Image
            style={styles.searchIcon}
            source={{
              uri: "https://img.icons8.com/ios-filled/100/search.png",
            }}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm sản phẩm..."
            placeholderTextColor="#aaa"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <View style={styles.bannerWrap}>
          <Image
            source={{ uri: "https://picsum.photos/seed/banner/800/360" }}
            style={styles.bannerImg}
          />
          <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>Giảm đến 50%</Text>
          </View>
        </View>

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

        <View style={styles.secHeader}>
          <Text style={styles.secTitle}>Nổi bật</Text>
        </View>

        <View style={styles.grid}>
          {filteredProducts
            .filter((item) =>
              item.name.toLowerCase().includes(search.toLowerCase()),
            )
            .map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.card}
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
                    onPress={() => toggleWishlist(item.id.toString())}
                  >
                    <Image
                      style={styles.wishIcon}
                      source={{
                        uri: wishlist.includes(item.id.toString())
                          ? "https://img.icons8.com/ios-filled/100/like.png"
                          : "https://img.icons8.com/ios/100/like--v1.png",
                      }}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.cardBody}>
                  <Text style={styles.cardName} numberOfLines={2}>
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

                  <View style={styles.ratingRow}>
                    <Image
                      style={styles.starIcon}
                      source={{
                        uri: "https://img.icons8.com/fluency/48/star.png",
                      }}
                    />
                    <Text style={styles.cardMeta}>
                      {item.rating} Đã bán {item.sold}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
  hello: { fontSize: 12, color: "#aaa" },
  brand: { fontSize: 22, fontWeight: "800" },
  headerActions: { flexDirection: "row", gap: 8 },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#f3f3f3",
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
    backgroundColor: "#fff",
    margin: 20,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 46,
    alignItems: "center",
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
    backgroundColor: "#fff",
  },
  catChipActive: { backgroundColor: "#000" },
  catText: { color: "#888" },
  catTextActive: { color: "#fff" },
  secHeader: { paddingHorizontal: 20, marginBottom: 14 },
  secTitle: { fontSize: 18, fontWeight: "800" },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 12,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: "#fff",
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
  wishIcon: { width: 18, height: 18 },
  cardBody: { padding: 10 },
  cardName: { fontSize: 13, fontWeight: "600" },
  cardPriceRow: { flexDirection: "row", gap: 6, marginTop: 6 },
  cardPrice: { color: "#FF3B30", fontWeight: "800" },
  cardOldPrice: { textDecorationLine: "line-through", color: "#aaa" },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
  },
  starIcon: { width: 12, height: 12 },
  cardMeta: { fontSize: 11, color: "#888" },
});
