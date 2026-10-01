import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

import { formatINR } from "@/lib/currency";
import { Booking, PAYMENT_MODES, PaymentMode } from "@/lib/shopping-list";

const GREEN = "#4CAF50";
const TEXT = "#191D31";
const MUTED = "#666876";
const BORDER = "#EEF0F4";

const PAYMENT_ICONS: Record<PaymentMode, keyof typeof Ionicons.glyphMap> = {
  "Cash on Delivery": "cash-outline",
  "UPI on Delivery": "phone-portrait-outline",
  "Card on Delivery": "card-outline",
};

const MAX_QUANTITY = 20;

interface Props {
  visible: boolean;
  product: { id: string; name: string; price: number };
  onClose: () => void;
  onConfirm: (booking: Booking) => void;
}

const BookingSheet = ({ visible, product, onClose, onConfirm }: Props) => {
  const [quantity, setQuantity] = useState(1);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("Cash on Delivery");
  const [note, setNote] = useState("");

  // Start each booking fresh.
  useEffect(() => {
    if (visible) {
      setQuantity(1);
      setPaymentMode("Cash on Delivery");
      setNote("");
    }
  }, [visible]);

  const cost = Math.round(product.price * quantity * 100) / 100;

  const confirm = () =>
    onConfirm({
      productId: product.id,
      quantity,
      unitPrice: product.price,
      paymentMode,
      note: note.trim() || undefined,
    });

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <View style={styles.headerRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>Book this product</Text>
                <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
              </View>
              <TouchableOpacity onPress={onClose} accessibilityLabel="Close booking form" style={styles.closeButton}>
                <Ionicons name="close" size={22} color={TEXT} />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Quantity</Text>
            <View style={styles.quantityRow}>
              <TouchableOpacity
                onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                style={[styles.stepper, quantity <= 1 && styles.stepperDisabled]}
                accessibilityLabel="Decrease quantity"
              >
                <Ionicons name="remove" size={20} color={TEXT} />
              </TouchableOpacity>
              <Text style={styles.quantity}>{quantity}</Text>
              <TouchableOpacity
                onPress={() => setQuantity((q) => Math.min(MAX_QUANTITY, q + 1))}
                disabled={quantity >= MAX_QUANTITY}
                style={[styles.stepper, quantity >= MAX_QUANTITY && styles.stepperDisabled]}
                accessibilityLabel="Increase quantity"
              >
                <Ionicons name="add" size={20} color={TEXT} />
              </TouchableOpacity>
              <Text style={styles.unitPrice}>× {formatINR(product.price)}</Text>
            </View>

            <Text style={styles.label}>Payment mode</Text>
            <View style={styles.paymentList}>
              {PAYMENT_MODES.map((mode) => {
                const selected = mode === paymentMode;
                return (
                  <TouchableOpacity
                    key={mode}
                    onPress={() => setPaymentMode(mode)}
                    style={[styles.paymentOption, selected && styles.paymentOptionSelected]}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                  >
                    <Ionicons name={PAYMENT_ICONS[mode]} size={20} color={selected ? GREEN : MUTED} />
                    <Text style={[styles.paymentText, selected && { color: TEXT }]}>{mode}</Text>
                    <Ionicons
                      name={selected ? "radio-button-on" : "radio-button-off"}
                      size={20}
                      color={selected ? GREEN : MUTED}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={styles.hint}>Nothing is charged now. You pay the seller when your order arrives.</Text>

            <Text style={styles.label}>Message for the seller (optional)</Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="e.g. Please deliver after 6 pm"
              placeholderTextColor={MUTED}
              multiline
              maxLength={200}
              style={styles.noteInput}
            />

            <View style={styles.summary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total</Text>
                <Text style={styles.summaryTotal}>{formatINR(cost)}</Text>
              </View>
              <Text style={styles.budgetLine}>Booked on its own, separate from your shopping list.</Text>
            </View>

            <TouchableOpacity onPress={confirm} style={styles.confirmButton}>
              <Text style={styles.confirmText}>Confirm booking · {formatINR(cost)}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(25, 29, 49, 0.45)",
  },
  sheet: {
    maxHeight: "90%",
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  title: {
    fontFamily: "Rubik-Bold",
    fontSize: 20,
    color: TEXT,
  },
  productName: {
    fontFamily: "Rubik-Regular",
    fontSize: 15,
    color: MUTED,
    marginTop: 4,
  },
  closeButton: {
    padding: 4,
  },
  label: {
    fontFamily: "Rubik-Medium",
    fontSize: 12,
    color: MUTED,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 20,
    marginBottom: 8,
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  stepper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperDisabled: {
    opacity: 0.4,
  },
  quantity: {
    fontFamily: "Rubik-Bold",
    fontSize: 20,
    color: TEXT,
    minWidth: 24,
    textAlign: "center",
  },
  unitPrice: {
    fontFamily: "Rubik-Regular",
    fontSize: 15,
    color: MUTED,
  },
  paymentList: {
    gap: 8,
  },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
  },
  paymentOptionSelected: {
    borderColor: GREEN,
    backgroundColor: "#F1FAF1",
  },
  paymentText: {
    flex: 1,
    fontFamily: "Rubik-Medium",
    fontSize: 15,
    color: MUTED,
  },
  hint: {
    fontFamily: "Rubik-Regular",
    fontSize: 13,
    color: MUTED,
    marginTop: 8,
  },
  noteInput: {
    minHeight: 70,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 12,
    fontFamily: "Rubik-Regular",
    fontSize: 15,
    color: TEXT,
    textAlignVertical: "top",
  },
  summary: {
    marginTop: 20,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#F7F8FA",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    fontFamily: "Rubik-Medium",
    fontSize: 15,
    color: TEXT,
  },
  summaryTotal: {
    fontFamily: "Rubik-Bold",
    fontSize: 22,
    color: TEXT,
  },
  budgetLine: {
    fontFamily: "Rubik-Regular",
    fontSize: 13,
    color: MUTED,
    marginTop: 6,
  },
  confirmButton: {
    marginTop: 16,
    backgroundColor: GREEN,
    borderRadius: 999,
    paddingVertical: 15,
    alignItems: "center",
  },
  confirmText: {
    fontFamily: "Rubik-Bold",
    fontSize: 16,
    color: "white",
  },
});

export default BookingSheet;
