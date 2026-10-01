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

export interface ShoppingItem {
  id: string;
  name: string;
  cost: number; // rupees
  addedAt: string;
}

interface StoredList {
  items: ShoppingItem[];
  budget: number;
  pin: string | null;
}

// Saved on this device only (AsyncStorage; localStorage on web).
const STORAGE_KEY = "digital-farm/shopping-list/v1";
export const DEFAULT_BUDGET = 2000;

interface ShoppingListContextType {
  ready: boolean;
  items: ShoppingItem[];
  budget: number;
  total: number;
  hasPin: boolean;
  // Items can only be deleted while unlocked with the PIN.
  locked: boolean;
  addItem: (name: string, cost: number) => void;
  removeItem: (id: string) => void;
  setBudget: (budget: number) => void;
  createPin: (pin: string) => void;
  unlock: (pin: string) => boolean;
  lock: () => void;
}

const ShoppingListContext = createContext<ShoppingListContextType | undefined>(undefined);

export const ShoppingListProvider = ({ children }: { children: ReactNode }) => {
  const [ready, setReady] = useState(false);
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [budget, setBudgetState] = useState(DEFAULT_BUDGET);
  const [pin, setPinState] = useState<string | null>(null);
  const [locked, setLocked] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        const saved: Partial<StoredList> = JSON.parse(raw);
        if (Array.isArray(saved.items)) setItems(saved.items);
        if (typeof saved.budget === "number") setBudgetState(saved.budget);
        if (typeof saved.pin === "string") setPinState(saved.pin);
      })
      .catch((error) => console.error("Could not load the shopping list:", error))
      .finally(() => setReady(true));
  }, []);

  // Save after the first load, so an empty initial state never overwrites the saved list.
  useEffect(() => {
    if (!ready) return;
    const data: StoredList = { items, budget, pin };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch((error) =>
      console.error("Could not save the shopping list:", error)
    );
  }, [ready, items, budget, pin]);

  // Re-lock whenever the app goes to the background.
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state !== "active") setLocked(true);
    });
    return () => subscription.remove();
  }, []);

  const total = useMemo(
    () => Math.round(items.reduce((sum, item) => sum + item.cost, 0) * 100) / 100,
    [items]
  );

  const addItem = useCallback(
    (name: string, cost: number) => {
      const item: ShoppingItem = {
        id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
        name: name.trim(),
        cost,
        addedAt: new Date().toISOString(),
      };
      setItems((current) => [item, ...current]);

      if (Platform.OS !== "web" && total <= budget && total + cost > budget) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      }
    },
    [total, budget]
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
        hasPin: pin !== null,
        locked,
        addItem,
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
