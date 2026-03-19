import AsyncStorage from "@react-native-async-storage/async-storage";

const WISHLIST_KEY = "wishlist";

export type WishlistItem = {
    id: number;
    name: string;
    price: any;
    old_price?: any;
    image: string;
    rating: number;
    sold: number;
    badge?: string;
};

export const getWishlist = async (): Promise<WishlistItem[]> => {
    const data = await AsyncStorage.getItem(WISHLIST_KEY);
    return data ? JSON.parse(data) : [];
};

export const addToWishlist = async (item: WishlistItem): Promise<void> => {
    const wishlist = await getWishlist();
    const exists = wishlist.find((i) => i.id === item.id);
    if (!exists) {
        wishlist.push(item);
        await AsyncStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
    }
};

export const removeFromWishlist = async (id: number): Promise<void> => {
    const wishlist = await getWishlist();
    const newList = wishlist.filter((i) => i.id !== id);
    await AsyncStorage.setItem(WISHLIST_KEY, JSON.stringify(newList));
};

export const isInWishlist = async (id: number): Promise<boolean> => {
    const wishlist = await getWishlist();
    return wishlist.some((i) => i.id === id);
};

export const toggleWishlistItem = async (item: WishlistItem): Promise<boolean> => {
    const inList = await isInWishlist(item.id);
    if (inList) {
        await removeFromWishlist(item.id);
        return false; // đã xóa
    } else {
        await addToWishlist(item);
        return true; // đã thêm
    }
};