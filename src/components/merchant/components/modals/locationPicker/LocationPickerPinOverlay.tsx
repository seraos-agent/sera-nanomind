import React from "react";
import { Search, AlertCircle, RefreshCw } from "lucide-react";
import type { ThemeType } from "../../../../../theme";

interface LocationPickerPinOverlayProps {
  theme: ThemeType;
  gpsStatus: "idle" | "detecting" | "ready" | "disabled";
  isLocatingGps: boolean;
  coords: { lat: number; lng: number } | null;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isSearching: boolean;
  mapError: string | null;
  onDetectCurrentLocation: () => void;
  onSearchLocation: (e?: React.FormEvent) => void;
  onRecenter: () => void;
}

export function LocationPickerPinOverlay({
  theme,
  gpsStatus,
  isLocatingGps,
  coords,
  searchQuery,
  setSearchQuery,
  isSearching,
  mapError,
  onDetectCurrentLocation,
  onSearchLocation,
  onRecenter
}: LocationPickerPinOverlayProps) {
  return (
    <>
      {/* Non-blocking GPS Disabled Floating Notice (Allows dragging & searching) */}
      {gpsStatus === "disabled" && (
        <div
          style={{
            position: "absolute",
            top: 58,
            left: 12,
            right: 12,
            maxWidth: 440,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            padding: "8px 12px",
            borderRadius: 8,
            background: theme.surface,
            border: `1px solid ${theme.border}`,
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.12)",
            zIndex: 20
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 1, minWidth: 0, flex: 1 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: theme.ink }}>
              GPS Not Active Yet
            </span>
            <span style={{ fontSize: 11, color: theme.inkSoft, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              Drag the map or search an address to set the pin.
            </span>
          </div>
          <button
            type="button"
            onClick={onDetectCurrentLocation}
            style={{
              padding: "5px 10px",
              borderRadius: 6,
              background: theme.accent,
              color: "#FFFFFF",
              border: "none",
              fontSize: 11,
              fontWeight: 600,
              cursor: "pointer",
              flexShrink: 0
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Clean Detecting GPS Loading State */}
      {isLocatingGps && !coords && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: theme.surface,
            zIndex: 25,
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
            Finding location...
          </span>
        </div>
      )}

      {/* Stationary Center Pin */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -100%)",
          pointerEvents: "none",
          zIndex: 15,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-end"
        }}
      >
        <svg
          width="40"
          height="50"
          viewBox="0 0 40 50"
          fill="none"
          style={{
            filter: "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.28))",
            display: "block"
          }}
        >
          <defs>
            <filter id="centerPinShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="rgba(0,0,0,0.2)" />
            </filter>
          </defs>
          <path
            d="M20 2 C9.5 2 1 10.5 1 21 C1 34.5 18.5 47.8 19.3 48.5 C19.7 48.9 20.3 48.9 20.7 48.5 C21.5 47.8 39 34.5 39 21 C39 10.5 30.5 2 20 2 Z"
            fill="#EF4444"
            stroke="#FFFFFF"
            strokeWidth="2.5"
            filter="url(#centerPinShadow)"
          />
          <circle cx="20" cy="20" r="11" fill="#FFFFFF" />
          <circle cx="20" cy="20" r="5" fill="#EF4444" />
        </svg>

        {/* Target Crosshair Ground Dot */}
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#EF4444",
            border: "1.5px solid #FFFFFF",
            boxShadow: "0 0 4px rgba(0,0,0,0.6)",
            marginTop: -3,
            flexShrink: 0
          }}
        />
      </div>

      {/* Floating Minimal Search Bar */}
      <div
        style={{
          position: "absolute",
          top: 12,
          left: 12,
          right: 12,
          maxWidth: 440,
          margin: "0 auto",
          zIndex: 10
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: theme.surface,
            borderRadius: 10,
            border: `1px solid ${theme.border}`,
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.12)",
            padding: "4px 6px 4px 12px",
            gap: 8
          }}
        >
          <Search size={15} color={theme.inkSoft} style={{ flexShrink: 0 }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onSearchLocation();
              }
            }}
            placeholder="Search street or city..."
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              background: "transparent",
              color: theme.ink,
              fontSize: 13,
              fontWeight: 500,
              minWidth: 0
            }}
          />
          <button
            type="button"
            onClick={() => onSearchLocation()}
            disabled={isSearching}
            style={{
              padding: "6px 12px",
              borderRadius: 7,
              background: theme.accent,
              color: "#FFFFFF",
              fontSize: 12,
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              opacity: isSearching ? 0.7 : 1,
              flexShrink: 0
            }}
          >
            {isSearching ? "..." : "Search"}
          </button>
        </div>
      </div>

      {/* Floating GPS Recenter Button */}
      <button
        type="button"
        onClick={onRecenter}
        title="Center on my current location"
        style={{
          position: "absolute",
          right: 14,
          bottom: 14,
          width: 38,
          height: 38,
          borderRadius: 10,
          background: theme.isDark ? "rgba(30, 41, 59, 0.9)" : "rgba(248, 250, 252, 0.9)",
          backdropFilter: "blur(10px)",
          border: `1px solid ${theme.border}`,
          color: theme.inkSoft,
          boxShadow: "0 2px 8px rgba(15, 23, 42, 0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "all 0.15s ease",
          zIndex: 5
        }}
      >
        {isLocatingGps ? (
          <RefreshCw size={16} className="animate-spin" color={theme.accent} />
        ) : (
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
        )}
      </button>

      {/* Fallback Error Overlay if Google Maps is blocked */}
      {mapError && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: theme.surface,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            textAlign: "center",
            gap: 12
          }}
        >
          <AlertCircle size={32} color="#F59E0B" />
          <div style={{ fontSize: 13, fontWeight: 700, color: theme.ink }}>
            Unable to Load Map
          </div>
          <div style={{ fontSize: 12, color: theme.inkSoft, maxWidth: 320 }}>
            {mapError}. You can still enter the text address or retry location detection.
          </div>
          <button
            type="button"
            onClick={onDetectCurrentLocation}
            style={{
              padding: "7px 14px",
              borderRadius: 8,
              background: theme.accent,
              color: "#FFFFFF",
              border: "none",
              fontWeight: 600,
              fontSize: 12,
              cursor: "pointer"
            }}
          >
            Auto-Detect Location
          </button>
        </div>
      )}
    </>
  );
}
