import React, { useEffect, useMemo, useRef } from "react";
import { StyleSheet, View } from "react-native";

import type { MapPin } from "./PriceMap";

interface Props {
  pins: MapPin[];
  onOpenProduct: (productId: string) => void;
}

const OPEN_PRODUCT = "digital-farm:open-product";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Browser version: react-native-maps has no web support, so the map is a small Leaflet page
// (OpenStreetMap tiles, no key needed) in a sandboxed iframe. Pin text is inserted with
// textContent, never as HTML, and the page can only ask us to open a product by its id.
function mapPage(pins: MapPin[]) {
  // Escape "<" so data inside <script> can't close the tag.
  const data = JSON.stringify(pins).replace(/</g, "\\u003c");
  return `<!doctype html>
<html><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
  html, body, #map { height: 100%; margin: 0; font-family: system-ui, sans-serif; }
  .pin { display: inline-block; transform: translate(-50%, -50%); white-space: nowrap; padding: 3px 8px;
         border-radius: 999px; border: 2px solid #fff; color: #fff; font: 700 12px system-ui, sans-serif;
         box-shadow: 0 1px 4px rgba(0,0,0,.3); cursor: pointer; }
  .pin.mandi { background: #F5A623; } .pin.product { background: #4CAF50; }
  .popup-title { font-weight: 700; } .popup-sub { color: #555; margin-top: 2px; }
  .popup-open { margin-top: 6px; border: 0; border-radius: 999px; padding: 4px 10px; background: #4CAF50; color: #fff; cursor: pointer; }
</style>
</head><body><div id="map"></div>
<script>
  const pins = ${data};
  const map = L.map("map", { scrollWheelZoom: false });
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18, attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);

  const markers = pins.map((pin) => {
    const label = document.createElement("span");
    label.className = "pin " + pin.kind;
    label.textContent = pin.price;

    const popup = document.createElement("div");
    const title = popup.appendChild(document.createElement("div"));
    title.className = "popup-title"; title.textContent = pin.title;
    const sub = popup.appendChild(document.createElement("div"));
    sub.className = "popup-sub"; sub.textContent = pin.subtitle;
    if (pin.productId) {
      const open = popup.appendChild(document.createElement("button"));
      open.className = "popup-open"; open.textContent = "Open product";
      open.onclick = () => parent.postMessage({ type: "${OPEN_PRODUCT}", productId: pin.productId }, "*");
    }

    return L.marker([pin.latitude, pin.longitude], { icon: L.divIcon({ className: "", html: label, iconSize: null }) })
      .bindPopup(popup)
      .addTo(map);
  });

  if (markers.length === 1) map.setView(markers[0].getLatLng(), 9);
  else if (markers.length > 1) map.fitBounds(L.featureGroup(markers).getBounds().pad(0.2));
  else map.setView([21, 78.5], 4);
</script>
</body></html>`;
}

const PriceMap = ({ pins, onOpenProduct }: Props) => {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const html = useMemo(() => mapPage(pins), [pins]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.source !== frameRef.current?.contentWindow) return;
      const { type, productId } = (event.data ?? {}) as { type?: string; productId?: unknown };
      if (type === OPEN_PRODUCT && typeof productId === "string" && UUID.test(productId)) onOpenProduct(productId);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [onOpenProduct]);

  return (
    <View style={styles.frame}>
      <iframe
        ref={frameRef}
        srcDoc={html}
        title="Price map"
        sandbox="allow-scripts"
        style={{ border: 0, width: "100%", height: "100%" }}
      />
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
});

export default PriceMap;
