import { supabase } from "./supabase";
import type { Order, OrderLine, PaymentMode } from "./shopping-list";

// Purchase history in Supabase (table public.orders). Row Level Security limits every
// signed-in user to their own rows, and user_id defaults to the caller's auth.uid().

interface OrderRow {
  id: string;
  placed_at: string;
  source: Order["source"];
  lines: OrderLine[];
  total: number | string;
  payment_mode: PaymentMode;
  note: string | null;
}

// Saves an order to the signed-in user's account; returns its id there, or null if it couldn't be saved.
export async function uploadOrder(order: Order): Promise<string | null> {
  const { data, error } = await supabase
    .from("orders")
    .insert({
      placed_at: order.placedAt,
      source: order.source,
      lines: order.lines,
      total: order.total,
      payment_mode: order.paymentMode,
      note: order.note ?? null,
    })
    .select("id")
    .single();
  if (error) {
    console.warn("Could not save the order to your account:", error.message);
    return null;
  }
  return data.id as string;
}

// The signed-in user's orders, newest first.
export async function fetchMyOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("id, placed_at, source, lines, total, payment_mode, note")
    .order("placed_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  return (data as OrderRow[]).map((row) => ({
    id: row.id,
    remoteId: row.id,
    placedAt: row.placed_at,
    source: row.source,
    lines: row.lines,
    total: Number(row.total),
    paymentMode: row.payment_mode,
    note: row.note ?? undefined,
  }));
}
