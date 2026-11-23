import { useState, useEffect, useRef, useCallback } from "react";
import type { ThemeType } from "../../../../theme";
import type { DriverProfile, DeliveryStop } from "../../types";
import { getCurrentLocation, getFastLocation, getLastKnownLocation, watchLocation } from "../../../../utils/geolocation";
import {
  computeStopCoordinates,
  createModernMapPinIcon,
  getRealRoadPath
} from "../utils/deliveryMapUtils";

const GOOGLE_MAPS_LIGHT_STYLES = [
  { featureType: "poi.business", stylers: [{ visibility: "off" }] },
  { featureType: "poi.attraction", stylers: [{ visibility: "off" }] },
  { featureType: "poi.place_of_worship", elementType: "labels", stylers: [{ visibility: "on" }] },
  { featureType: "poi.school", elementType: "labels", stylers: [{ visibility: "on" }] },
  { featureType: "poi.medical", elementType: "labels", stylers: [{ visibility: "on" }] },
  { featureType: "poi.government", elementType: "labels", stylers: [{ visibility: "on" }] },
  { featureType: "poi.park", elementType: "labels", stylers: [{ visibility: "on" }] },
  { featureType: "transit", elementType: "labels", stylers: [{ visibility: "off" }] }
];

const GOOGLE_MAPS_DARK_STYLES = [
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

interface UseDeliveryMapOptions {
  driver: DriverProfile;
  sortedQueue: DeliveryStop[];
  activeStop: DeliveryStop | null;
  setSelectedStopId: (id: string | null) => void;
  isMobileView?: boolean;
  activeTab?: "orders" | "map";
  theme: ThemeType;
}

export function useDeliveryMap({
  driver,
  sortedQueue,
  activeStop,
  setSelectedStopId,
  isMobileView,
  activeTab = "orders",
  theme
}: UseDeliveryMapOptions) {
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // Driver GPS Coordinates (Initialized from live GPS or last known cached GPS, never default to Solo/Jawa)
  const [driverCoords, setDriverCoords] = useState<{ lat: number; lng: number } | null>(() => {
    const cached = getLastKnownLocation();
    if (cached) {
      return { lat: cached.latitude, lng: cached.longitude };
    }
    return null;
  });
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isLocatingGps, setIsLocatingGps] = useState<boolean>(() => !getLastKnownLocation());

  // Map references
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const driverMarkerRef = useRef<any>(null);
  const stopMarkersRef = useRef<any[]>([]);
  const routePolylineRef = useRef<any>(null);
  const routeBgPolylineRef = useRef<any>(null);

  // Active route & auto-fit bounds references
  const activeStopCoordsRef = useRef<{ lat: number; lng: number } | null>(null);
  const roadPointsRef = useRef<Array<{ lat: number; lng: number }>>([]);
  const lastFittedStopKeyRef = useRef<string | null>(null);
  const boundsIdleListenerRef = useRef<any>(null);
  const driverCoordsRef = useRef<{ lat: number; lng: number } | null>(driverCoords);
  driverCoordsRef.current = driverCoords;
  const lastRenderedQueueKeyRef = useRef<string>("");
  const prevActiveTabRef = useRef<string>(activeTab);

  // Manual / Retry GPS detection
  const retryGps = useCallback(async () => {
    setIsLocatingGps(true);
    setGpsError(null);
    try {
      if (!driverCoordsRef.current) {
        getFastLocation(2500)
          .then(pos => {
            const next = { lat: pos.latitude, lng: pos.longitude };
            setDriverCoords(next);
            driverCoordsRef.current = next;
            if (mapInstanceRef.current) mapInstanceRef.current.panTo(next);
          })
          .catch(() => {});
      }
      const pos = await getCurrentLocation();
      const next = { lat: pos.latitude, lng: pos.longitude };
      setDriverCoords(next);
      driverCoordsRef.current = next;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.panTo(next);
      }
    } catch (err: any) {
      console.warn("Manual GPS retry error:", err?.message || err);
      setGpsError(err?.message || "GPS_DISABLED");
    } finally {
      setIsLocatingGps(false);
    }
  }, []);

  // 1. Real GPS Location Detection (with 15m jitter threshold so GPS micro-drift never resets the map)
  useEffect(() => {
    const updateIfMoved = (lat: number, lng: number) => {
      setDriverCoords(prev => {
        if (!prev) return { lat, lng };
        const dLat = Math.abs(prev.lat - lat);
        const dLng = Math.abs(prev.lng - lng);
        // ~0.00015 deg is ~16 meters; ignore tiny GPS jitter while stationary
        if (dLat < 0.00015 && dLng < 0.00015) return prev;
        return { lat, lng };
      });
      setGpsError(null);
    };

    setIsLocatingGps(!driverCoordsRef.current);

    // Fast Stage 1 network lookup (~200-400ms) to center map instantly
    getFastLocation(2500)
      .then(pos => updateIfMoved(pos.latitude, pos.longitude))
      .catch(() => {});

    // Stage 2 satellite high-accuracy
    getCurrentLocation()
      .then(pos => {
        updateIfMoved(pos.latitude, pos.longitude);
        setIsLocatingGps(false);
      })
      .catch(err => {
        console.debug("Initial GPS detection:", err?.message || err);
        setIsLocatingGps(false);
        if (!driverCoordsRef.current) {
          setGpsError(err?.message || "GPS_DISABLED");
        }
      });

    const unwatch = watchLocation(
      pos => updateIfMoved(pos.latitude, pos.longitude),
      err => {
        console.debug("Watch GPS error:", err?.message || err);
        if (!driverCoordsRef.current) {
          setGpsError(err?.message || "GPS_DISABLED");
        }
      }
    );

    return () => unwatch();
  }, []);

  // 2. Helper to comfortably frame both Courier (driverCoords) and Destination in Google Maps Viewport
  const fitBoundsToRoute = useCallback(
    (targetCoords?: { lat: number; lng: number } | null, points?: Array<{ lat: number; lng: number }>) => {
      const map = mapInstanceRef.current;
      const w = window as any;
      if (!map || !w?.google?.maps) return;

      const currentDriver = driverCoordsRef.current;
      const dest = targetCoords || activeStopCoordsRef.current;
      if (!dest) {
        map.panTo(currentDriver);
        map.setZoom(15);
        return;
      }

      const bounds = new w.google.maps.LatLngBounds();
      bounds.extend(new w.google.maps.LatLng(currentDriver.lat, currentDriver.lng));
      bounds.extend(new w.google.maps.LatLng(dest.lat, dest.lng));

      if (points && points.length > 0) {
        for (let i = 0; i < points.length; i += 2) {
          bounds.extend(new w.google.maps.LatLng(points[i].lat, points[i].lng));
        }
      }

      // Responsive padding:
      // Top 45px: clean top margin
      // Bottom 175px (mobile) / 185px (desktop): ensure markers are clear of the compact bottom card & GPS button
      // Lateral 45px - 55px: pleasant margin from screen edges
      const paddingOptions = {
        top: 45,
        bottom: isMobileView ? 175 : 185,
        left: isMobileView ? 45 : 55,
        right: isMobileView ? 45 : 55
      };

      try {
        map.fitBounds(bounds, paddingOptions);
      } catch {
        try {
          map.fitBounds(bounds, Math.max(paddingOptions.top, paddingOptions.bottom, paddingOptions.left, paddingOptions.right));
        } catch {
          map.fitBounds(bounds);
        }
      }

      // Prevent extreme over-zoom if courier is already at destination
      if (boundsIdleListenerRef.current) {
        w.google.maps.event.removeListener(boundsIdleListenerRef.current);
        boundsIdleListenerRef.current = null;
      }
      boundsIdleListenerRef.current = w.google.maps.event.addListenerOnce(map, "idle", () => {
        boundsIdleListenerRef.current = null;
        if (map.getZoom() > 16) {
          map.setZoom(16);
        }
      });
    },
    [isMobileView]
  );

  // 3. Google Maps Loader & Initializer
  useEffect(() => {
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
      if (!isMounted) return;
      if (!mapContainerRef.current) {
        setTimeout(initMap, 80);
        return;
      }
      const w = window as any;
      if (!w.google?.maps?.Map) {
        setTimeout(initMap, 120);
        return;
      }

      const currentDriver = driverCoordsRef.current;
      if (!currentDriver) {
        // Wait for GPS coordinates so we NEVER center on Solo/Jawa
        setTimeout(initMap, 120);
        return;
      }

      try {
        if (!mapInstanceRef.current) {
          const map = new w.google.maps.Map(mapContainerRef.current, {
            center: currentDriver,
            zoom: 15,
            gestureHandling: "greedy",
            scrollwheel: true,
            disableDefaultUI: true,
            zoomControl: false,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            styles: theme.isDark ? GOOGLE_MAPS_DARK_STYLES : GOOGLE_MAPS_LIGHT_STYLES
          });
          mapInstanceRef.current = map;
        }

        setIsMapLoaded(true);
      } catch (e: any) {
        console.warn("Google Maps init error:", e);
        if (isMounted) setMapError("Failed to initialize map.");
      }
    };

    loadGoogleMapsScript();
    initMap();

    return () => {
      isMounted = false;
    };
  }, []);

  // Sync Google Maps styles dynamically when dark mode toggles
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setOptions({
      styles: theme.isDark ? GOOGLE_MAPS_DARK_STYLES : GOOGLE_MAPS_LIGHT_STYLES
    });
  }, [theme.isDark]);

  // 4. Update Courier Marker Position in-place (zero flicker)
  useEffect(() => {
    if (!driverCoords) return;
    const w = window as any;
    if (!mapInstanceRef.current || !w.google?.maps) return;
    const map = mapInstanceRef.current;

    const courierArrowIcon = {
      path: w.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
      scale: 6,
      fillColor: "#3B82F6",
      fillOpacity: 1,
      strokeColor: "#FFFFFF",
      strokeWeight: 2.2,
      rotation: 45
    };

    if (!driverMarkerRef.current) {
      driverMarkerRef.current = new w.google.maps.Marker({
        position: driverCoords,
        map,
        title: `${driver.name} (Courier)`,
        zIndex: 99,
        icon: courierArrowIcon
      });
    } else {
      driverMarkerRef.current.setPosition(driverCoords);
      driverMarkerRef.current.setIcon(courierArrowIcon);
    }
  }, [driverCoords, isMapLoaded, driver.name, theme.isDark]);

  // 5. Render Destination Stop Markers & Road Polylines ONLY when stop coordinates or active stop actually change
  useEffect(() => {
    if (!driverCoords) return;
    const w = window as any;
    if (!mapInstanceRef.current || !w.google?.maps) return;

    const pendingList = sortedQueue.filter(s => s.status !== "COMPLETED");

    // Compute signature of driver GPS + pending stops + active stop id + resolved coords
    const driverKey = `${driverCoords.lat.toFixed(4)},${driverCoords.lng.toFixed(4)}`;
    const queueSignature =
      `${driverKey}|${activeStop?.id || "none"}|` +
      pendingList
        .map((s, idx) => {
          const c = computeStopCoordinates(driverCoords, s, idx);
          return `${s.id}:${s.stopNumber}:${c.lat.toFixed(4)},${c.lng.toFixed(4)}`;
        })
        .join(";");

    if (lastRenderedQueueKeyRef.current === queueSignature) {
      return;
    }
    lastRenderedQueueKeyRef.current = queueSignature;

    let isMounted = true;
    const map = mapInstanceRef.current;

    // Clean up previous stop markers & polylines
    stopMarkersRef.current.forEach(m => {
      try { m.setMap(null); } catch { }
    });
    stopMarkersRef.current = [];
    if (routePolylineRef.current) {
      try { routePolylineRef.current.setMap(null); } catch { }
      routePolylineRef.current = null;
    }
    if (routeBgPolylineRef.current) {
      try { routeBgPolylineRef.current.setMap(null); } catch { }
      routeBgPolylineRef.current = null;
    }

    // Delivery Stop Markers - Only active and pending stops
    let activeStopCoords: { lat: number; lng: number } | null = null;

    sortedQueue.forEach((stop, idx) => {
      if (stop.status === "COMPLETED") return;

      const stopCoords = computeStopCoordinates(driverCoords, stop, idx);
      const isCurrentActive = activeStop?.id === stop.id;

      if (isCurrentActive) {
        activeStopCoords = stopCoords;
      }

      const stopMarker = new w.google.maps.Marker({
        position: stopCoords,
        map,
        title: `#${stop.stopNumber}: ${stop.customerName}`,
        zIndex: isCurrentActive ? 90 : 80,
        icon: createModernMapPinIcon(stop.stopNumber, isCurrentActive, w, theme.isDark)
      });

      stopMarker.addListener("click", () => {
        setSelectedStopId(stop.id);
        lastFittedStopKeyRef.current = `${driverKey}|${stop.id}:${stopCoords.lat.toFixed(4)},${stopCoords.lng.toFixed(4)}`;
        fitBoundsToRoute(stopCoords);
      });

      stopMarkersRef.current.push(stopMarker);
    });

    activeStopCoordsRef.current = activeStopCoords;

    // Track whether this specific driver GPS + stop + coordinate pair needs initial route framing
    let shouldAutoFit = false;
    if (activeStop && activeStopCoords) {
      const target = activeStopCoords as { lat: number; lng: number };
      const stopCoordKey = `${driverKey}|${activeStop.id}:${target.lat.toFixed(4)},${target.lng.toFixed(4)}`;
      if (lastFittedStopKeyRef.current !== stopCoordKey) {
        lastFittedStopKeyRef.current = stopCoordKey;
        shouldAutoFit = true;
        fitBoundsToRoute(target);
      }
    } else if (!activeStop) {
      map.panTo(driverCoords);
    }

    // Draw Route Polyline along Real Roads from Courier to Active Destination
    if (activeStop && activeStopCoords) {
      const targetCoords = activeStopCoords;

      getRealRoadPath(driverCoords, targetCoords).then(roadPoints => {
        if (!isMounted || !mapInstanceRef.current) return;
        roadPointsRef.current = roadPoints;
        const latLngs = roadPoints.map(p => new w.google.maps.LatLng(p.lat, p.lng));

        // Clean up any stale polyline before drawing
        if (routeBgPolylineRef.current) {
          try { routeBgPolylineRef.current.setMap(null); } catch {}
        }
        if (routePolylineRef.current) {
          try { routePolylineRef.current.setMap(null); } catch {}
        }

        // High-contrast solid border casing for clear visibility
        const bgPolyline = new w.google.maps.Polyline({
          path: latLngs,
          strokeColor: theme.isDark ? "#1E3A8A" : "#1D4ED8",
          strokeOpacity: 1.0,
          strokeWeight: 4.5,
          map
        });
        routeBgPolylineRef.current = bgPolyline;

        // Solid vibrant blue road ribbon (sleek & refined width)
        const fgPolyline = new w.google.maps.Polyline({
          path: latLngs,
          strokeColor: "#2563EB",
          strokeOpacity: 1.0,
          strokeWeight: 2.8,
          map
        });
        routePolylineRef.current = fgPolyline;

        // Only auto-fit bounds when the active destination or GPS initially changed (never override user zoom/pan)
        if (shouldAutoFit) {
          fitBoundsToRoute(targetCoords, roadPoints);
        }
      });
    }

    return () => {
      isMounted = false;
    };
  }, [driverCoords, sortedQueue, activeStop, isMapLoaded, fitBoundsToRoute, theme.isDark]);

  // 6. Auto-fit bounds & trigger resize ONLY when user transitions into the "map" tab
  useEffect(() => {
    const justSwitchedToMap = activeTab === "map" && prevActiveTabRef.current !== "map";
    prevActiveTabRef.current = activeTab;

    if (justSwitchedToMap && mapInstanceRef.current) {
      const w = window as any;
      if (w?.google?.maps) {
        w.google.maps.event.trigger(mapInstanceRef.current, "resize");

        const timer = setTimeout(() => {
          if (activeStopCoordsRef.current) {
            fitBoundsToRoute(activeStopCoordsRef.current, roadPointsRef.current);
          } else {
            mapInstanceRef.current.panTo(driverCoordsRef.current);
          }
        }, 80);

        return () => clearTimeout(timer);
      }
    }
  }, [activeTab, fitBoundsToRoute]);

  // Recenter map to frame courier & destination route (or courier if queue completed)
  const handleRecenterDriver = useCallback(() => {
    if (mapInstanceRef.current) {
      if (activeStopCoordsRef.current) {
        fitBoundsToRoute(activeStopCoordsRef.current, roadPointsRef.current);
      } else {
        mapInstanceRef.current.panTo(driverCoords);
        mapInstanceRef.current.setZoom(16);
      }
    }
  }, [driverCoords, fitBoundsToRoute]);

  const resetFittedStopKey = useCallback(() => {
    lastFittedStopKeyRef.current = null;
  }, []);

  return {
    mapContainerRef,
    mapInstanceRef,
    driverCoords,
    isMapLoaded,
    mapError,
    gpsError,
    isLocatingGps,
    retryGps,
    fitBoundsToRoute,
    handleRecenterDriver,
    activeStopCoordsRef,
    lastFittedStopKeyRef,
    resetFittedStopKey
  };
}
