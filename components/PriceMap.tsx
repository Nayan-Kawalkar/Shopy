import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import MapView, { Marker } from "react-native-maps";

export interface MapPin {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  subtitle: string;
  price: string; // label on the pin, e.g. "₹18/kg"
  kind: "mandi" | "product";
  productId?: string;
}

interface Props {
  pins: MapPin[];
  onOpenProduct: (productId: string) => void;
}

// Phone version (react-native-maps): Google Maps on Android, Apple Maps on iOS in Expo Go.
// Each pin is a price label; tapping it shows the details, and a product's details open its page.
// PriceMap.web.tsx is the browser version.
const PriceMap = ({ pins, onOpenProduct }: Props) => {
  const mapRef = useRef<MapView>(null);
  const [ready, setReady] = useState(false);

  // Frame all pins whenever they change.
  useEffect(() => {
    if (!ready || pins.length === 0) return;
    if (pins.length === 1) {
      mapRef.current?.animateToRegion({
        latitude: pins[0].latitude,
        longitude: pins[0].longitude,
        latitudeDelta: 1.5,
        longitudeDelta: 1.5,
      });
      return;
    }
    mapRef.current?.fitToCoordinates(
      pins.map((pin) => ({ latitude: pin.latitude, longitude: pin.longitude })),
      { edgePadding: { top: 70, right: 50, bottom: 40, left: 50 }, animated: true }
    );
  }, [ready, pins]);

  return (
    <View style={styles.frame}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        onMapReady={() => setReady(true)}
        // All of India until the pins are framed.
        initialRegion={{ latitude: 21, longitude: 78.5, latitudeDelta: 24, longitudeDelta: 24 }}
        rotateEnabled={false}
        pitchEnabled={false}
      >
        {pins.map((pin) => (
          <Marker
            key={pin.id}
            coordinate={{ latitude: pin.latitude, longitude: pin.longitude }}
            title={pin.title}
            description={pin.productId ? `${pin.subtitle} · Tap to open` : pin.subtitle}
            onCalloutPress={() => pin.productId && onOpenProduct(pin.productId)}
          >
            <View style={[styles.pin, pin.kind === "mandi" ? styles.pinMandi : styles.pinProduct]}>
              <Text style={styles.pinText}>{pin.price}</Text>
            </View>
          </Marker>
        ))}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  frame: {
    height: 320,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#EEF0F4",
  },
  pin: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "white",
  },
  pinMandi: {
    backgroundColor: "#F5A623",
  },
  pinProduct: {
    backgroundColor: "#4CAF50",
  },
  pinText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "white",
  },
});

export default PriceMap;
