import { useState, useEffect, useRef, useCallback } from "react";
import { MapPin, Check } from "lucide-react";
import type { ThemeType } from "../../../../theme";
import { getCurrentLocation, getFastLocation, getLastKnownLocation } from "../../../../utils/geolocation";
import { registerBackHandler } from "../../../../utils/backButton";
import { formatStorePinLocation } from "../../../marketplace/utils/formatters";
import {
  GOOGLE_MAPS_LIGHT_STYLES,
  GOOGLE_MAPS_DARK_STYLES,
  type StoreLocationResult
} from "./locationPicker/locationPickerStyles";
import { LocationPickerPinOverlay } from "./locationPicker/LocationPickerPinOverlay";

export type { StoreLocationResult };

interface StoreLocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  initialLat?: number;
  initialLng?: number;
  initialAddress?: string;
  storeName?: string;
  onConfirmLocation: (result: StoreLocationResult) => void;
  theme: ThemeType;
  isMobileView?: boolean;
}

export function StoreLocationPickerModal({
  isOpen,
  onClose,
  title,
  initialLat,
  initialLng,
  initialAddress,
  storeName = "",
  onConfirmLocation,
  theme,
  isMobileView
}: StoreLocationPickerModalProps) {
  // Helper to distinguish real custom coordinates from dummy sample Solo coordinates (-7.5714, 110.8288)
  const isDummySolo = (lat?: number, lng?: number) => {
    if (lat === undefined || lng === undefined) return true;
    return Math.abs(lat - (-7.5714)) < 0.005 && Math.abs(lng - 110.8288) < 0.005;
  };

  const hasCustomInitial = !isDummySolo(initialLat, initialLng);
  const cachedGps = getLastKnownLocation();

  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(() => {
    if (hasCustomInitial) {
      return { lat: initialLat!, lng: initialLng! };
    }
    if (cachedGps) {
      return { lat: cachedGps.latitude, lng: cachedGps.longitude };
    }
    return null;
  });

  const [gpsStatus, setGpsStatus] = useState<"idle" | "detecting" | "ready" | "disabled">(() => {
    if (hasCustomInitial || cachedGps) return "ready";
    return "detecting";
  });

  const [addressHint, setAddressHint] = useState<string>("");
  const [cityHint, setCityHint] = useState<string>("");
  const [districtHint, setDistrictHint] = useState<string>("");
  const [villageHint, setVillageHint] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLocatingGps, setIsLocatingGps] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);
  const geocodeTimerRef = useRef<any>(null);
  const coordsRef = useRef<{ lat: number; lng: number } | null>(coords);
  coordsRef.current = coords;

  // Helper to parse address components from Google Geocoder
  const parseAddressComponents = useCallback((bestResult: any) => {
    if (!bestResult) return;

    // Clean formatted address (strip trailing ", Indonesia")
    const rawAddress = bestResult.formatted_address || "";
    const cleanedAddress = rawAddress.replace(/,\s*Indonesia$/i, "");
    setAddressHint(cleanedAddress);

    // Extract City / Regency (level_2), Subdistrict / Kecamatan (level_3), and Village / Desa (level_4)
    let detectedCity = "";
    let detectedDistrict = "";
    let detectedVillage = "";
    if (bestResult.address_components) {
      for (const comp of bestResult.address_components) {
        const types: string[] = comp.types || [];
        if (types.includes("administrative_area_level_2")) {
          detectedCity = comp.long_name.replace(/^(Kota|Kabupaten|Kab\.?)\s+/i, "").trim();
        } else if (types.includes("locality") && !detectedCity) {
          detectedCity = comp.long_name.trim();
        }
        if (types.includes("administrative_area_level_3")) {
          detectedDistrict = comp.long_name.replace(/^(Kecamatan|Kec\.?)\s+/i, "").trim();
        } else if (types.includes("sublocality_level_1") && !detectedDistrict) {
          detectedDistrict = comp.long_name.replace(/^(Kecamatan|Kec\.?)\s+/i, "").trim();
        }
        if (types.includes("administrative_area_level_4")) {
          detectedVillage = comp.long_name.replace(/^(Kelurahan|Kel\.?|Desa)\s+/i, "").trim();
        } else if (
          (types.includes("sublocality_level_2") || types.includes("neighborhood")) &&
          !detectedVillage
        ) {
          detectedVillage = comp.long_name.replace(/^(Kelurahan|Kel\.?|Desa)\s+/i, "").trim();
        }
      }
    }
    setCityHint(detectedCity);
    setDistrictHint(detectedDistrict);
    setVillageHint(detectedVillage);
  }, []);

  // Reverse Geocoding Helper (Debounced to keep performance silky smooth)
  const reverseGeocode = useCallback((lat: number, lng: number) => {
    const w = window as any;
    if (!w?.google?.maps) return;

    if (geocodeTimerRef.current) {
      clearTimeout(geocodeTimerRef.current);
    }

    geocodeTimerRef.current = setTimeout(() => {
      if (!geocoderRef.current) {
        geocoderRef.current = new w.google.maps.Geocoder();
      }

      geocoderRef.current.geocode(
        { location: { lat, lng } },
        (results: any[], status: any) => {
          if (status === "OK" && results?.[0]) {
            parseAddressComponents(results[0]);
          }
        }
      );
    }, 250);
  }, [parseAddressComponents]);

  // Update map center position and pan map
  const updatePinPosition = useCallback((newLat: number, newLng: number, pan: boolean = true) => {
    setCoords({ lat: newLat, lng: newLng });
    coordsRef.current = { lat: newLat, lng: newLng };
    if (pan && mapInstanceRef.current) {
      mapInstanceRef.current.panTo({ lat: newLat, lng: newLng });
    }
    reverseGeocode(newLat, newLng);
  }, [reverseGeocode]);

  const userHasDraggedRef = useRef(false);

  // GPS Location Detection with 2-Stage progressive acquisition:
  // Stage 1: Fast network/fused location (~200-400ms) mounts map at real user area.
  // Stage 2: Satellite high-accuracy refinement in background without blocking UI.
  const handleDetectCurrentLocation = useCallback(async () => {
    setIsLocatingGps(true);
    userHasDraggedRef.current = false;
    setGpsStatus(coordsRef.current ? "ready" : "detecting");

    let fastAcquired = false;

    // Stage 1: Fast network / Fused location
    try {
      const fast = await getFastLocation(3000);
      fastAcquired = true;
      updatePinPosition(fast.latitude, fast.longitude, true);
      setGpsStatus("ready");
    } catch {
      // Coarse network skipped or timed out, will proceed to Stage 2
    }

    // Stage 2: Satellite high-accuracy refinement in background
    try {
      const accurate = await getCurrentLocation({
        enableHighAccuracy: true,
        timeout: 8000,
        fallbackToCoarse: !fastAcquired
      });
      if (!userHasDraggedRef.current) {
        updatePinPosition(accurate.latitude, accurate.longitude, true);
      }
      setGpsStatus("ready");
    } catch (err: any) {
      console.warn("Auto-location notice:", err?.message || err);
      if (!coordsRef.current) {
        // Safe fallback so map canvas initializes cleanly and user can drag/search: Jakarta
        const fallback = { lat: -6.2088, lng: 106.8456 };
        updatePinPosition(fallback.lat, fallback.lng, true);
        setGpsStatus("disabled");
      }
    } finally {
      setIsLocatingGps(false);
    }
  }, [updatePinPosition]);

  // Register sequential back handler for StoreLocationPickerModal
  useEffect(() => {
    if (!isOpen) return;
    return registerBackHandler("store_location_picker_modal", 90, () => {
      onClose();
      return true;
    });
  }, [isOpen, onClose]);

  // Sync coordinates & automatically detect live location without defaulting to Solo/Jawa
  useEffect(() => {
    if (!isOpen) return;

    setAddressHint(initialAddress || "");
    setCityHint("");
    setSearchQuery("");
    setMapError(null);

    if (hasCustomInitial) {
      setCoords({ lat: initialLat!, lng: initialLng! });
      setGpsStatus("ready");
    } else if (cachedGps) {
      setCoords({ lat: cachedGps.latitude, lng: cachedGps.longitude });
      setGpsStatus("ready");
      getCurrentLocation({ enableHighAccuracy: true, timeout: 8000, fallbackToCoarse: false })
        .then((pos) => {
          if (!userHasDraggedRef.current) {
            updatePinPosition(pos.latitude, pos.longitude, true);
          }
        })
        .catch(() => {});
    } else {
      setCoords(null);
      handleDetectCurrentLocation();
    }
  }, [isOpen, initialLat, initialLng, hasCustomInitial, handleDetectCurrentLocation, updatePinPosition]);

  // Load Google Maps Script & Initialize Map
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const apiKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || "";

    const loadGoogleMapsScript = () => {
      const scriptId = "google-maps-api-script";
      let script = document.getElementById(scriptId) as HTMLScriptElement | null;
      if (!script) {
        (window as any).__seraGoogleMapsReady = (window as any).__seraGoogleMapsReady || (() => {});
        script = document.createElement("script");
        script.id = scriptId;
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&loading=async&callback=__seraGoogleMapsReady`;
        script.async = true;
        script.defer = true;
        script.onerror = () => {
          if (isMounted) setMapError("Google Maps could not be loaded.");
        };
        document.head.appendChild(script);
      }
    };

    const initMap = () => {
      if (!isMounted || !mapContainerRef.current) return;
      const currentPos = coordsRef.current;
      if (!currentPos) {
        // Wait for GPS coordinates so we NEVER initialize at Solo/Jawa
        setTimeout(initMap, 100);
        return;
      }
      const w = window as any;
      if (!w.google?.maps?.Map) {
        setTimeout(initMap, 100);
        return;
      }

      try {
        if (!mapInstanceRef.current) {
          const map = new w.google.maps.Map(mapContainerRef.current, {
            center: currentPos,
            zoom: 16,
            gestureHandling: "greedy",
            disableDefaultUI: true,
            zoomControl: false,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            styles: theme?.isDark ? GOOGLE_MAPS_DARK_STYLES : GOOGLE_MAPS_LIGHT_STYLES
          });
          mapInstanceRef.current = map;

          map.addListener("dragstart", () => {
            userHasDraggedRef.current = true;
          });

          // Center Fixed Pin pattern:
          // The pin is mounted statically at the exact center of the map viewport.
          // As the user pans/drags the map, idle event reads map.getCenter() for pixel-perfect coordinates.
          map.addListener("idle", () => {
            const center = map.getCenter();
            if (center) {
              const lat = typeof center.lat === "function" ? center.lat() : center.lat;
              const lng = typeof center.lng === "function" ? center.lng() : center.lng;
              setCoords({ lat, lng });
              coordsRef.current = { lat, lng };
              reverseGeocode(lat, lng);
            }
          });
        } else {
          mapInstanceRef.current.panTo(currentPos);
        }

        // Initial geocode lookup
        reverseGeocode(currentPos.lat, currentPos.lng);
      } catch (err: any) {
        setMapError(err?.message || "Failed to initialize map.");
      }
    };

    loadGoogleMapsScript();
    initMap();

    return () => {
      isMounted = false;
      mapInstanceRef.current = null;
      geocoderRef.current = null;
      if (geocodeTimerRef.current) {
        clearTimeout(geocodeTimerRef.current);
      }
    };
  }, [isOpen, parseAddressComponents, reverseGeocode]);

  // Dynamically sync Google Maps styles when theme toggles
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setOptions({
      styles: theme?.isDark ? GOOGLE_MAPS_DARK_STYLES : GOOGLE_MAPS_LIGHT_STYLES
    });
  }, [theme?.isDark]);

  // Search Address / Landmark Handler
  const handleSearchLocation = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    const w = window as any;
    if (!w?.google?.maps) return;

    if (!geocoderRef.current) {
      geocoderRef.current = new w.google.maps.Geocoder();
    }

    setIsSearching(true);
    geocoderRef.current.geocode(
      { address: searchQuery.trim() },
      (results: any[], status: any) => {
        setIsSearching(false);
        if (status === "OK" && results?.[0]?.geometry?.location) {
          const loc = results[0].geometry.location;
          const lat = typeof loc.lat === "function" ? loc.lat() : loc.lat;
          const lng = typeof loc.lng === "function" ? loc.lng() : loc.lng;
          updatePinPosition(lat, lng, true);
          parseAddressComponents(results[0]);
        } else {
          alert("Location not found. Try entering a more specific street name, neighborhood, or city.");
        }
      }
    );
  };

  const handleConfirm = () => {
    if (!coords) return;
    onConfirmLocation({
      lat: coords.lat,
      lng: coords.lng,
      city: cityHint || undefined,
      district: districtHint || undefined,
      village: villageHint || undefined,
      fullAddress: addressHint || undefined
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: isMobileView ? 0 : 16,
        animation: "fadeIn 0.18s ease"
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: isMobileView ? 0 : 16,
          width: isMobileView ? "100%" : "90%",
          maxWidth: 720,
          height: isMobileView ? "100%" : "80vh",
          maxHeight: isMobileView ? "100%" : 680,
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 24px 60px rgba(0, 0, 0, 0.3)",
          overflow: "hidden",
          position: "relative"
        }}
      >
        {/* 1. MINIMAL HEADER */}
        <div
          style={{
            padding: "13px 18px",
            borderBottom: `1px solid ${theme.border}`,
            display: "flex",
            alignItems: "center",
            background: theme.surface,
            zIndex: 10
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <MapPin size={18} color="#EF4444" />
            <span style={{ fontSize: 14, fontWeight: 700, color: theme.ink }}>
              {title || (storeName ? `${storeName} Location Pin` : "Choose Location Pin")}
            </span>
          </div>
        </div>

        {/* 2. MAP CANVAS WITH FLOATING SEARCH BAR & STATIONARY CENTER PIN */}
        <div style={{ flex: 1, position: "relative", minHeight: 320, overflow: "hidden" }}>
          <div
            ref={mapContainerRef}
            style={{ width: "100%", height: "100%", background: theme.surface2 }}
          />

          <LocationPickerPinOverlay
            theme={theme}
            gpsStatus={gpsStatus}
            isLocatingGps={isLocatingGps}
            coords={coords}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            isSearching={isSearching}
            mapError={mapError}
            onDetectCurrentLocation={handleDetectCurrentLocation}
            onSearchLocation={handleSearchLocation}
            onRecenter={() => {
              userHasDraggedRef.current = false;
              handleDetectCurrentLocation();
            }}
          />
        </div>

        {/* 3. CLEAN COMPACT FOOTER */}
        <div
          style={{
            padding: isMobileView ? "12px 16px" : "14px 20px",
            borderTop: `1px solid ${theme.border}`,
            background: theme.surface,
            display: "flex",
            flexDirection: isMobileView ? "column" : "row",
            alignItems: isMobileView ? "stretch" : "center",
            justifyContent: "space-between",
            gap: isMobileView ? 12 : 16,
            zIndex: 10
          }}
        >
          {/* Address text info */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 3,
              maxWidth: isMobileView ? "100%" : "55%",
              minWidth: 0
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: theme.ink }}>
                {formatStorePinLocation({
                  city: cityHint,
                  district: districtHint,
                  village: villageHint,
                  address: addressHint,
                  fallback: cityHint || "Selected Location"
                })}
              </span>
              {coords && (
                <span style={{ fontSize: 11, color: theme.inkFaint, fontFamily: "monospace" }}>
                  ({coords.lat.toFixed(5)}, {coords.lng.toFixed(5)})
                </span>
              )}
            </div>
            <div
              style={{
                fontSize: 12,
                color: theme.inkSoft,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis"
              }}
            >
              {addressHint || (coords ? "Resolving address from map pin..." : "Finding location...")}
            </div>
          </div>

          {/* Action buttons */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              width: isMobileView ? "100%" : "auto",
              marginLeft: isMobileView ? 0 : "auto"
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: isMobileView ? 1 : "initial",
                padding: "8px 18px",
                borderRadius: 8,
                border: `1px solid ${theme.border}`,
                background: theme.surface2,
                color: theme.ink,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                textAlign: "center",
                minWidth: isMobileView ? "auto" : 96,
                transition: "all 0.15s ease"
              }}
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={!coords}
              onClick={handleConfirm}
              style={{
                flex: isMobileView ? 2 : "initial",
                padding: "8px 20px",
                borderRadius: 8,
                border: "none",
                background: coords ? theme.accent : theme.border,
                color: "#FFFFFF",
                fontSize: 13,
                fontWeight: 600,
                cursor: coords ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                boxShadow: coords ? "0 2px 6px rgba(0,0,0,0.12)" : "none",
                minWidth: isMobileView ? "auto" : 144,
                opacity: coords ? 1 : 0.6,
                transition: "all 0.15s ease"
              }}
            >
              <Check size={15} />
              <span>Save Location</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
