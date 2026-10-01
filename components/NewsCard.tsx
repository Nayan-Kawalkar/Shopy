import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { openBrowserAsync } from "expo-web-browser";
import Ionicons from "@expo/vector-icons/Ionicons";

import { NewsArticle } from "@/lib/news";

const NewsCard = ({ article }: { article: NewsArticle }) => (
  <TouchableOpacity
    style={styles.card}
    activeOpacity={0.85}
    // Sample headlines have no story to open.
    disabled={article.isSample}
    onPress={() => openBrowserAsync(article.url)}
    accessibilityLabel={article.isSample ? `Sample headline: ${article.title}` : `Read news: ${article.title}`}
  >
    {article.image ? (
      <Image source={{ uri: article.image }} style={styles.image} resizeMode="cover" />
    ) : (
      <View style={[styles.image, styles.imagePlaceholder]}>
        <Ionicons name="newspaper-outline" size={28} color="#9CA3AF" />
      </View>
    )}
    {article.isSample && (
      <View style={styles.sampleTag}>
        <Text style={styles.sampleTagText}>Sample</Text>
      </View>
    )}
    <View style={styles.body}>
      <Text style={styles.source} numberOfLines={1}>
        {article.source} · {new Date(article.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
      </Text>
      <Text style={styles.title} numberOfLines={3}>{article.title}</Text>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    width: 240,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#EEF0F4",
  },
  image: {
    width: "100%",
    height: 120,
  },
  imagePlaceholder: {
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  sampleTag: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#F5A623",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  sampleTagText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "white",
  },
  body: {
    padding: 12,
    gap: 4,
  },
  source: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "600",
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: "#212121",
    lineHeight: 19,
  },
});

export default NewsCard;
