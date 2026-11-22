/**
 * Cross-platform Geolocation Helper for SERA.
 * Seamlessly handles Android Native runtime permissions (via @capacitor/geolocation)
 * and falls back to standard Web navigator.geolocation.
 *
 * Implements 2-stage fast location acquisition:
 * - Stage 1 (Fast Network/Fused Location, ~200-400ms): Mounts maps immediately without dummy jumps.
 * - Stage 2 (Satellite High Accuracy): Refines pinpoint accuracy in background.
 */

import { Geolocation } from '@capacitor/geolocation';
import { isNativeMobile } from './platform';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  fallbackToCoarse?: boolean;
}

export function getLastKnownLocation(): LocationCoordinates | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('sera_last_gps');
    if (raw) {
      const parsed = JSON.parse(raw);
      const lat = Number(parsed.latitude ?? parsed.lat);
      const lng = Number(parsed.longitude ?? parsed.lng);
      if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
        // Guard: Discard legacy dummy Solo coords (-7.5714 / 110.8288 / -7.5693)
        if (Math.abs(lat - (-7.5714)) < 0.005 && Math.abs(lng - 110.8288) < 0.005) {
          return null;
        }
        return { latitude: lat, longitude: lng };
      }
    }
  } catch {}
  return null;
}

async function ensureLocationPermission(): Promise<boolean> {
  if (!isNativeMobile()) return true;
  try {
    const perm = await Geolocation.checkPermissions();
    const isGranted = (p: any) =>
      p?.location === 'granted' || p?.coarseLocation === 'granted';

    if (isGranted(perm)) return true;

    const req = await Geolocation.requestPermissions();
    return isGranted(req);
  } catch (err) {
    console.warn('[Geolocation] Permission check error:', err);
    return false;
  }
}

/**
 * Stage 1: Fast network / Fused location (~200-400ms).
 * Ideal for immediate map mounting at the user's actual neighborhood.
 */
export async function getFastLocation(timeoutMs = 3500): Promise<LocationCoordinates> {
  return getCurrentLocation({
    enableHighAccuracy: false,
    timeout: timeoutMs,
    maximumAge: 120000,
    fallbackToCoarse: false,
  });
}

/**
 * Standard location acquisition with progressive fallback:
 * Attempts requested accuracy; if high-accuracy times out indoors,
 * falls back to network coarse location before rejecting.
 */
export async function getCurrentLocation(options?: GeolocationOptions): Promise<LocationCoordinates> {
  const highAccuracy = options?.enableHighAccuracy ?? true;
  const timeout = options?.timeout ?? 8000;
  const maxAge = options?.maximumAge ?? 5000;
  const fallback = options?.fallbackToCoarse ?? true;

  if (isNativeMobile()) {
    const hasPerm = await ensureLocationPermission();
    if (!hasPerm) {
      throw new Error('PERMISSION_DENIED');
    }

    try {
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: highAccuracy,
        timeout,
        maximumAge: maxAge,
      });
      const coords: LocationCoordinates = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
      };
      try {
        localStorage.setItem('sera_last_gps', JSON.stringify(coords));
      } catch {}
      return coords;
    } catch (err: any) {
      if (highAccuracy && fallback) {
        // High accuracy timed out or failed (common indoors) -> Graceful fallback to coarse network
        try {
          const coarsePos = await Geolocation.getCurrentPosition({
            enableHighAccuracy: false,
            timeout: 4000,
            maximumAge: 120000,
          });
          const coords: LocationCoordinates = {
            latitude: coarsePos.coords.latitude,
            longitude: coarsePos.coords.longitude,
            accuracy: coarsePos.coords.accuracy,
          };
          try {
            localStorage.setItem('sera_last_gps', JSON.stringify(coords));
          } catch {}
          return coords;
        } catch {}
      }
      throw err;
    }
  }

  // Web Browser fallback
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      return reject(new Error('GEOLOCATION_UNSUPPORTED'));
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: LocationCoordinates = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        };
        try {
          localStorage.setItem('sera_last_gps', JSON.stringify(coords));
        } catch {}
        resolve(coords);
      },
      (err) => {
        if (highAccuracy && fallback) {
          // Fallback to coarse on web browser
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const coords: LocationCoordinates = {
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
                accuracy: pos.coords.accuracy,
              };
              try {
                localStorage.setItem('sera_last_gps', JSON.stringify(coords));
              } catch {}
              resolve(coords);
            },
            () => reject(err),
            { enableHighAccuracy: false, timeout: 4000, maximumAge: 120000 }
          );
          return;
        }
        reject(err);
      },
      { enableHighAccuracy: highAccuracy, timeout, maximumAge: maxAge }
    );
  });
}

/**
 * 2-Stage progressive location acquisition helper:
 * - Emits onFast callback as soon as network/cached location is ready.
 * - Emits onAccurate callback when satellite GPS locks on.
 */
export async function getTwoStageLocation(
  onFast?: (coords: LocationCoordinates) => void,
  onAccurate?: (coords: LocationCoordinates) => void
): Promise<LocationCoordinates> {
  // Check cached first
  const cached = getLastKnownLocation();
  if (cached && onFast) {
    onFast(cached);
  }

  let bestCoords: LocationCoordinates | null = cached;

  // Stage 1: Fast network
  try {
    const fast = await getFastLocation(3000);
    bestCoords = fast;
    if (onFast) onFast(fast);
  } catch {
    // Ignore fast stage error, proceed to stage 2
  }

  // Stage 2: High accuracy satellite
  try {
    const accurate = await getCurrentLocation({
      enableHighAccuracy: true,
      timeout: 8000,
      maximumAge: 10000,
      fallbackToCoarse: false,
    });
    bestCoords = accurate;
    if (onAccurate) onAccurate(accurate);
    return accurate;
  } catch (err) {
    if (bestCoords) return bestCoords;
    throw err;
  }
}

export function watchLocation(
  onUpdate: (coords: LocationCoordinates) => void,
  onError?: (err: any) => void
): () => void {
  let isCancelled = false;
  let nativeWatchId: string | null = null;
  let webWatchId: number | null = null;

  if (isNativeMobile()) {
    Geolocation.checkPermissions().then((perm) => {
      if (isCancelled) return;
      const isGranted = perm.location === 'granted' || (perm as any).coarseLocation === 'granted';
      if (!isGranted) {
        return Geolocation.requestPermissions();
      }
      return perm;
    }).then((perm) => {
      const isGranted = perm?.location === 'granted' || (perm as any)?.coarseLocation === 'granted';
      if (isCancelled || !isGranted) return;
      return Geolocation.watchPosition(
        { enableHighAccuracy: true, maximumAge: 15000 },
        (position, err) => {
          if (err) {
            if (onError) onError(err);
            return;
          }
          if (position?.coords) {
            onUpdate({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
            });
          }
        }
      );
    }).then((id) => {
      if (isCancelled && id) {
        Geolocation.clearWatch({ id });
      } else if (id) {
        nativeWatchId = id;
      }
    }).catch((err) => {
      if (onError) onError(err);
    });

    return () => {
      isCancelled = true;
      if (nativeWatchId) {
        Geolocation.clearWatch({ id: nativeWatchId });
      }
    };
  }

  // Web fallback
  if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
    webWatchId = navigator.geolocation.watchPosition(
      (pos) => onUpdate({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
      }),
      (err) => onError && onError(err),
      { enableHighAccuracy: true, maximumAge: 15000 }
    );
    return () => {
      if (webWatchId !== null) navigator.geolocation.clearWatch(webWatchId);
    };
  }

  return () => {};
}
