import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";
import { useTheme } from "../context/ThemeContext";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;

const SkeletonCard = () => {
  const { colors } = useTheme();
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animValue, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(animValue, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [animValue]);

  const opacity = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <Animated.View style={[styles.card, { backgroundColor: colors.card, opacity }]}>
      <View style={[styles.imgSkeleton, { backgroundColor: colors.border }]} />
      <View style={styles.body}>
        <View style={[styles.lineLong, { backgroundColor: colors.border }]} />
        <View style={[styles.lineShort, { backgroundColor: colors.border }]} />
        <View style={[styles.lineMid, { backgroundColor: colors.border }]} />
        <View style={[styles.lineShort, { backgroundColor: colors.border }]} />
      </View>
    </Animated.View>
  );
};

export const SkeletonBanner = () => {
  const { colors } = useTheme();
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animValue, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(animValue, { toValue: 0, duration: 900, useNativeDriver: true }),
      ]),
    ).start();
  }, [animValue]);

  const opacity = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <Animated.View style={{ opacity }}>
      {/* Banner */}
      <View style={[styles.bannerSkeleton, { backgroundColor: colors.border }]} />
      {/* Categories */}
      <View style={styles.catRow}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={[styles.catSkeleton, { backgroundColor: colors.border }]} />
        ))}
      </View>
      {/* Section title */}
      <View style={[styles.titleSkeleton, { backgroundColor: colors.border }]} />
    </Animated.View>
  );
};

export const SkeletonGrid = () => (
  <View style={styles.grid}>
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <SkeletonCard key={i} />
    ))}
  </View>
);

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
  },
  imgSkeleton: {
    width: "100%",
    height: CARD_WIDTH * 0.9,
  },
  body: { padding: 10, gap: 8 },
  lineLong: { height: 12, borderRadius: 6, width: "90%" },
  lineShort: { height: 10, borderRadius: 6, width: "50%" },
  lineMid: { height: 14, borderRadius: 6, width: "65%" },
  bannerSkeleton: {
    marginHorizontal: 20,
    height: 150,
    borderRadius: 20,
    marginBottom: 20,
  },
  catRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 16,
  },
  catSkeleton: {
    width: 80,
    height: 34,
    borderRadius: 20,
  },
  titleSkeleton: {
    marginHorizontal: 20,
    height: 20,
    borderRadius: 6,
    width: 100,
    marginBottom: 14,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 12,
  },
});