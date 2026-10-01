import { Linking, StyleSheet, Text, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

interface Props {
  latitude: number;
  longitude: number;
}

// Opens Google Maps directions (the app if installed, otherwise the website); no API key needed.
const DirectionsButton = ({ latitude, longitude }: Props) => (
  <TouchableOpacity
    style={styles.button}
    onPress={() =>
      Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`)
    }
    accessibilityLabel="Get directions in Google Maps"
  >
    <Ionicons name="navigate" size={16} color="white" />
    <Text style={styles.text}>Get directions</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: "#4CAF50",
  },
  text: {
    fontFamily: "Rubik-Medium",
    fontSize: 14,
    color: "white",
  },
});

export default DirectionsButton;
