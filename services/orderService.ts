import AsyncStorage from "@react-native-async-storage/async-storage";
import { CartItem } from "./cartService";
import { auth } from "../config/firebaseConfig";
import fetchAPI from "./api";

const getOrderKey = () => {
  const uid = auth.currentUser?.uid;
  return uid ? `orders_${uid}` : "orders_guest";
};

export type Order = {
  id: string;
  items: CartItem[];
  total: number;
  address: string;
  name: string;
  phone: string;
  note?: string;
  paymentMethod: "cod" | "banking";
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
  serverId?: number; 
};

export const getOrders = async (): Promise<Order[]> => {
  const data = await AsyncStorage.getItem(getOrderKey());
  return data ? JSON.parse(data) : [];
};

export const addOrder = async (
  order: Omit<Order, "id" | "createdAt" | "status">
): Promise<Order> => {
  const user = auth.currentUser;

  
  const newOrder: Order = {
    ...order,
    id: Date.now().toString(),
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  
  try {
    const response = await fetchAPI("/orders", "POST", {
      user_id:        user?.uid ?? "guest",
      user_name:      order.name,
      user_email:     user?.email ?? "",
      phone:          order.phone,
      address:        order.address,
      total:          order.total,
      payment_method: order.paymentMethod,
      note:           order.note ?? "",
      items:          order.items.map((i) => ({
        product_id: i.id,
        name:       i.name,
        price:      i.price,
        quantity:   i.quantity,
        image:      i.image,
      })),
    });
    newOrder.serverId = response.order?.id; 
  } catch (e) {
    console.log("Lỗi lưu order lên server:", e);
  }

  
  const orders = await getOrders();
  orders.unshift(newOrder);
  await AsyncStorage.setItem(getOrderKey(), JSON.stringify(orders));
  return newOrder;
};

export const cancelOrder = async (id: string): Promise<void> => {
  const orders = await getOrders();
  const index = orders.findIndex((o) => o.id === id);
  if (index >= 0) {
    orders[index].status = "cancelled";

    
    const serverId = orders[index].serverId;
    if (serverId) {
      try {
        await fetchAPI(`/orders/${serverId}/status`, "PUT", {
          status: "cancelled",
        });
      } catch (e) {
        console.log("Lỗi cancel order trên server:", e);
      }
    }

    await AsyncStorage.setItem(getOrderKey(), JSON.stringify(orders));
  }
};


export const syncOrderStatus = async (): Promise<void> => {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const serverOrders = await fetchAPI(`/orders/user/${user.uid}`);
    const localOrders = await getOrders();

    
    let updated = false;
    localOrders.forEach((localOrder) => {
      if (localOrder.serverId) {
        const serverOrder = serverOrders.find(
          (o: any) => o.id === localOrder.serverId
        );
        if (serverOrder && serverOrder.status !== localOrder.status) {
          localOrder.status = serverOrder.status;
          updated = true;
        }
      }
    });

    if (updated) {
      await AsyncStorage.setItem(getOrderKey(), JSON.stringify(localOrders));
    }
  } catch (e) {
    console.log("Lỗi sync orders:", e);
  }
};