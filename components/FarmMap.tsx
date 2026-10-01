import { StyleSheet, View } from "react-native";
import MapView, { Marker } from "react-native-maps";

import DirectionsButton from "./DirectionsButton";

export interface FarmMapProps {
  latitude: number;
  longitude: number;
  title: string;
  address?: string | null;
}

// Phone version (react-native-maps): Google Maps on Android, Apple Maps on iOS. Works in Expo Go
// without our own key; standalone builds need the Maps SDK key (see the react-native-maps plugin).
// FarmMap.web.tsx is the browser version.
const FarmMap = ({ latitude, longitude, title, address }: FarmMapProps) => (
  <View>
    <View style={styles.frame}>
      <MapView
        style={StyleSheet.absoluteFill}
        initialRegion={{ latitude, longitude, latitudeDelta: 0.2, longitudeDelta: 0.2 }}
        // Let the page scroll past the map; pinch still zooms.
        scrollEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
      >
        <Marker coordinate={{ latitude, longitude }} title={title} description={address ?? undefined} />
      </MapView>
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
