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
  TextInput,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { productAPI, reviewAPI } from "../../services/api";
import { addToCart } from "../../services/cartService";
import { auth } from "../../config/firebaseConfig";
import {
  toggleWishlistItem,
  isInWishlist,
} from "../../services/wishlistService";
import { getOrders, syncOrderStatus } from "../../services/orderService";

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
  const [canReview, setCanReview] = useState(false);

  // Review states
  const [reviews, setReviews] = useState<any[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

  const handleSubmitReview = async () => {
    if (!auth.currentUser) {
      Alert.alert("Lỗi", "Vui lòng đăng nhập");
      return;
    }
    if (myRating === 0) {
      Alert.alert("Lỗi", "Vui lòng chọn số sao");
      return;
    }
    setSubmitting(true);
    try {
      await reviewAPI.create(product!.id, {
        user_id: auth.currentUser.uid,
        user_name: auth.currentUser.displayName ?? "Người dùng",
        rating: myRating,
        comment: myComment,
      });
      Alert.alert("Thành công", "Cảm ơn bạn đã đánh giá!");
      setShowReviewForm(false);
      setMyRating(0);
      setMyComment("");
      reviewAPI.getAll(product!.id).then((data) => {
        setReviews(data.reviews ?? []);
        setAvgRating(data.avg_rating ?? 0);
        setTotalReviews(data.total ?? 0);
      });
    } catch {
      Alert.alert("Lỗi", "Không thể gửi đánh giá");
    } finally {
      setSubmitting(false);
    }
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

  useEffect(() => {
    if (product && auth.currentUser) {
      syncOrderStatus().then(() => {
        getOrders().then((orders) => {
          const hasPurchased = orders.some(
            (order) =>
              order.status === "delivered" &&
              order.items.some((item) => item.id === product.id),
          );
          setCanReview(hasPurchased);
        });
      });
    }
  }, [product]);

  useEffect(() => {
    if (product) {
      reviewAPI.getAll(product.id).then((data) => {
        setReviews(data.reviews ?? []);
        setAvgRating(data.avg_rating ?? 0);
        setTotalReviews(data.total ?? 0);
      });
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

  const displayRating = avgRating || Number(product.rating);
  const starCount = Math.round(displayRating);

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
            size={22}
            color={inWishlist ? "#FF3B30" : "#ccc"}
          />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Ảnh sản phẩm */}
        <View style={styles.imageWrap}>
          <Image source={{ uri: product.image }} style={styles.productImage} />
          {product.badge && (
            <View
              style={[
                styles.badge,
                product.badge === "HOT" ? styles.badgeHot : styles.badgeSale,
              ]}
            >
              <Text style={styles.badgeText}>{product.badge}</Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          {/* Category */}
          {product.category && (
            <Text style={styles.category}>{product.category.label}</Text>
          )}

          {/* Tên sản phẩm */}
          <Text style={styles.name}>{product.name}</Text>

          {/* Rating & Sold */}
          <View style={styles.metaRow}>
            <View style={styles.ratingWrap}>
              <Ionicons name="star" size={13} color="#f39c12" />
              <Text style={styles.ratingText}>{product.rating}</Text>
            </View>
            <Text style={styles.soldText}>Đã bán: {product.sold}</Text>
          </View>

          {/* Giá */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>{product.price}</Text>
            {product.old_price && (
              <Text style={styles.oldPrice}>{product.old_price}</Text>
            )}
            {product.old_price && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>SALE</Text>
              </View>
            )}
          </View>

          {/* Số lượng */}
          <View style={styles.qtySection}>
            <Text style={styles.sectionTitle}>Số lượng</Text>
            <View style={styles.qtyRow}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Text style={styles.qtyBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.qtyValue}>{quantity}</Text>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQuantity(quantity + 1)}
              >
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Mô tả */}
          <View style={styles.descSection}>
            <Text style={styles.sectionTitle}>Mô tả sản phẩm</Text>
            <Text style={styles.descText}>
              {product.name} là sản phẩm chất lượng cao với thiết kế hiện đại.
              Được đánh giá {product.rating}/5 sao bởi khách hàng và đã bán được{" "}
              {product.sold} sản phẩm.
            </Text>
          </View>

          {/* Thông tin giao hàng */}
          <View style={styles.shippingCard}>
            <View style={styles.shippingItem}>
              <Ionicons name="car-outline" size={18} color="#27ae60" />
              <Text style={styles.shippingText}>
                Giao hàng miễn phí toàn quốc
              </Text>
            </View>
            <View style={styles.shippingItem}>
              <Ionicons name="refresh-outline" size={18} color="#3498db" />
              <Text style={styles.shippingText}>Đổi trả trong 7 ngày</Text>
            </View>
            <View style={styles.shippingItem}>
              <Ionicons
                name="shield-checkmark-outline"
                size={18}
                color="#8e44ad"
              />
              <Text style={styles.shippingText}>Hàng chính hãng 100%</Text>
            </View>
          </View>

          {/* Reviews Section */}
          <View style={styles.reviewSection}>
            <View style={styles.reviewHeader}>
              <View>
                <Text style={styles.sectionTitle}>Đánh giá sản phẩm</Text>
                <View style={styles.ratingOverview}>
                  <Text style={styles.bigRating}>{displayRating}</Text>
                  <View>
                    <View style={styles.starsRow}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Ionicons
                          key={i}
                          name={i < starCount ? "star" : "star-outline"}
                          size={14}
                          color="#f39c12"
                        />
                      ))}
                    </View>
                    <Text style={styles.totalReviewsText}>
                      {totalReviews} đánh giá
                    </Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.writeReviewBtn,
                  !canReview && { backgroundColor: "#ccc" },
                ]}
                onPress={() => {
                  if (!auth.currentUser) {
                    Alert.alert("Lỗi", "Vui lòng đăng nhập để đánh giá");
                    return;
                  }
                  if (!canReview) {
                    Alert.alert(
                      "Thông báo",
                      "Bạn cần mua và nhận hàng thành công mới có thể đánh giá",
                    );
                    return;
                  }
                  setShowReviewForm(!showReviewForm);
                }}
              >
                <Ionicons name="create-outline" size={15} color="#fff" />
                <Text style={styles.writeReviewText}>Viết đánh giá</Text>
              </TouchableOpacity>
            </View>

            {/* Review Form */}
            {showReviewForm && (
              <View style={styles.reviewForm}>
                <Text style={styles.formLabel}>Chọn số sao:</Text>
                <View style={styles.starRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      onPress={() => setMyRating(star)}
                    >
                      <Ionicons
                        name={star <= myRating ? "star" : "star-outline"}
                        size={28}
                        color="#f39c12"
                      />
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Nhận xét của bạn (tuỳ chọn)..."
                  multiline
                  numberOfLines={3}
                  value={myComment}
                  onChangeText={setMyComment}
                />
                <TouchableOpacity
                  style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
                  onPress={handleSubmitReview}
                  disabled={submitting}
                >
                  <Text style={styles.submitBtnText}>
                    {submitting ? "Đang gửi..." : "Gửi đánh giá"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Review List */}
            {reviews.length === 0 ? (
              <Text style={styles.noReview}>
                Chưa có đánh giá nào. Hãy là người đầu tiên!
              </Text>
            ) : (
              reviews.map((review) => (
                <View key={review.id} style={styles.reviewItem}>
                  <View style={styles.reviewItemHeader}>
                    <View style={styles.reviewAvatar}>
                      <Text style={styles.reviewAvatarText}>
                        {review.user_name[0]?.toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.reviewMeta}>
                      <Text style={styles.reviewName}>{review.user_name}</Text>
                      <View style={styles.starsRow}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Ionicons
                            key={i}
                            name={i < review.rating ? "star" : "star-outline"}
                            size={12}
                            color="#f39c12"
                          />
                        ))}
                      </View>
                    </View>
                    <Text style={styles.reviewDate}>
                      {new Date(review.created_at).toLocaleDateString("vi-VN")}
                    </Text>
                  </View>
                  {review.comment && (
                    <Text style={styles.reviewComment}>{review.comment}</Text>
                  )}
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.cartBtn} onPress={handleAddToCart}>
          <Ionicons name="bag-add-outline" size={20} color="#3498db" />
          <Text style={styles.cartBtnText}>Thêm vào giỏ</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.buyBtn}
          onPress={() => {
            if (!checkAuth()) return;
            router.push("/Checkout");
          }}
        >
          <Ionicons name="flash-outline" size={18} color="#fff" />
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
  imageWrap: { backgroundColor: "#fff", position: "relative" },
  productImage: { width: width, height: width * 0.85, resizeMode: "cover" },
  badge: {
    position: "absolute",
    top: 16,
    left: 16,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  badgeHot: { backgroundColor: "#FF3B30" },
  badgeSale: { backgroundColor: "#FF9500" },
  badgeText: { color: "#fff", fontWeight: "800", fontSize: 12 },
  content: { padding: 20 },
  category: {
    fontSize: 12,
    color: "#3498db",
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  name: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1a1a1a",
    lineHeight: 28,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  ratingWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#fff9e6",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: { fontSize: 13, fontWeight: "600", color: "#f39c12" },
  soldText: { fontSize: 13, color: "#888" },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
  },
  price: { fontSize: 24, fontWeight: "800", color: "#FF3B30" },
  oldPrice: { fontSize: 16, color: "#bbb", textDecorationLine: "line-through" },
  discountBadge: {
    backgroundColor: "#FF3B30",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  discountText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  qtySection: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 10,
  },
  qtyRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  qtyBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eee",
  },
  qtyBtnText: { fontSize: 20, color: "#333", fontWeight: "600" },
  qtyValue: {
    fontSize: 18,
    fontWeight: "700",
    minWidth: 30,
    textAlign: "center",
  },
  descSection: { marginBottom: 20 },
  descText: { fontSize: 14, color: "#666", lineHeight: 22 },
  shippingCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    gap: 12,
    marginBottom: 20,
  },
  shippingItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  shippingText: { fontSize: 14, color: "#444", lineHeight: 22 },
  reviewSection: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  ratingOverview: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 6,
  },
  bigRating: { fontSize: 40, fontWeight: "800", color: "#1a1a1a" },
  starsRow: { flexDirection: "row", alignItems: "center", gap: 2 },
  totalReviewsText: { fontSize: 12, color: "#888", marginTop: 2 },
  writeReviewBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#3498db",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  writeReviewText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  reviewForm: {
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  formLabel: { fontSize: 14, fontWeight: "600", color: "#1a1a1a" },
  starRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  commentInput: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#eee",
    textAlignVertical: "top",
    minHeight: 80,
  },
  submitBtn: {
    backgroundColor: "#3498db",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
  },
  submitBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  noReview: {
    fontSize: 13,
    color: "#888",
    textAlign: "center",
    paddingVertical: 10,
  },
  reviewItem: {
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 12,
    gap: 8,
  },
  reviewItemHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  reviewAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#3498db",
    justifyContent: "center",
    alignItems: "center",
  },
  reviewAvatarText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  reviewMeta: { flex: 1 },
  reviewName: { fontSize: 13, fontWeight: "600", color: "#1a1a1a" },
  reviewDate: { fontSize: 11, color: "#aaa" },
  reviewComment: {
    fontSize: 13,
    color: "#555",
    lineHeight: 20,
    marginLeft: 46,
  },
  bottomBar: {
    flexDirection: "row",
    padding: 16,
    paddingBottom: 30,
    backgroundColor: "#fff",
    gap: 12,
    borderTopWidth: 1,
    borderColor: "#f0f0f0",
  },
  cartBtn: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#3498db",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  cartBtnText: { color: "#3498db", fontWeight: "700", fontSize: 15 },
  buyBtn: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    backgroundColor: "#3498db",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  buyBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
