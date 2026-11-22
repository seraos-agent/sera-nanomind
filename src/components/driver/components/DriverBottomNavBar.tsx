import { MapPin } from "lucide-react";
import type { ThemeType } from "../../../theme";
import type { DriverViewMode } from "../DriverPage";

interface DriverBottomNavBarProps {
  theme: ThemeType;
  isMobileView?: boolean;
  currentView: DriverViewMode;
  onChangeView: (view: DriverViewMode) => void;
}

export function DriverBottomNavBar({
  theme,
  isMobileView,
  currentView,
  onChangeView
}: DriverBottomNavBarProps) {
  return (
    <div
      style={{
        background: theme.surface,
        borderTop: `1px solid ${theme.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        padding: isMobileView ? "8px 14px 10px" : "10px 20px 12px",
        zIndex: 30,
        boxShadow: "0 -2px 10px rgba(0,0,0,0.02)",
        flexShrink: 0
      }}
    >
      <button
        type="button"
        onClick={() => onChangeView("orders")}
        style={{
          flex: 1,
          maxWidth: 180,
          background: currentView === "orders" ? theme.ink : "transparent",
          border: `1px solid ${currentView === "orders" ? theme.ink : theme.border}`,
          borderRadius: 20,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: isMobileView ? "8px 12px" : "9px 16px",
          color: currentView === "orders" ? theme.surface : theme.inkSoft,
          boxShadow: currentView === "orders" ? "0 1px 3px rgba(0, 0, 0, 0.08)" : "none",
          transition: "all 0.15s ease"
        }}
      >
        <span style={{ fontSize: 13, fontWeight: currentView === "orders" ? 700 : 500 }}>
          Packages
        </span>
      </button>

      <button
        type="button"
        onClick={() => onChangeView("map")}
        style={{
          flex: 1,
          maxWidth: 180,
          background: currentView === "map" ? theme.ink : "transparent",
          border: `1px solid ${currentView === "map" ? theme.ink : theme.border}`,
          borderRadius: 20,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 7,
          padding: isMobileView ? "8px 12px" : "9px 16px",
          color: currentView === "map" ? theme.surface : theme.inkSoft,
          boxShadow: currentView === "map" ? "0 1px 3px rgba(0, 0, 0, 0.08)" : "none",
          transition: "all 0.15s ease"
        }}
      >
        <MapPin size={16} />
        <span style={{ fontSize: 13, fontWeight: currentView === "map" ? 700 : 500 }}>
          Map
        </span>
      </button>
    </div>
  );
}
