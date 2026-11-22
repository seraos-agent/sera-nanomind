import { Navigation } from "lucide-react";
import type { ThemeType } from "../../../../theme";
import type { DeliveryStop } from "../../types";

interface DeliveryMapOverlaysProps {
  theme: ThemeType;
  isMobileView?: boolean;
  isMapLoaded: boolean;
  gpsError: string | null;
  mapError: string | null;
  driverCoords: { lat: number; lng: number } | null;
  isLocatingGps: boolean;
  activeStop: DeliveryStop | null;
  hasAnyStops: boolean;
  onRetryGps: () => void;
  onRecenterDriver: () => void;
}

export function DeliveryMapOverlays({
  theme,
  isMobileView,
  isMapLoaded,
  gpsError,
  mapError,
  driverCoords,
  isLocatingGps,
  activeStop,
  hasAnyStops,
  onRetryGps,
  onRecenterDriver
}: DeliveryMapOverlaysProps) {
  return (
    <>
      {/* Map Error or Loading Fallback Banner */}
      {!isMapLoaded && !gpsError && driverCoords && (
        <div
          style={{
            position: "absolute",
            top: 14,
            left: 14,
            right: 14,
            zIndex: 10,
            background: theme.surface,
            border: `1px solid ${theme.border}`,
            borderRadius: 12,
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            boxShadow: "0 4px 14px rgba(0,0,0,0.08)"
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: theme.surface2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}
          >
            <Navigation size={14} color={theme.accent} />
          </div>
          <div style={{ fontSize: 12, color: theme.ink, flex: 1 }}>
            {mapError ? (
              <span style={{ color: "#EF4444" }}>
                {mapError} (Navigasi external via tombol GPS tetap aktif)
              </span>
            ) : (
              <span>Memuat Peta Navigasi Google Maps...</span>
            )}
          </div>
        </div>
      )}

      {/* GPS Disabled Prompt on Courier Map */}
      {(gpsError || !driverCoords) && !isLocatingGps && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 20,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            textAlign: "center",
            background: theme.bg
          }}
        >
          <div
            style={{
              maxWidth: 340,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12
            }}
          >
            <h3
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: theme.ink,
                margin: 0,
                fontFamily: "Inter, sans-serif"
              }}
            >
              Layanan Lokasi (GPS) Belum Aktif
            </h3>
            <p
              style={{
                fontSize: 13,
                lineHeight: 1.5,
                color: theme.inkSoft,
                margin: 0,
                fontFamily: "Inter, sans-serif"
              }}
            >
              Untuk menentukan titik lokasi dengan akurat, silakan aktifkan GPS dan berikan izin lokasi pada HP Anda.
            </p>
            <button
              type="button"
              onClick={onRetryGps}
              style={{
                marginTop: 8,
                padding: "10px 22px",
                borderRadius: 8,
                background: theme.accent,
                color: "#FFFFFF",
                border: "none",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
              }}
            >
              Aktifkan GPS / Coba Lagi
            </button>
          </div>
        </div>
      )}

      {/* Detecting GPS Loading State */}
      {isLocatingGps && !driverCoords && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 20,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: theme.bg,
            gap: 12
          }}
        >
          <div
            style={{
              width: 24,
              height: 24,
              border: `2px solid ${theme.border}`,
              borderTopColor: theme.accent,
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite"
            }}
          />
          <span
            style={{
              fontSize: 13,
              color: theme.inkSoft,
              fontWeight: 500,
              fontFamily: "Inter, sans-serif"
            }}
          >
            Mendeteksi lokasi GPS...
          </span>
        </div>
      )}

      {/* Floating GPS Recenter Button */}
      <button
        type="button"
        onClick={onRecenterDriver}
        title="Pusatkan Peta (Kurir & Titik Tujuan)"
        style={{
          position: "absolute",
          bottom: activeStop
            ? isMobileView
              ? 150
              : 158
            : hasAnyStops
              ? isMobileView
                ? 98
                : 104
              : isMobileView
                ? 14
                : 18,
          right: isMobileView ? 12 : 16,
          zIndex: 25,
          width: 40,
          height: 40,
          borderRadius: 11,
          background: theme.isDark ? "rgba(26, 29, 33, 0.94)" : "rgba(255, 255, 255, 0.94)",
          backdropFilter: "blur(10px)",
          border: `1px solid ${theme.border}`,
          color: theme.ink,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: theme.isDark ? "0 4px 14px rgba(0, 0, 0, 0.4)" : "0 4px 12px rgba(15, 23, 42, 0.12)",
          transition: "all 0.2s ease"
        }}
      >
        <svg
          width={18}
          height={18}
          viewBox="0 0 24 24"
          fill="none"
          stroke={theme.inkSoft}
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="2" y1="12" x2="5" y2="12" />
          <line x1="19" y1="12" x2="22" y2="12" />
          <line x1="12" y1="2" x2="12" y2="5" />
          <line x1="12" y1="19" x2="12" y2="22" />
          <circle cx="12" cy="12" r="7" />
          <circle cx="12" cy="12" r="2.2" fill={theme.inkSoft} />
        </svg>
      </button>
    </>
  );
}
