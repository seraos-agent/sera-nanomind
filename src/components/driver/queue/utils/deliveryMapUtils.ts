import type { DeliveryStop } from "../../types";

export function createModernMapPinIcon(stopNumber: number, isActive: boolean, w: any, isDark: boolean = false) {
  const width = isActive ? 34 : 28;
  const height = isActive ? 48 : 40;
  const pinColor = isActive ? "#EF4444" : "#F87171";
  const badgeBg = isDark ? "#1E293B" : "#F1F5F9";
  const badgeBorder = isDark ? "#334155" : "#CBD5E1";
  const badgeText = isDark ? "#F8FAFC" : "#1E293B";

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 32 46">
    <defs>
      <filter id="badgeShadow-${stopNumber}" x="-25%" y="-25%" width="150%" height="150%">
        <feDropShadow dx="0" dy="1.5" stdDeviation="1.2" flood-color="rgba(0,0,0,0.2)"/>
      </filter>
      <filter id="pinShadow-${stopNumber}" x="-25%" y="-15%" width="150%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="1.5" flood-color="rgba(0,0,0,0.25)"/>
      </filter>
    </defs>

    <!-- 1. Floating Number-Only Badge Above Pin -->
    <rect x="5" y="2" width="22" height="17" rx="8.5" 
          fill="${badgeBg}" 
          stroke="${badgeBorder}" 
          stroke-width="1.2" 
          filter="url(#badgeShadow-${stopNumber})"/>
    <text x="16" y="14.5" 
          text-anchor="middle" 
          fill="${badgeText}" 
          font-family="system-ui, -apple-system, sans-serif" 
          font-size="11" 
          font-weight="800">
      ${stopNumber}
    </text>

    <!-- 2. Ground Landing Shadow on Road -->
    <ellipse cx="16" cy="44.5" rx="4.5" ry="1.5" fill="rgba(15,23,42,0.22)"/>

    <!-- 3. Modern Solid Red Map Pin Below Number Badge -->
    <path d="M16 20 C11.3 20 7.5 23.8 7.5 28.5 C7.5 34.5 15.3 42.4 15.6 42.8 C15.8 43 16.2 43 16.4 42.8 C16.7 42.4 24.5 34.5 24.5 28.5 C24.5 23.8 20.7 20 16 20 Z" 
          fill="${pinColor}" 
          stroke="#FFFFFF" 
          stroke-width="1.6" 
          filter="url(#pinShadow-${stopNumber})"/>

    <!-- Inner Core Dot of Modern Map Pin -->
    <circle cx="16" cy="28.5" r="2.8" fill="#FFFFFF"/>
  </svg>`;

  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new w.google.maps.Size(width, height),
    anchor: new w.google.maps.Point(width / 2, height - 3)
  };
}

export const routeCache = new Map<string, Array<{ lat: number; lng: number }>>();

export function generateSmoothCurvePoints(
  start: { lat: number; lng: number },
  end: { lat: number; lng: number },
  numPoints: number = 24,
  curveFactor: number = 0.08
): Array<{ lat: number; lng: number }> {
  const points: Array<{ lat: number; lng: number }> = [];
  const dx = end.lng - start.lng;
  const dy = end.lat - start.lat;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist === 0) return [start, end];

  const midLat = (start.lat + end.lat) / 2;
  const midLng = (start.lng + end.lng) / 2;
  const normalLat = -dx * curveFactor;
  const normalLng = dy * curveFactor;
  const ctrlLat = midLat + normalLat;
  const ctrlLng = midLng + normalLng;

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const invT = 1 - t;
    const lat = invT * invT * start.lat + 2 * invT * t * ctrlLat + t * t * end.lat;
    const lng = invT * invT * start.lng + 2 * invT * t * ctrlLng + t * t * end.lng;
    points.push({ lat, lng });
  }
  return points;
}

let isGoogleDirectionsDenied = false;

export async function getRealRoadPath(
  start: { lat: number; lng: number },
  end: { lat: number; lng: number }
): Promise<Array<{ lat: number; lng: number }>> {
  const cacheKey = `${start.lat.toFixed(4)},${start.lng.toFixed(4)}->${end.lat.toFixed(4)},${end.lng.toFixed(4)}`;
  if (routeCache.has(cacheKey)) {
    return routeCache.get(cacheKey)!;
  }

  const w = typeof window !== "undefined" ? (window as any) : null;

  // 1. Prioritize Google Maps DirectionsService (official, high-accuracy turn-by-turn road geometry)
  if (!isGoogleDirectionsDenied && w?.google?.maps?.DirectionsService) {
    try {
      const directionsService = new w.google.maps.DirectionsService();
      const result: any = await new Promise((resolve, reject) => {
        directionsService.route(
          {
            origin: new w.google.maps.LatLng(start.lat, start.lng),
            destination: new w.google.maps.LatLng(end.lat, end.lng),
            travelMode: w.google.maps.TravelMode.DRIVING
          },
          (res: any, status: any) => {
            if (status === w.google.maps.DirectionsStatus.OK) {
              resolve(res);
            } else {
              if (status === "REQUEST_DENIED") {
                isGoogleDirectionsDenied = true;
              }
              reject(new Error(status));
            }
          }
        );
      });

      if (result?.routes?.[0]?.overview_path?.length) {
        const roadPoints = result.routes[0].overview_path.map((p: any) => ({
          lat: typeof p.lat === "function" ? p.lat() : p.lat,
          lng: typeof p.lng === "function" ? p.lng() : p.lng
        }));
        const roadPath = [start, ...roadPoints, end];
        routeCache.set(cacheKey, roadPath);
        return roadPath;
      }
    } catch {
      // Continue to OSRM fallback
    }
  }

  // 2. Secondary fallback: OSRM (Open Source Routing Machine) with 3s timeout
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;
    const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    const timeoutId = controller ? setTimeout(() => controller.abort(), 3500) : null;
    const res = await fetch(url, { signal: controller?.signal });
    if (timeoutId) clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.routes && data.routes[0]?.geometry?.coordinates?.length) {
        const roadPoints = data.routes[0].geometry.coordinates.map(
          ([lng, lat]: [number, number]) => ({ lat, lng })
        );
        const roadPath = [start, ...roadPoints, end];
        routeCache.set(cacheKey, roadPath);
        return roadPath;
      }
    }
  } catch {
    // Continue to Bézier fallback
  }

  // 3. Final Fallback: smooth Bézier curve if offline or API unavailable
  const curve = generateSmoothCurvePoints(start, end, 28, 0.08);
  routeCache.set(cacheKey, curve);
  return curve;
}

export const geocodeCache = new Map<string, { lat: number; lng: number }>();

/**
 * Calculate real Haversine straight-line distance multiplied by road factor (~1.3x)
 */
export function calculateRoadDistanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h =
    sinDLat * sinDLat +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      sinDLng *
      sinDLng;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  const straightKm = R * c;
  // Road winding factor ~1.28x, minimum 0.2 km
  return Math.max(0.2, Number((straightKm * 1.28).toFixed(1)));
}

/**
 * Clean address string from annotations like "(Radius 2 km)" or generic placeholders before geocoding
 */
export function isRealCustomerAddress(address?: string): boolean {
  if (!address) return false;
  const clean = address.trim();
  if (!clean || clean === "-" || clean.length < 4) return false;
  const lower = clean.toLowerCase();
  if (
    lower === "alamat pengantaran toko" ||
    lower === "store delivery address" ||
    lower === "alamat pembeli" ||
    lower === "buyer address" ||
    lower === "in-store pickup" ||
    lower === "pick up at store" ||
    lower === "ambil di toko" ||
    lower === "ambil ke toko" ||
    lower === "ambil sendiri di toko"
  ) {
    return false;
  }
  return true;
}

/**
 * Geocode a customer's text address into real-world { lat, lng } coordinates,
 * biased around the courier's actual GPS location (driverCoords) so local street names resolve near the courier.
 */
export async function geocodeCustomerAddress(
  rawAddress: string,
  driverLoc?: { lat: number; lng: number }
): Promise<{ lat: number; lng: number } | null> {
  if (!isRealCustomerAddress(rawAddress)) return null;

  // Strip parenthetical notes like "(Dekat Masjid...)" or "(Radius 2 km)" for cleaner geocoding
  const stripped = rawAddress.replace(/\([^)]*\)/g, "").trim();
  const fullQuery = stripped.length >= 4 ? stripped : rawAddress.trim();
  const locKey = driverLoc ? `${driverLoc.lat.toFixed(2)},${driverLoc.lng.toFixed(2)}` : "id";
  const cacheKey = `${fullQuery.toLowerCase()}@${locKey}`;

  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey)!;
  }

  // Also check localStorage cache so coordinates persist across reloads instantaneously
  try {
    const savedGeo = localStorage.getItem(`sera_geo_${cacheKey}`);
    if (savedGeo) {
      const parsed = JSON.parse(savedGeo);
      if (typeof parsed?.lat === "number" && typeof parsed?.lng === "number") {
        geocodeCache.set(cacheKey, parsed);
        return parsed;
      }
    }
  } catch {}

  const saveToCache = (coords: { lat: number; lng: number }) => {
    geocodeCache.set(cacheKey, coords);
    try {
      localStorage.setItem(`sera_geo_${cacheKey}`, JSON.stringify(coords));
    } catch {}
  };

  // 1. Try Google Maps Geocoder biased to ~15km bounds around courier GPS
  const w = typeof window !== "undefined" ? (window as any) : null;
  if (w?.google?.maps?.Geocoder) {
    try {
      const geocoder = new w.google.maps.Geocoder();
      const request: any = { address: fullQuery, region: "ID" };
      if (driverLoc && w.google.maps.LatLngBounds) {
        const delta = 0.12; // ~13km bounding box bias around courier GPS
        request.bounds = new w.google.maps.LatLngBounds(
          new w.google.maps.LatLng(driverLoc.lat - delta, driverLoc.lng - delta),
          new w.google.maps.LatLng(driverLoc.lat + delta, driverLoc.lng + delta)
        );
      }

      const coords = await new Promise<{ lat: number; lng: number } | null>(resolve => {
        geocoder.geocode(request, (results: any[], status: any) => {
          if (status === "OK" && results?.[0]?.geometry?.location) {
            const loc = results[0].geometry.location;
            const lat = typeof loc.lat === "function" ? loc.lat() : loc.lat;
            const lng = typeof loc.lng === "function" ? loc.lng() : loc.lng;
            resolve({ lat, lng });
          } else {
            resolve(null);
          }
        });
      });
      if (coords) {
        saveToCache(coords);
        return coords;
      }
    } catch {}
  }

  // 2. Fallback: OpenStreetMap Nominatim Search API biased around courier GPS viewbox
  try {
    let viewboxParam = "";
    if (driverLoc) {
      const d = 0.15;
      viewboxParam = `&viewbox=${driverLoc.lng - d},${driverLoc.lat + d},${driverLoc.lng + d},${driverLoc.lat - d}`;
    }
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=id${viewboxParam}&q=${encodeURIComponent(
      fullQuery
    )}`;
    const res = await fetch(url, {
      headers: { "Accept-Language": "id,en" }
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data[0]?.lat && data[0]?.lon) {
        const coords = {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        };
        if (!isNaN(coords.lat) && !isNaN(coords.lng)) {
          saveToCache(coords);
          return coords;
        }
      }
    }
  } catch {}

  return null;
}

export function computeStopCoordinates(driverLoc: { lat: number; lng: number }, stop: DeliveryStop, index: number) {
  if (
    stop.destCoords &&
    typeof stop.destCoords.lat === "number" &&
    typeof stop.destCoords.lng === "number"
  ) {
    return stop.destCoords;
  }

  // Generate a STABLE deterministic angle based on stop.id / stop.orderId so the pin NEVER jumps when other orders complete
  const seedString = `${stop.id || ""}_${stop.orderId || ""}`;
  let hash = 0;
  for (let i = 0; i < seedString.length; i++) {
    hash = (hash * 31 + seedString.charCodeAt(i)) & 0xffffffff;
  }
  const stableFactor = (Math.abs(hash % 1000) / 1000) || ((index * 0.25) % 1);
  const angle = (stableFactor * Math.PI * 2) + 0.35;
  const degDist = Math.max(0.008, (stop.distanceKm || 1.5) * 0.007);
  return {
    lat: driverLoc.lat + (Math.sin(angle) * degDist),
    lng: driverLoc.lng + (Math.cos(angle) * degDist)
  };
}
