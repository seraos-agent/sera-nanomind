import type { ThemeType } from "../../../../theme";
import type { DeliveryStop } from "../../types";
import { SolidMapPinIcon, WhatsAppIcon } from "../utils/deliveryIcons";

interface DeliveryFloatingMapCardProps {
  activeStop: DeliveryStop | null;
  hasQueue: boolean;
  isMobileView?: boolean;
  theme?: ThemeType;
  onOpenWhatsApp: (phone: string, customerName: string, stopNum: number) => void;
  onOpenCompleteModal: (stop: DeliveryStop) => void;
  onSwitchToList?: () => void;
  onSelectCompletedTab?: () => void;
}

export function DeliveryFloatingMapCard({
  activeStop,
  hasQueue,
  isMobileView,
  theme,
  onOpenWhatsApp,
  onOpenCompleteModal,
  onSwitchToList,
  onSelectCompletedTab
}: DeliveryFloatingMapCardProps) {
  const surfaceBg = theme?.surface || "#FFFFFF";
  const surface2Bg = theme?.surface2 || "#F1F5F9";
  const borderCol = theme?.border || "#CBD5E1";
  const textInk = theme?.ink || "#0F172A";
  const textSoft = theme?.inkSoft || "#64748B";

  if (activeStop) {
    return (
      <div
        style={{
          position: "absolute",
          bottom: isMobileView ? 4 : 6,
          left: isMobileView ? 8 : 14,
          right: isMobileView ? 8 : 14,
          zIndex: 20,
          background: surfaceBg,
          borderRadius: 12,
          border: `1px solid ${borderCol}`,
          boxShadow: theme?.isDark ? "0 4px 24px rgba(0, 0, 0, 0.45)" : "0 4px 20px rgba(15, 23, 42, 0.12)",
          padding: isMobileView ? "10px 12px" : "12px 14px",
          display: "flex",
          flexDirection: "column",
          gap: 8
        }}
      >
        {/* Card Top Strip */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: 6,
                background: surface2Bg,
                color: textInk,
                border: `1px solid ${borderCol}`
              }}
            >
              Stop #{activeStop.stopNumber}
            </span>
            <span style={{ fontSize: 12, fontWeight: 600, color: textSoft, display: "inline-flex", alignItems: "center", gap: 4 }}>
              <SolidMapPinIcon size={13} color="#EF4444" />
              <span>{activeStop.distanceKm} km</span>
            </span>
          </div>

          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              padding: "2px 6px",
              borderRadius: 4,
              background: surface2Bg,
              color: textInk,
              border: `1px solid ${borderCol}`
            }}
          >
            {activeStop.isCod ? `COD Rp ${activeStop.codAmount.toLocaleString("id-ID")}` : "Paid"}
          </span>
        </div>

        {/* Customer & Address snippet */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: textInk }}>
            {activeStop.customerName}
          </div>
          <div style={{ fontSize: 12, color: textSoft, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {activeStop.destAddress}
          </div>
        </div>

        {/* Action buttons row */}
        <div style={{ display: "grid", gridTemplateColumns: "42px 1fr", gap: 8 }}>
          <button
            type="button"
            onClick={() => onOpenWhatsApp(activeStop.customerPhone, activeStop.customerName, activeStop.stopNumber)}
            title="Chat WhatsApp"
            style={{
              height: 38,
              borderRadius: 8,
              border: `1px solid ${borderCol}`,
              background: surface2Bg,
              color: textInk,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)"
            }}
          >
            <WhatsAppIcon size={18} color="#25D366" />
          </button>

          <button
            type="button"
            onClick={() => onOpenCompleteModal(activeStop)}
            style={{
              height: 38,
              borderRadius: 8,
              border: `1px solid ${borderCol}`,
              background: surface2Bg,
              color: textInk,
              fontSize: 12.5,
              fontWeight: 700,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)"
            }}
          >
            <span>Complete</span>
          </button>
        </div>
      </div>
    );
  }

  // When all completed
  if (!activeStop && hasQueue) {
    return (
      <div
        style={{
          position: "absolute",
          bottom: isMobileView ? 4 : 6,
          left: isMobileView ? 8 : 14,
          right: isMobileView ? 8 : 14,
          zIndex: 20,
          background: surfaceBg,
          borderRadius: 12,
          padding: 14,
          textAlign: "center",
          boxShadow: theme?.isDark ? "0 4px 24px rgba(0, 0, 0, 0.45)" : "0 4px 20px rgba(15, 23, 42, 0.1)",
          border: `1px solid ${borderCol}`
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 700, color: textInk, marginBottom: 6 }}>
          All Deliveries Completed Today
        </div>
        <button
          type="button"
          onClick={() => {
            if (onSwitchToList) onSwitchToList();
            if (onSelectCompletedTab) onSelectCompletedTab();
          }}
          style={{
            padding: "7px 14px",
            borderRadius: 8,
            background: surface2Bg,
            border: `1px solid ${borderCol}`,
            color: textInk,
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer"
          }}
        >
          View Completed List & History
        </button>
      </div>
    );
  }

  return null;
}
