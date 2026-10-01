import { StyleSheet, View } from "react-native";

import DirectionsButton from "./DirectionsButton";
import type { FarmMapProps } from "./FarmMap";

// Browser version: react-native-maps has no web support, so embed a map in an iframe.
// With EXPO_PUBLIC_GOOGLE_MAPS_API_KEY set (Maps Embed API enabled) it's Google Maps;
// without a key it falls back to OpenStreetMap's keyless embed.
const googleMapsKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

function embedUrl(latitude: number, longitude: number) {
  if (googleMapsKey) {
    const params = new URLSearchParams({ key: googleMapsKey, q: `${latitude},${longitude}`, zoom: "11" });
    return `https://www.google.com/maps/embed/v1/place?${params}`;
  }
  const d = 0.1;
  const params = new URLSearchParams({
    bbox: [longitude - d, latitude - d, longitude + d, latitude + d].join(","),
    layer: "mapnik",
    marker: `${latitude},${longitude}`,
  });
  return `https://www.openstreetmap.org/export/embed.html?${params}`;
}

const FarmMap = ({ latitude, longitude, title }: FarmMapProps) => (
  <View>
    <View style={styles.frame}>
      <iframe
        src={embedUrl(latitude, longitude)}
        title={`Map of ${title}`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        style={{ border: 0, width: "100%", height: "100%" }}
      />
    </View>
    <DirectionsButton latitude={latitude} longitude={longitude} />
  </View>
);

const styles = StyleSheet.create({
  frame: {
    height: 200,
    marginTop: 10,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#EEF0F4",
  },
});

export default FarmMap;
