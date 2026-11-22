export const GOOGLE_MAPS_LIGHT_STYLES = [
  { featureType: "poi.business", stylers: [{ visibility: "off" }] },
  { featureType: "poi.attraction", stylers: [{ visibility: "off" }] },
  { featureType: "poi.place_of_worship", elementType: "labels", stylers: [{ visibility: "on" }] },
  { featureType: "poi.school", elementType: "labels", stylers: [{ visibility: "on" }] },
  { featureType: "poi.medical", elementType: "labels", stylers: [{ visibility: "on" }] },
  { featureType: "poi.government", elementType: "labels", stylers: [{ visibility: "on" }] },
  { featureType: "poi.park", elementType: "labels", stylers: [{ visibility: "on" }] },
  { featureType: "transit", elementType: "labels", stylers: [{ visibility: "off" }] }
];

export const GOOGLE_MAPS_DARK_STYLES = [
  { elementType: "geometry", stylers: [{ color: "#1e2430" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1e2430" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#cbd5e1" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
  { featureType: "poi", elementType: "labels.text.stroke", stylers: [{ color: "#1e2430" }] },
  { featureType: "poi", elementType: "labels.icon", stylers: [{ saturation: -30 }, { lightness: -15 }] },
  { featureType: "poi.business", stylers: [{ visibility: "off" }] },
  { featureType: "poi.attraction", stylers: [{ visibility: "off" }] },
  { featureType: "poi.place_of_worship", elementType: "labels", stylers: [{ visibility: "on" }] },
  { featureType: "poi.school", elementType: "labels", stylers: [{ visibility: "on" }] },
  { featureType: "poi.medical", elementType: "labels", stylers: [{ visibility: "on" }] },
  { featureType: "poi.government", elementType: "labels", stylers: [{ visibility: "on" }] },
  { featureType: "poi.park", elementType: "labels", stylers: [{ visibility: "on" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#2d3748" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#1a202c" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#3b4a6b" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1a202c" }] },
  { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#e2e8f0" }] },
  { featureType: "transit", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0f172a" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#64748b" }] }
];

export interface StoreLocationResult {
  lat: number;
  lng: number;
  city?: string;
  district?: string;
  village?: string;
  fullAddress?: string;
}
