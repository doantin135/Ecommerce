import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Image,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { productAPI } from "../../services/api";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;

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

export default function SearchScreen() {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!search.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const data = await productAPI.getAll({ search });
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: any) => {
    if (typeof price === "string") return price;
    return Number(price).toLocaleString("vi-VN") + "₫";
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tìm kiếm</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchWrap}>
        <Image
          style={styles.searchIcon}
          source={{ uri: "https://img.icons8.com/ios-filled/100/search.png" }}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm sản phẩm..."
          placeholderTextColor="#aaa"
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          autoFocus
        />
        {search.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              setSearch("");
              setResults([]);
              setSearched(false);
            }}
          >
            <Text style={styles.clearBtn}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#3498db" />
        </View>
      ) : searched && results.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyText}>Không tìm thấy sản phẩm</Text>
          <Text style={styles.emptySubtext}>Thử tìm kiếm với từ khóa khác</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {!searched && (
            <View style={styles.hintWrap}>
              <Text style={styles.hintText}>🔥 Gợi ý tìm kiếm</Text>
              {["Tai nghe", "Giày Nike", "Bàn phím", "Áo khoác"].map((hint) => (
                <TouchableOpacity
                  key={hint}
                  style={styles.hintChip}
                  onPress={() => {
                    setSearch(hint);
                  }}
                >
                  <Text style={styles.hintChipText}>{hint}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={styles.grid}>
            {results.map((item) => (
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
                <Image source={{ uri: item.image }} style={styles.cardImg} />
                {item.badge && (
                  <View style={styles.cardBadge}>
                    <Text style={styles.cardBadgeText}>{item.badge}</Text>
                  </View>
                )}
                <View style={styles.cardBody}>
                  <Text style={styles.cardName} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <Text style={styles.cardPrice}>
                    {formatPrice(item.price)}
                  </Text>
                  <Text style={styles.cardMeta}>
                    ⭐ {item.rating} • Đã bán {item.sold}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
          <View style={{ height: 20 }} />
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
  searchWrap: {
    flexDirection: "row",
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 46,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eee",
  },
  searchIcon: { width: 16, height: 16, marginRight: 10, tintColor: "#aaa" },
  searchInput: { flex: 1, fontSize: 14, color: "#333" },
  clearBtn: { fontSize: 16, color: "#aaa", paddingHorizontal: 4 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", gap: 8 },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: 16, fontWeight: "700", color: "#1a1a1a" },
  emptySubtext: { fontSize: 13, color: "#888" },
  hintWrap: {
    padding: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    alignItems: "center",
  },
  hintText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1a1a1a",
    width: "100%",
    marginBottom: 4,
  },
  hintChip: {
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#eee",
  },
  hintChipText: { fontSize: 13, color: "#555" },
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
  cardBody: { padding: 10 },
  cardName: { fontSize: 13, fontWeight: "600", color: "#1a1a1a" },
  cardPrice: { color: "#FF3B30", fontWeight: "800", marginTop: 4 },
  cardMeta: { fontSize: 11, color: "#888", marginTop: 4 },
});
