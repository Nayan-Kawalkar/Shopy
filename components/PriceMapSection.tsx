import React, { useCallback, useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";

import { formatINR } from "@/lib/currency";
import { getProperties } from "@/lib/supabase";
import { CropPrices } from "@/lib/use-crop-prices";
import { useSupabase } from "@/lib/useSupabase";
import { perKg } from "./MarketPrices";
import PriceMap, { MapPin } from "./PriceMap";

const GREEN = "#4CAF50";
const AMBER = "#F5A623";
const TEXT = "#212121";
const MUTED = "#757575";
const BORDER = "#EEF0F4";

type Layer = "mandi" | "products";

// "Price map": mandi prices for the crop selected above, or the shop's products at their farms.
const PriceMapSection = ({ prices }: { prices: CropPrices }) => {
  const [layer, setLayer] = useState<Layer>("mandi");
  const { data: products } = useSupabase({
    fn: getProperties,
    params: { filter: "All", query: "", limit: 50 },
  });

  const { commodity, result } = prices;

  const pins = useMemo<MapPin[]>(() => {
    if (layer === "mandi") {
      return (result?.rows ?? [])
        .filter((row) => row.latitude != null && row.longitude != null)
        .map((row, index) => ({
          id: `mandi-${commodity.label}-${index}`,
          latitude: row.latitude!,
          longitude: row.longitude!,
          title: `${row.market}, ${row.state}`,
          subtitle: `${commodity.label}${row.variety ? ` (${row.variety})` : ""} · ${formatINR(perKg(row.minPrice))}–${formatINR(perKg(row.maxPrice))} per kg`,
          price: `${formatINR(perKg(row.modalPrice))}/kg`,
          kind: "mandi" as const,
        }));
    }
    return (products ?? [])
      .filter((p) => p.latitude != null && p.longitude != null && p.price != null)
      .map((p) => ({
        id: `product-${p.id}`,
        latitude: p.latitude!,
        longitude: p.longitude!,
        title: p.name,
        subtitle: p.address ?? "",
        price: formatINR(p.price),
        kind: "product" as const,
        productId: p.id,
      }));
  }, [layer, result, commodity.label, products]);

  const openProduct = useCallback((productId: string) => router.push(`/property/${productId}`), []);

  const unmapped = layer === "mandi" ? (result?.rows.length ?? 0) - pins.length : 0;

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>Price map</Text>

      <View style={styles.segment}>
        {(["mandi", "products"] as const).map((option) => (
          <TouchableOpacity
            key={option}
            onPress={() => setLayer(option)}
            style={[styles.segmentOption, layer === option && styles.segmentOptionActive]}
            accessibilityRole="tab"
            accessibilityState={{ selected: layer === option }}
          >
            <View style={[styles.dot, { backgroundColor: option === "mandi" ? AMBER : GREEN }]} />
            <Text style={[styles.segmentText, layer === option && styles.segmentTextActive]}>
              {option === "mandi" ? `Mandi · ${commodity.label}` : "Shop products"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {pins.length > 0 ? (
        <PriceMap pins={pins} onOpenProduct={openProduct} />
      ) : (
        <View style={styles.emptyMap}>
          <Text style={styles.note}>
            {layer === "mandi" ? `No ${commodity.label.toLowerCase()} markets to show yet.` : "No products with a location yet."}
          </Text>
        </View>
      )}

      <Text style={styles.note}>
        {layer === "mandi"
          ? `${result?.source === "live" ? "Live Agmarknet" : "Sample"} wholesale prices per kg. Pick another crop in the prices above to change the map.`
          : "Each pin is a farm selling in the shop, with its price. Tap a pin, then its details, to open the product."}
        {unmapped > 0 ? ` ${unmapped} market${unmapped === 1 ? "" : "s"} without a known location ${unmapped === 1 ? "is" : "are"} listed above only.` : ""}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginTop: 16,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: "#FAFBFC",
    gap: 12,
  },
  heading: {
    fontSize: 16,
    fontWeight: "bold",
    color: TEXT,
  },
  segment: {
    flexDirection: "row",
    padding: 4,
    borderRadius: 999,
    backgroundColor: "#F1F2F5",
  },
  segmentOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
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
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: "600",
    color: MUTED,
  },
  segmentTextActive: {
    color: TEXT,
  },
  emptyMap: {
    height: 120,
    borderRadius: 14,
    backgroundColor: "#EEF0F4",
    alignItems: "center",
    justifyContent: "center",
  },
  note: {
    fontSize: 12,
    color: MUTED,
  },
});

export default PriceMapSection;
