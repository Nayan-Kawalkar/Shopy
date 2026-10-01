import React from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { openBrowserAsync } from "expo-web-browser";
import Ionicons from "@expo/vector-icons/Ionicons";

import { formatINR } from "@/lib/currency";
import { CropPrices } from "@/lib/use-crop-prices";

const GREEN = "#4CAF50";
const AMBER = "#F5A623";
const TEXT = "#212121";
const MUTED = "#757575";
const BORDER = "#EEF0F4";

// Mandis quote ₹ per quintal (100 kg); shoppers think in ₹ per kg.
export const perKg = (perQuintal: number) => Math.round(perQuintal) / 100;

// "Today's market prices": crops mentioned in the current headlines come first and are marked,
// with the related headline shown under their prices.
const MarketPrices = ({ prices }: { prices: CropPrices }) => {
  const { ordered, inNews: inNewsLabels, commodity, select: setSelected, result, loading, relatedNews } = prices;

  return (
    <View style={styles.section}>
      <View style={styles.titleRow}>
        <Text style={styles.heading}>Today's market prices</Text>
        {result && (
          <View style={[styles.sourceTag, result.source === "sample" && styles.sourceTagSample]}>
            <Text style={styles.sourceTagText}>{result.source === "live" ? "Live · Agmarknet" : "Sample prices"}</Text>
          </View>
        )}
      </View>
      <Text style={styles.subtitle}>Wholesale mandi rates per kg. Crops in today's news are marked.</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {ordered.map((c) => {
          const active = c.label === commodity.label;
          return (
            <TouchableOpacity
              key={c.label}
              onPress={() => setSelected(c.label)}
              style={[styles.chip, active && styles.chipActive]}
              accessibilityLabel={`${c.label} prices${inNewsLabels.has(c.label) ? ", in the news" : ""}`}
            >
              {inNewsLabels.has(c.label) && (
                <Ionicons name="newspaper" size={13} color={active ? "white" : GREEN} />
              )}
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{c.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {relatedNews && (
        <TouchableOpacity
          style={styles.newsLink}
          disabled={relatedNews.isSample}
          onPress={() => openBrowserAsync(relatedNews.url)}
        >
          <Ionicons name="newspaper-outline" size={16} color={GREEN} />
          <Text style={styles.newsLinkText} numberOfLines={2}>
            In the news: {relatedNews.title}
          </Text>
        </TouchableOpacity>
      )}

      {loading ? (
        <ActivityIndicator color={GREEN} style={{ marginVertical: 16 }} />
      ) : result && result.rows.length > 0 ? (
        <View style={styles.rows}>
          {result.rows.slice(0, 4).map((row, index) => (
            <View key={`${row.market}-${index}`} style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.market} numberOfLines={1}>{row.market}</Text>
                <Text style={styles.place} numberOfLines={1}>
                  {row.district}, {row.state}
                  {row.variety ? ` · ${row.variety}` : ""}
                  {row.date ? ` · ${new Date(row.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}` : ""}
                </Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.price}>{formatINR(perKg(row.modalPrice))}/kg</Text>
                <Text style={styles.range}>
                  {formatINR(perKg(row.minPrice))}–{formatINR(perKg(row.maxPrice))}
                </Text>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.empty}>No {commodity.label.toLowerCase()} prices available right now.</Text>
      )}

      {result && (
        <Text style={styles.footnote}>
          {result.source === "sample"
            ? "Sample figures for illustration, not today's market rates."
            : "Source: Agmarknet (data.gov.in). Shop prices include transport and margins."}
        </Text>
      )}
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
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  heading: {
    fontSize: 16,
    fontWeight: "bold",
    color: TEXT,
  },
  sourceTag: {
    backgroundColor: GREEN,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  sourceTagSample: {
    backgroundColor: AMBER,
  },
  sourceTagText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "white",
  },
  subtitle: {
    fontSize: 12,
    color: MUTED,
    marginTop: 4,
  },
  chips: {
    gap: 8,
    paddingVertical: 12,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: "white",
  },
  chipActive: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
    color: TEXT,
  },
  chipTextActive: {
    color: "white",
  },
  newsLink: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    padding: 10,
    borderRadius: 12,
    backgroundColor: "#EAF6EA",
    marginBottom: 8,
  },
  newsLinkText: {
    flex: 1,
    fontSize: 13,
    color: TEXT,
  },
  rows: {
    gap: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 10,
    borderRadius: 12,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: BORDER,
  },
  market: {
    fontSize: 14,
    fontWeight: "600",
    color: TEXT,
  },
  place: {
    fontSize: 12,
    color: MUTED,
    marginTop: 2,
  },
  price: {
    fontSize: 15,
    fontWeight: "bold",
    color: TEXT,
  },
  range: {
    fontSize: 11,
    color: MUTED,
    marginTop: 2,
  },
  empty: {
    fontSize: 13,
    color: MUTED,
    paddingVertical: 8,
  },
  footnote: {
    fontSize: 11,
    color: MUTED,
    marginTop: 10,
  },
});

export default MarketPrices;
