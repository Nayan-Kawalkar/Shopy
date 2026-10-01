import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { useBottomTabBarHeight } from "expo-router/tabs";
import Ionicons from "@expo/vector-icons/Ionicons";

import { s } from "../../styles";
import { formatINR, parseRupees } from "@/lib/currency";
import { Order, ShoppingItem, useShoppingList } from "@/lib/shopping-list";

const COLORS = {
  text: s.black[300],
  muted: s.black[200],
  green: s.primary[300],
  amber: "#F5A623",
  red: s.danger,
  border: "#EEF0F4",
  card: "#F7F8FA",
};

const roundRupees = (value: number) => Math.round(value * 100) / 100;

const ShoppingList = () => {
  const {
    ready, items, budget, total, hasPin, locked,
    addItem, buyAll, removeItem, setBudget, createPin, unlock, lock,
  } = useShoppingList();
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const tabBarHeight = useBottomTabBarHeight();

  const [name, setName] = useState("");
  const [cost, setCost] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const [editingBudget, setEditingBudget] = useState(false);
  const [budgetText, setBudgetText] = useState("");
  const [budgetError, setBudgetError] = useState<string | null>(null);

  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pinText, setPinText] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);

  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);

  // Lock again when leaving this tab, so deleting needs the PIN on every visit.
  useFocusEffect(useCallback(() => () => lock(), [lock]));

  const showToast = (message: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => setToast(null), 2500);
  };

  // One tap orders the whole list (pay on delivery). buyAll refuses when the list is over the limit.
  const handleBuyAll = () => {
    const order = buyAll();
    if (order) setLastOrder(order);
  };

  // Shop products link to their page; items typed in by hand have nothing to show.
  const openItem = (item: ShoppingItem) => {
    if (item.productId) {
      router.push(`/property/${item.productId}`);
    } else {
      showToast(`No preview available for “${item.name}”. It isn't a product in the shop.`);
    }
  };

  const over = roundRupees(total - budget);
  const ratio = budget > 0 ? total / budget : 0;
  const statusColor = over > 0 ? COLORS.red : ratio >= 0.9 ? COLORS.amber : COLORS.green;

  const handleAdd = () => {
    const trimmed = name.trim();
    const amount = parseRupees(cost);
    if (!trimmed) return setFormError("Write what you want to buy.");
    if (amount === null) return setFormError("Enter the cost in rupees, for example 68.");
    addItem(trimmed, amount);
    setLastOrder(null);
    setName("");
    setCost("");
    setFormError(null);
  };

  const startEditingBudget = () => {
    setBudgetText(String(budget));
    setBudgetError(null);
    setEditingBudget(true);
  };

  const saveBudget = () => {
    const amount = parseRupees(budgetText);
    if (amount === null) return setBudgetError("Enter a limit above ₹0.");
    setBudget(amount);
    setEditingBudget(false);
  };

  const openPinModal = () => {
    setPinText("");
    setPinError(null);
    setPinModalOpen(true);
  };

  const submitPin = () => {
    if (!/^\d{4}$/.test(pinText)) return setPinError("Use exactly 4 digits.");
    if (!hasPin) {
      createPin(pinText);
      setPinModalOpen(false);
    } else if (unlock(pinText)) {
      setPinModalOpen(false);
    } else {
      setPinError("Wrong PIN. Try again.");
      setPinText("");
    }
  };

  // Passed as an element (not a component) so the text inputs keep focus while typing.
  const header = (
    <View style={styles.header}>
      <View style={styles.titleRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Shopping List</Text>
          <Text style={styles.subtitle}>
            {items.length} {items.length === 1 ? "item" : "items"} · saved on this device
          </Text>
        </View>
        <TouchableOpacity
          onPress={locked ? openPinModal : lock}
          style={[styles.lockButton, !locked && styles.lockButtonOpen]}
          accessibilityLabel={locked ? "Unlock to remove items" : "Lock the list"}
        >
          <Ionicons name={locked ? "lock-closed" : "lock-open"} size={16} color={locked ? COLORS.text : "#fff"} />
          <Text style={[styles.lockText, !locked && { color: "#fff" }]}>{locked ? "Locked" : "Unlocked"}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <View style={styles.budgetRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Spending limit</Text>
            {editingBudget ? (
              <View style={styles.budgetEditRow}>
                <Text style={styles.budgetValue}>₹</Text>
                <TextInput
                  value={budgetText}
                  onChangeText={setBudgetText}
                  keyboardType="decimal-pad"
                  style={styles.budgetInput}
                  autoFocus
                  onSubmitEditing={saveBudget}
                />
              </View>
            ) : (
              <Text style={styles.budgetValue}>{formatINR(budget)}</Text>
            )}
          </View>
          {editingBudget ? (
            <View style={styles.buttonRow}>
              <TouchableOpacity onPress={() => setEditingBudget(false)} style={styles.ghostButton}>
                <Text style={styles.ghostText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveBudget} style={styles.solidButton}>
                <Text style={styles.solidButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={startEditingBudget} style={styles.ghostButton}>
              <Ionicons name="pencil" size={14} color={COLORS.green} />
              <Text style={styles.ghostText}>Change</Text>
            </TouchableOpacity>
          )}
        </View>
        {budgetError && <Text style={styles.errorText}>{budgetError}</Text>}
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Add an item</Text>
        <View style={styles.addRow}>
          <TextInput
            placeholder="Milk, eggs, bread…"
            placeholderTextColor={COLORS.muted}
            value={name}
            onChangeText={setName}
            style={[styles.input, { flex: 1, minWidth: 0 }]}
            returnKeyType="next"
          />
          <View style={[styles.input, styles.costInputWrap]}>
            <Text style={styles.rupee}>₹</Text>
            <TextInput
              placeholder="0"
              placeholderTextColor={COLORS.muted}
              value={cost}
              onChangeText={setCost}
              keyboardType="decimal-pad"
              style={styles.costInput}
              onSubmitEditing={handleAdd}
            />
          </View>
          <TouchableOpacity onPress={handleAdd} style={styles.addButton} accessibilityLabel="Add item">
            <Ionicons name="add" size={26} color="#fff" />
          </TouchableOpacity>
        </View>
        {formError && <Text style={styles.errorText}>{formError}</Text>}
      </View>

      {lastOrder && (
        <View style={styles.success}>
          <Ionicons name="checkmark-circle" size={22} color={COLORS.green} />
          <View style={{ flex: 1 }}>
            <Text style={styles.successTitle}>Order placed</Text>
            <Text style={styles.successText}>
              {lastOrder.lines.length} {lastOrder.lines.length === 1 ? "item" : "items"} · {formatINR(lastOrder.total)} · {lastOrder.paymentMode}
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.push("/orders")} style={styles.ghostButton}>
            <Text style={styles.ghostText}>View</Text>
          </TouchableOpacity>
        </View>
      )}

      {over > 0 && (
        <View style={styles.warning}>
          <Ionicons name="warning" size={18} color={COLORS.red} />
          <Text style={styles.warningText}>
            You're {formatINR(over)} over your {formatINR(budget)} limit. Buy All is unavailable until you're back under it.
          </Text>
        </View>
      )}

      {!locked && (
        <Text style={styles.hint}>
          Unlocked: tap the bin to remove an item. The list locks again when you leave this tab.
        </Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: tabBarHeight + 170 }}
        ListHeaderComponent={header}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={
          ready ? (
            <View style={styles.empty}>
              <Ionicons name="basket-outline" size={40} color={COLORS.muted} />
              <Text style={styles.emptyTitle}>Your list is empty</Text>
              <Text style={styles.emptyText}>Add milk, eggs or anything else you need, with its price.</Text>
            </View>
          ) : (
            <ActivityIndicator color={COLORS.green} style={{ marginTop: 30 }} />
          )
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() => openItem(item)}
            activeOpacity={0.7}
            accessibilityLabel={`Open ${item.name}`}
          >
            <View style={styles.rowIcon}>
              <Ionicons name={item.productId ? "storefront-outline" : "basket-outline"} size={18} color={COLORS.green} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowName} numberOfLines={1}>{item.name}</Text>
              {item.quantity != null && item.unitPrice != null && (
                <Text style={styles.rowMeta} numberOfLines={1}>
                  {item.quantity} × {formatINR(item.unitPrice)}{item.paymentMode ? ` · ${item.paymentMode}` : ""}
                </Text>
              )}
              {!!item.note && <Text style={styles.rowMeta} numberOfLines={1}>“{item.note}”</Text>}
            </View>
            <Text style={styles.rowCost}>{formatINR(item.cost)}</Text>
            {!locked ? (
              <TouchableOpacity
                onPress={() => removeItem(item.id)}
                style={styles.deleteButton}
                accessibilityLabel={`Remove ${item.name}`}
              >
                <Ionicons name="trash-outline" size={18} color={COLORS.red} />
              </TouchableOpacity>
            ) : (
              !!item.productId && <Ionicons name="chevron-forward" size={16} color={COLORS.muted} />
            )}
          </TouchableOpacity>
        )}
      />

      <View style={[styles.footer, { bottom: tabBarHeight }]}>
        {toast && (
          <View style={styles.toast}>
            <Ionicons name="eye-off-outline" size={16} color="white" />
            <Text style={styles.toastText}>{toast}</Text>
          </View>
        )}
        <View style={styles.progressTrack}>
          <View
            style={[styles.progressFill, { width: `${Math.min(ratio, 1) * 100}%`, backgroundColor: statusColor }]}
          />
        </View>
        <View style={styles.footerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Total</Text>
            <Text style={[styles.totalValue, over > 0 && { color: COLORS.red }]}>{formatINR(total)}</Text>
            <Text style={[styles.remaining, { color: statusColor }]}>
              {over > 0
                ? `${formatINR(over)} over limit`
                : `${formatINR(roundRupees(budget - total))} left of ${formatINR(budget)}`}
            </Text>
          </View>
          {items.length > 0 && (
            <TouchableOpacity
              onPress={handleBuyAll}
              disabled={over > 0}
              style={[styles.buyButton, over > 0 && styles.buyButtonDisabled]}
              accessibilityLabel="Buy all items"
              accessibilityState={{ disabled: over > 0 }}
            >
              <Ionicons name={over > 0 ? "lock-closed" : "bag-check-outline"} size={18} color="white" />
              <Text style={styles.buyText}>Buy All</Text>
            </TouchableOpacity>
          )}
        </View>
        {over > 0 && items.length > 0 && (
          <Text style={styles.limitNote}>
            Spending limit exceeded. Remove items or raise your limit to buy.
          </Text>
        )}
      </View>

      <Modal
        visible={pinModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setPinModalOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setPinModalOpen(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Ionicons name="lock-closed" size={28} color={COLORS.green} />
            <Text style={styles.modalTitle}>{hasPin ? "Enter your PIN" : "Create a PIN"}</Text>
            <Text style={styles.modalText}>
              {hasPin
                ? "Unlock to remove items from the list."
                : "Only someone with this 4-digit PIN can remove items. Anyone can still add."}
            </Text>
            <TextInput
              value={pinText}
              onChangeText={(text) => setPinText(text.replace(/\D/g, "").slice(0, 4))}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={4}
              autoFocus
              placeholder="••••"
              placeholderTextColor={COLORS.muted}
              style={styles.pinInput}
              onSubmitEditing={submitPin}
            />
            {pinError && <Text style={styles.errorText}>{pinError}</Text>}
            <View style={[styles.buttonRow, { marginTop: 16 }]}>
              <TouchableOpacity onPress={() => setPinModalOpen(false)} style={styles.ghostButton}>
                <Text style={styles.ghostText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={submitPin} style={styles.solidButton}>
                <Text style={styles.solidButtonText}>{hasPin ? "Unlock" : "Save PIN"}</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    gap: 14,
    paddingTop: 12,
    paddingBottom: 16,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontFamily: "Rubik-Bold",
    fontSize: 24,
    color: COLORS.text,
  },
  subtitle: {
    fontFamily: "Rubik-Regular",
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 2,
  },
  lockButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  lockButtonOpen: {
    backgroundColor: COLORS.green,
    borderColor: COLORS.green,
  },
  lockText: {
    fontFamily: "Rubik-Medium",
    fontSize: 13,
    color: COLORS.text,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
  },
  label: {
    fontFamily: "Rubik-Medium",
    fontSize: 12,
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  budgetRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  budgetValue: {
    fontFamily: "Rubik-Bold",
    fontSize: 22,
    color: COLORS.text,
    marginTop: 4,
  },
  budgetEditRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  budgetInput: {
    fontFamily: "Rubik-Bold",
    fontSize: 22,
    color: COLORS.text,
    marginTop: 4,
    minWidth: 90,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.green,
    paddingVertical: 0,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 8,
  },
  ghostButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  ghostText: {
    fontFamily: "Rubik-Medium",
    fontSize: 14,
    color: COLORS.green,
  },
  solidButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: COLORS.green,
  },
  solidButtonText: {
    fontFamily: "Rubik-Medium",
    fontSize: 14,
    color: "white",
  },
  addRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
  },
  input: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "white",
    paddingHorizontal: 12,
    fontFamily: "Rubik-Regular",
    fontSize: 15,
    color: COLORS.text,
  },
  costInputWrap: {
    width: 96,
    flexDirection: "row",
    alignItems: "center",
  },
  rupee: {
    fontFamily: "Rubik-Medium",
    fontSize: 15,
    color: COLORS.muted,
    marginRight: 2,
  },
  costInput: {
    flex: 1,
    minWidth: 0,
    height: "100%",
    fontFamily: "Rubik-Regular",
    fontSize: 15,
    color: COLORS.text,
  },
  addButton: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: COLORS.green,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    fontFamily: "Rubik-Regular",
    fontSize: 13,
    color: COLORS.red,
    marginTop: 8,
  },
  warning: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#FDECEC",
  },
  warningText: {
    flex: 1,
    fontFamily: "Rubik-Medium",
    fontSize: 14,
    color: COLORS.red,
  },
  hint: {
    fontFamily: "Rubik-Regular",
    fontSize: 13,
    color: COLORS.muted,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "white",
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#EAF6EA",
    alignItems: "center",
    justifyContent: "center",
  },
  rowName: {
    fontFamily: "Rubik-Medium",
    fontSize: 16,
    color: COLORS.text,
  },
  rowMeta: {
    fontFamily: "Rubik-Regular",
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 2,
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: COLORS.text,
  },
  toastText: {
    flex: 1,
    fontFamily: "Rubik-Medium",
    fontSize: 13,
    color: "white",
  },
  rowCost: {
    fontFamily: "Rubik-SemiBold",
    fontSize: 16,
    color: COLORS.text,
  },
  deleteButton: {
    padding: 6,
    marginLeft: -4,
  },
  empty: {
    alignItems: "center",
    paddingVertical: 30,
    gap: 6,
  },
  emptyTitle: {
    fontFamily: "Rubik-SemiBold",
    fontSize: 16,
    color: COLORS.text,
  },
  emptyText: {
    fontFamily: "Rubik-Regular",
    fontSize: 14,
    color: COLORS.muted,
    textAlign: "center",
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 12,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.border,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginTop: 10,
  },
  totalValue: {
    fontFamily: "Rubik-Bold",
    fontSize: 26,
    color: COLORS.text,
    marginTop: 2,
  },
  remaining: {
    fontFamily: "Rubik-Medium",
    fontSize: 13,
    marginTop: 2,
  },
  buyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: 999,
    backgroundColor: COLORS.green,
  },
  buyButtonDisabled: {
    backgroundColor: "#B8BCC8",
  },
  buyText: {
    fontFamily: "Rubik-Bold",
    fontSize: 16,
    color: "white",
  },
  limitNote: {
    fontFamily: "Rubik-Medium",
    fontSize: 13,
    color: COLORS.red,
    marginTop: 8,
  },
  success: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#EAF6EA",
  },
  successTitle: {
    fontFamily: "Rubik-SemiBold",
    fontSize: 15,
    color: COLORS.text,
  },
  successText: {
    fontFamily: "Rubik-Regular",
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 2,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(25, 29, 49, 0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
  },
  modalTitle: {
    fontFamily: "Rubik-Bold",
    fontSize: 20,
    color: COLORS.text,
    marginTop: 10,
  },
  modalText: {
    fontFamily: "Rubik-Regular",
    fontSize: 14,
    color: COLORS.muted,
    textAlign: "center",
    marginTop: 6,
  },
  pinInput: {
    marginTop: 18,
    width: 160,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    textAlign: "center",
    fontFamily: "Rubik-Bold",
    fontSize: 24,
    letterSpacing: 10,
    color: COLORS.text,
  },
});

export default ShoppingList;
