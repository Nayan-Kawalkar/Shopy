import React from "react";
import { FlatList, Image, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useBottomTabBarHeight } from "expo-router/tabs";

import images from "@/constants/images";
import MarketPrices from "@/components/MarketPrices";
import NewsCard from "@/components/NewsCard";
import PriceMapSection from "@/components/PriceMapSection";
import { getFarmNews } from "@/lib/news";
import { useCropPrices } from "@/lib/use-crop-prices";
import { useSupabase } from "@/lib/useSupabase";

// Articles tab: latest farm news, today's mandi prices (crops in the news first) and a price map.
const ArticlesFeed = () => {
  const tabBarHeight = useBottomTabBarHeight();

  // Latest Indian farming headlines (NewsAPI, then GDELT, then saved or sample headlines).
  const { data: news } = useSupabase({ fn: getFarmNews });
  // The selected crop and its prices, shared by the price list and the map.
  const prices = useCropPrices(news);
  const onlySamples = !!news?.length && news.every((article) => article.isSample);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: tabBarHeight + 24 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerTop}>
        <Text style={styles.headerTitle}>Farm News & Prices</Text>
        <Image source={images.logo} style={styles.logo} accessibilityLabel="Digital Farm logo" />
      </View>

      {news && news.length > 0 && (
        <View>
          <Text style={styles.sectionHeading}>{onlySamples ? "Sample headlines" : "Latest farm news"}</Text>
          {onlySamples && (
            <Text style={styles.sampleNote}>Live news is unavailable right now, so these are examples.</Text>
          )}
          <FlatList
            horizontal
            data={news}
            keyExtractor={(article, index) => article.url || `sample-${index}`}
            renderItem={({ item }) => <NewsCard article={item} />}
            ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
            showsHorizontalScrollIndicator={false}
          />
        </View>
      )}

      <MarketPrices prices={prices} />
      <PriceMapSection prices={prices} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  content: {
    paddingTop: Platform.OS === "ios" ? 50 : 40,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#212121",
  },
  logo: {
    width: 40,
    height: 40,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#212121",
    marginTop: 20,
    marginBottom: 10,
  },
  sampleNote: {
    fontSize: 12,
    color: "#757575",
    marginTop: -6,
    marginBottom: 10,
  },
});

export default ArticlesFeed;
