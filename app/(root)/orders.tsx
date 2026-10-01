import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

import { formatINR } from "@/lib/currency";
import { useGlobalContext } from "@/lib/global-provider";
import { fetchMyOrders } from "@/lib/orders-remote";
import { Order, useShoppingList } from "@/lib/shopping-list";

const GREEN = "#4CAF50";
const TEXT = "#191D31";
const MUTED = "#666876";
const BORDER = "#EEF0F4";

type HistoryView = "products" | "orders";

interface ProductHistory {
  key: string;
  name: string;
  productId?: string;
  quantity: number;
  spent: number;
  times: number;
  lastBought: string;
}

const roundRupees = (value: number) => Math.round(value * 100) / 100;
const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

// Purchase history: everything the user has booked or bought with "Buy All".
// Signed in: their orders from Supabase (any device) plus any on this device not saved there yet.
// Signed out: the orders saved on this device.
const PurchaseHistory = () => {
  const { user } = useGlobalContext();
  const { orders: deviceOrders } = useShoppingList();
  const [view, setView] = useState<HistoryView>("products");
  const [accountOrders, setAccountOrders] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);

  useEffect(() => {
    if (!user) {
      setAccountOrders(null);
      return;
    }
    setLoading(true);
    setLoadError(null);
    fetchMyOrders()
      .then(setAccountOrders)
      .catch((error) => setLoadError(error.message ?? "Could not load your history."))
      .finally(() => setLoading(false));
  }, [user?.id]);

  // Account orders, plus device orders the account copy doesn't already include.
  const orders = useMemo(() => {
    const inAccount = new Set((accountOrders ?? []).map((o) => o.remoteId));
    const deviceOnly = deviceOrders.filter((o) => !o.remoteId || !inAccount.has(o.remoteId));
    return [...(accountOrders ?? []), ...deviceOnly].sort((a, b) => b.placedAt.localeCompare(a.placedAt));
  }, [accountOrders, deviceOrders]);

  const products = useMemo(() => {
    const byProduct = new Map<string, ProductHistory>();
    for (const order of orders) {
      for (const line of order.lines) {
        const key = line.productId ?? `name:${line.name.trim().toLowerCase()}`;
        const entry = byProduct.get(key) ?? {
          key,
          name: line.name,
          productId: line.productId,
          quantity: 0,
          spent: 0,
          times: 0,
          lastBought: order.placedAt,
        };
        entry.quantity += line.quantity ?? 1;
        entry.spent = roundRupees(entry.spent + line.cost);
        entry.times += 1;
        if (order.placedAt > entry.lastBought) entry.lastBought = order.placedAt;
        byProduct.set(key, entry);
      }
    }
    return [...byProduct.values()].sort((a, b) => b.lastBought.localeCompare(a.lastBought));
  }, [orders]);

  const totalSpent = roundRupees(orders.reduce((sum, o) => sum + o.total, 0));

  const goBack = () => (router.canGoBack() ? router.back() : router.replace("/profile"));

  const showToast = (message: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => setToast(null), 2500);
  };

  const openProduct = (entry: ProductHistory) => {
    if (entry.productId) router.push(`/property/${entry.productId}`);
    else showToast(`No preview available for “${entry.name}”. It isn't a product in the shop.`);
  };

  // Where an order is stored, shown on its card.
  const storageLabel = (order: Order) => {
    if (order.remoteId) return { text: "Saved to your account", icon: "cloud-done-outline" as const };
    if (order.userId) return { text: "Not synced yet", icon: "cloud-offline-outline" as const };
    return { text: "This device only", icon: "phone-portrait-outline" as const };
  };

  const header = (
    <View style={{ gap: 14 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton} accessibilityLabel="Go back">
          <Ionicons name="arrow-back" size={20} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Purchase History</Text>
      </View>

      {user ? (
        <View style={styles.accountBanner}>
          <Ionicons name="cloud-done-outline" size={18} color={GREEN} />
          <Text style={styles.accountText} numberOfLines={1}>
            Saved to your account{user.email ? ` (${user.email})` : ""}
          </Text>
        </View>
      ) : (
        <TouchableOpacity style={[styles.accountBanner, styles.signInBanner]} onPress={() => router.push("/sign-up")}>
          <Ionicons name="person-circle-outline" size={18} color={TEXT} />
          <Text style={styles.accountText}>Sign in to keep your history on all your devices</Text>
          <Ionicons name="chevron-forward" size={16} color={MUTED} />
        </TouchableOpacity>
      )}

      {loadError && <Text style={styles.errorText}>Couldn't load your account history: {loadError}</Text>}

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{formatINR(totalSpent)}</Text>
          <Text style={styles.summaryLabel}>Total spent</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{orders.length}</Text>
          <Text style={styles.summaryLabel}>Orders</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{products.length}</Text>
          <Text style={styles.summaryLabel}>Products</Text>
        </View>
      </View>

      <View style={styles.segment}>
        {(["products", "orders"] as const).map((option) => (
          <TouchableOpacity
            key={option}
            onPress={() => setView(option)}
            style={[styles.segmentOption, view === option && styles.segmentOptionActive]}
            accessibilityRole="tab"
            accessibilityState={{ selected: view === option }}
          >
            <Text style={[styles.segmentText, view === option && styles.segmentTextActive]}>
              {option === "products" ? "Products" : "Orders"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading && <ActivityIndicator color={GREEN} />}
    </View>
  );

  const empty = (
    <View style={styles.empty}>
      <Ionicons name="receipt-outline" size={40} color={MUTED} />
      <Text style={styles.emptyTitle}>No purchases yet</Text>
      <Text style={styles.emptyText}>Book a product or buy your shopping list and it will show up here.</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {view === "products" ? (
        <FlatList
          data={products}
          keyExtractor={(entry) => entry.key}
          contentContainerStyle={styles.content}
          ListHeaderComponent={header}
          ListEmptyComponent={loading ? null : empty}
          renderItem={({ item: entry }) => (
            <TouchableOpacity style={styles.productRow} onPress={() => openProduct(entry)} activeOpacity={0.7}>
              <View style={styles.productIcon}>
                <Ionicons name={entry.productId ? "storefront-outline" : "basket-outline"} size={18} color={GREEN} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.productName} numberOfLines={1}>{entry.name}</Text>
                <Text style={styles.productMeta} numberOfLines={1}>
                  Bought {entry.times} {entry.times === 1 ? "time" : "times"} · {entry.quantity}{" "}
                  {entry.quantity === 1 ? "unit" : "units"} · last {shortDate(entry.lastBought)}
                </Text>
              </View>
              <Text style={styles.productSpent}>{formatINR(entry.spent)}</Text>
              {!!entry.productId && <Ionicons name="chevron-forward" size={16} color={MUTED} />}
            </TouchableOpacity>
          )}
        />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(order) => order.id}
          contentContainerStyle={styles.content}
          ListHeaderComponent={header}
          ListEmptyComponent={loading ? null : empty}
          renderItem={({ item: order }) => {
            const storage = storageLabel(order);
            return (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{order.source === "booking" ? "Booking" : "Shopping list"}</Text>
                  </View>
                  <Text style={styles.date}>
                    {new Date(order.placedAt).toLocaleString("en-IN", {
                      day: "numeric",
                      month: "short",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>

                {order.lines.map((line, index) => (
                  <View key={index} style={styles.line}>
                    <Text style={styles.lineName} numberOfLines={1}>
                      {line.quantity && line.quantity > 1 ? `${line.quantity} × ` : ""}
                      {line.name}
                    </Text>
                    <Text style={styles.lineCost}>{formatINR(line.cost)}</Text>
                  </View>
                ))}

                {!!order.note && <Text style={styles.note}>“{order.note}”</Text>}

                <View style={styles.cardFooter}>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={styles.payment}>{order.paymentMode}</Text>
                    <View style={styles.storage}>
                      <Ionicons name={storage.icon} size={13} color={MUTED} />
                      <Text style={styles.storageText}>{storage.text}</Text>
                    </View>
                  </View>
                  <Text style={styles.total}>{formatINR(order.total)}</Text>
                </View>
              </View>
            );
          }}
        />
      )}

      {toast && (
        <View style={styles.toast}>
          <Ionicons name="eye-off-outline" size={16} color="white" />
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  content: {
    padding: 20,
    gap: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backButton: {
    backgroundColor: GREEN,
    borderRadius: 999,
    padding: 8,
  },
  title: {
    fontFamily: "Rubik-Bold",
    fontSize: 22,
    color: TEXT,
  },
  accountBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#EAF6EA",
  },
  signInBanner: {
    backgroundColor: "#F7F8FA",
    borderWidth: 1,
    borderColor: BORDER,
  },
  accountText: {
    flex: 1,
    fontFamily: "Rubik-Medium",
    fontSize: 13,
    color: TEXT,
  },
  errorText: {
    fontFamily: "Rubik-Regular",
    fontSize: 13,
    color: "#F75555",
  },
  summaryRow: {
    flexDirection: "row",
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: "#F7F8FA",
  },
  summaryValue: {
    fontFamily: "Rubik-Bold",
    fontSize: 18,
    color: TEXT,
  },
  summaryLabel: {
    fontFamily: "Rubik-Regular",
    fontSize: 12,
    color: MUTED,
    marginTop: 2,
  },
  segment: {
    flexDirection: "row",
    padding: 4,
    borderRadius: 999,
    backgroundColor: "#F1F2F5",
  },
  segmentOption: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 9,
    borderRadius: 999,
  },
  segmentOptionActive: {
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  segmentText: {
    fontFamily: "Rubik-Medium",
    fontSize: 14,
    color: MUTED,
  },
  segmentTextActive: {
    color: TEXT,
  },
  empty: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 6,
  },
  emptyTitle: {
    fontFamily: "Rubik-SemiBold",
    fontSize: 16,
    color: TEXT,
  },
  emptyText: {
    fontFamily: "Rubik-Regular",
    fontSize: 14,
    color: MUTED,
    textAlign: "center",
  },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
  },
  productIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#EAF6EA",
    alignItems: "center",
    justifyContent: "center",
  },
  productName: {
    fontFamily: "Rubik-Medium",
    fontSize: 15,
    color: TEXT,
  },
  productMeta: {
    fontFamily: "Rubik-Regular",
    fontSize: 12,
    color: MUTED,
    marginTop: 2,
  },
  productSpent: {
    fontFamily: "Rubik-SemiBold",
    fontSize: 15,
    color: TEXT,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
    gap: 8,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  badge: {
    backgroundColor: "#EAF6EA",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontFamily: "Rubik-Medium",
    fontSize: 12,
    color: GREEN,
  },
  date: {
    fontFamily: "Rubik-Regular",
    fontSize: 12,
    color: MUTED,
  },
  line: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  lineName: {
    flex: 1,
    fontFamily: "Rubik-Regular",
    fontSize: 15,
    color: TEXT,
  },
  lineCost: {
    fontFamily: "Rubik-Medium",
    fontSize: 15,
    color: TEXT,
  },
  note: {
    fontFamily: "Rubik-Regular",
    fontSize: 13,
    color: MUTED,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingTop: 8,
  },
  payment: {
    fontFamily: "Rubik-Medium",
    fontSize: 13,
    color: MUTED,
  },
  storage: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  storageText: {
    fontFamily: "Rubik-Regular",
    fontSize: 12,
    color: MUTED,
  },
  total: {
    fontFamily: "Rubik-Bold",
    fontSize: 18,
    color: TEXT,
  },
  toast: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: TEXT,
  },
  toastText: {
    flex: 1,
    fontFamily: "Rubik-Medium",
    fontSize: 13,
    color: "white",
  },
});

export default PurchaseHistory;
