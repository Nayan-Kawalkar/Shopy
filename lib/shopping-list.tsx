import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AppState, Platform } from "react-native";

import { formatINR } from "./currency";
import { useGlobalContext } from "./global-provider";
import { notify } from "./notifications";
import { uploadOrder } from "./orders-remote";

// Nothing is charged in the app; the buyer pays the seller this way when the order arrives.
export const PAYMENT_MODES = ["Cash on Delivery", "UPI on Delivery", "Card on Delivery"] as const;
export type PaymentMode = (typeof PAYMENT_MODES)[number];

// What the booking form on a product page submits.
export interface Booking {
  productId: string;
  quantity: number;
  unitPrice: number;
  paymentMode: PaymentMode;
  note?: string;
}

export interface ShoppingItem {
  id: string;
  name: string;
  cost: number; // rupees (quantity × unit price for shop products)
  addedAt: string;
  // Set for shop products (added from a product page); missing for items typed in by hand.
  productId?: string;
  quantity?: number;
  unitPrice?: number;
  // Only on items saved by an earlier version, where booking also added to the list.
  paymentMode?: PaymentMode;
  note?: string;
}

export interface OrderLine {
  name: string;
  cost: number;
  productId?: string;
  quantity?: number;
  unitPrice?: number;
}

export interface Order {
  id: string;
  placedAt: string;
  source: "booking" | "shopping-list";
  lines: OrderLine[];
  total: number;
  paymentMode: PaymentMode;
  note?: string;
  // Who was signed in when it was placed (missing = placed while signed out, kept on this device only).
  userId?: string;
  // Its id in the user's account (Supabase); missing until it has been saved there.
  remoteId?: string;
}

interface StoredList {
  items: ShoppingItem[];
  budget: number;
  pin: string | null;
  orders: Order[];
}

// Saved on this device only (AsyncStorage; localStorage on web).
const STORAGE_KEY = "digital-farm/shopping-list/v1";
export const DEFAULT_BUDGET = 2000;

interface ShoppingListContextType {
  ready: boolean;
  items: ShoppingItem[];
  budget: number;
  total: number;
  orders: Order[];
  hasPin: boolean;
  // Items can only be deleted while unlocked with the PIN.
  locked: boolean;
  addItem: (name: string, cost: number) => void;
  // Adds a shop product, or raises its quantity if it's already on the list.
  addProduct: (product: { id: string; name: string; price: number }, quantity?: number) => void;
  // Orders one product straight away; it doesn't go on the list.
  bookProduct: (name: string, booking: Booking) => Order;
  // Orders everything on the list and empties it. Returns null when the list is empty or over the limit.
  buyAll: (paymentMode?: PaymentMode) => Order | null;
  removeItem: (id: string) => void;
  setBudget: (budget: number) => void;
  createPin: (pin: string) => void;
  unlock: (pin: string) => boolean;
  lock: () => void;
}

const ShoppingListContext = createContext<ShoppingListContextType | undefined>(undefined);

const roundRupees = (value: number) => Math.round(value * 100) / 100;
const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

export const ShoppingListProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useGlobalContext();
  const [ready, setReady] = useState(false);
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [budget, setBudgetState] = useState(DEFAULT_BUDGET);
  const [pin, setPinState] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [locked, setLocked] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        const saved: Partial<StoredList> = JSON.parse(raw);
        if (Array.isArray(saved.items)) setItems(saved.items);
        if (typeof saved.budget === "number") setBudgetState(saved.budget);
        if (typeof saved.pin === "string") setPinState(saved.pin);
        if (Array.isArray(saved.orders)) setOrders(saved.orders);
      })
      .catch((error) => console.error("Could not load the shopping list:", error))
      .finally(() => setReady(true));
  }, []);

  // Save after the first load, so an empty initial state never overwrites the saved list.
  useEffect(() => {
    if (!ready) return;
    const data: StoredList = { items, budget, pin, orders };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch((error) =>
      console.error("Could not save the shopping list:", error)
    );
  }, [ready, items, budget, pin, orders]);

  // Re-lock whenever the app goes to the background.
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state !== "active") setLocked(true);
    });
    return () => subscription.remove();
  }, []);

  const total = useMemo(() => roundRupees(items.reduce((sum, item) => sum + item.cost, 0)), [items]);

  // Copies an order placed while signed in to the user's account, then remembers its id there.
  const saveToAccount = useCallback(async (order: Order) => {
    const remoteId = await uploadOrder(order);
    if (remoteId) {
      setOrders((current) => current.map((o) => (o.id === order.id ? { ...o, remoteId } : o)));
    }
  }, []);

  // Retry orders that were placed while signed in but couldn't be saved (e.g. offline) once that user is back.
  useEffect(() => {
    if (!ready || !user) return;
    orders.filter((o) => o.userId === user.id && !o.remoteId).forEach((o) => saveToAccount(o));
    // Only when the user or loaded state changes, not on every order update.
  }, [ready, user?.id]);

  // Vibrates and notifies when adding `addedCost` takes the list over the limit.
  const warnIfCrossingBudget = useCallback(
    (addedCost: number) => {
      const newTotal = roundRupees(total + addedCost);
      if (total > budget || newTotal <= budget) return;
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      }
      notify(
        "Over your budget",
        `Your list is now ${formatINR(newTotal)}, ${formatINR(roundRupees(newTotal - budget))} over your ${formatINR(budget)} limit.`,
        "/shopping-list"
      ).catch(() => {});
    },
    [total, budget]
  );

  const addItem = useCallback(
    (name: string, cost: number) => {
      setItems((current) => [
        { id: newId(), name: name.trim(), cost, addedAt: new Date().toISOString() },
        ...current,
      ]);
      warnIfCrossingBudget(cost);
    },
    [warnIfCrossingBudget]
  );

  const addProduct = useCallback(
    (product: { id: string; name: string; price: number }, quantity = 1) => {
      setItems((current) => {
        const existing = current.find((item) => item.productId === product.id);
        if (!existing) {
          return [
            {
              id: newId(),
              name: product.name,
              cost: roundRupees(product.price * quantity),
              addedAt: new Date().toISOString(),
              productId: product.id,
              quantity,
              unitPrice: product.price,
            },
            ...current,
          ];
        }
        const newQuantity = (existing.quantity ?? 1) + quantity;
        return current.map((item) =>
          item === existing
            ? { ...item, quantity: newQuantity, unitPrice: product.price, cost: roundRupees(product.price * newQuantity) }
            : item
        );
      });
      warnIfCrossingBudget(roundRupees(product.price * quantity));
    },
    [warnIfCrossingBudget]
  );

  const bookProduct = useCallback((name: string, booking: Booking) => {
    const cost = roundRupees(booking.unitPrice * booking.quantity);
    const order: Order = {
      id: newId(),
      placedAt: new Date().toISOString(),
      source: "booking",
      lines: [{ name, cost, productId: booking.productId, quantity: booking.quantity, unitPrice: booking.unitPrice }],
      total: cost,
      paymentMode: booking.paymentMode,
      note: booking.note,
      userId: user?.id,
    };
    setOrders((current) => [order, ...current]);
    if (user) saveToAccount(order);
    notify(
      "Booking confirmed",
      `${booking.quantity} × ${name} · ${formatINR(cost)} · ${booking.paymentMode}`,
      "/orders"
    ).catch(() => {});
    return order;
  }, [user, saveToAccount]);

  const buyAll = useCallback(
    (paymentMode: PaymentMode = "Cash on Delivery") => {
      if (items.length === 0 || total > budget) return null;
      const order: Order = {
        id: newId(),
        placedAt: new Date().toISOString(),
        source: "shopping-list",
        lines: items.map(({ name, cost, productId, quantity, unitPrice }) => ({ name, cost, productId, quantity, unitPrice })),
        total,
        paymentMode,
        userId: user?.id,
      };
      setOrders((current) => [order, ...current]);
      setItems([]);
      if (user) saveToAccount(order);
      notify(
        "Order placed",
        `${items.length} ${items.length === 1 ? "item" : "items"} · ${formatINR(total)} · ${paymentMode}`,
        "/orders"
      ).catch(() => {});
      return order;
    },
    [items, total, budget, user, saveToAccount]
  );

  const removeItem = useCallback(
    (id: string) => {
      if (locked) return;
      setItems((current) => current.filter((item) => item.id !== id));
    },
    [locked]
  );

  const createPin = useCallback((newPin: string) => {
    setPinState(newPin);
    setLocked(false);
  }, []);

  const unlock = useCallback(
    (attempt: string) => {
      if (pin === null || attempt !== pin) return false;
      setLocked(false);
      return true;
    },
    [pin]
  );

  const lock = useCallback(() => setLocked(true), []);

  return (
    <ShoppingListContext.Provider
      value={{
        ready,
        items,
        budget,
        total,
        orders,
        hasPin: pin !== null,
        locked,
        addItem,
        addProduct,
        bookProduct,
        buyAll,
        removeItem,
        setBudget: setBudgetState,
        createPin,
        unlock,
        lock,
      }}
    >
      {children}
    </ShoppingListContext.Provider>
  );
};

export const useShoppingList = (): ShoppingListContextType => {
  const context = useContext(ShoppingListContext);
  if (!context) throw new Error("useShoppingList must be used within a ShoppingListProvider");
  return context;
};
