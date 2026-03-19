import AsyncStorage from "@react-native-async-storage/async-storage";

const CART_KEY = "cart";

export type CartItem = {
    id: number;
    name: string;
    price: any;
    image: string;
    quantity: number;
};

// Lấy giỏ hàng
export const getCart = async (): Promise<CartItem[]> => {
    const data = await AsyncStorage.getItem(CART_KEY);
    return data ? JSON.parse(data) : [];
};

// Thêm vào giỏ
export const addToCart = async (item: CartItem): Promise<void> => {
    const cart = await getCart();
    const existing = cart.findIndex((i) => i.id === item.id);
    if (existing >= 0) {
        cart[existing].quantity += item.quantity;
    } else {
        cart.push(item);
    }
    await AsyncStorage.setItem(CART_KEY, JSON.stringify(cart));
};

// Cập nhật số lượng
export const updateQuantity = async (id: number, quantity: number): Promise<void> => {
    const cart = await getCart();
    const index = cart.findIndex((i) => i.id === id);
    if (index >= 0) {
        if (quantity <= 0) {
            cart.splice(index, 1);
        } else {
            cart[index].quantity = quantity;
        }
    }
    await AsyncStorage.setItem(CART_KEY, JSON.stringify(cart));
};

// Xóa 1 sản phẩm
export const removeFromCart = async (id: number): Promise<void> => {
    const cart = await getCart();
    const newCart = cart.filter((i) => i.id !== id);
    await AsyncStorage.setItem(CART_KEY, JSON.stringify(newCart));
};

// Xóa toàn bộ
export const clearCart = async (): Promise<void> => {
    await AsyncStorage.removeItem(CART_KEY);
};

// Đếm số lượng
export const getCartCount = async (): Promise<number> => {
    const cart = await getCart();
    return cart.reduce((sum, item) => sum + item.quantity, 0);
};