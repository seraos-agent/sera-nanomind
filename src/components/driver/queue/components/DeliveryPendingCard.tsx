import type { ThemeType } from "../../../../theme";
import type { DeliveryStop } from "../../types";
import { SolidMapPinIcon, WhatsAppIcon } from "../utils/deliveryIcons";
import { DeliveryOrderItemsList } from "./DeliveryOrderItemsList";

interface DeliveryPendingCardProps {
  stop: DeliveryStop;
  theme: ThemeType;
  isMobileView?: boolean;
  onSelectForMap: (stop: DeliveryStop) => void;
  onOpenWhatsApp: (phone: string, customerName: string, stopNum: number) => void;
  onRequestComplete: (stop: DeliveryStop) => void;
}

export function DeliveryPendingCard({
  stop,
  theme,
  isMobileView,
  onSelectForMap,
  onOpenWhatsApp,
  onRequestComplete
}: DeliveryPendingCardProps) {
  return (
    <div
      style={{
        background: theme.surface,
        border: `1px solid ${theme.border}`,
        borderRadius: 14,
        padding: isMobileView ? 14 : 16,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        boxShadow: "0 1px 2px rgba(0,0,0,0.02)"
      }}
    >
      {/* Header Kartu: Stop # + ID Order + Nama Penerima & Payment Method */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          borderBottom: `1px solid ${theme.border}`,
          paddingBottom: 8,
          gap: 8
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: 24,
                height: 22,
                padding: "0 6px",
                borderRadius: 6,
                background: theme.surface2,
                border: `1px solid ${theme.border}`,
                fontSize: 12,
                fontWeight: 800,
                fontFamily: "monospace",
                color: theme.ink,
                letterSpacing: -0.2
              }}
            >
              #{stop.stopNumber}
            </span>
            <span style={{ fontSize: 11.5, color: theme.inkSoft, fontFamily: "monospace" }}>
              {stop.orderId}
            </span>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: theme.accent, display: "inline-flex", alignItems: "center", gap: 3 }}>
              <span>•</span>
              <span>{stop.distanceKm} km</span>
            </span>
          </div>
          {/* Nama Penerima Langsung di Bawah Keterangan ID Order */}
          <div style={{ fontSize: 12.5, fontWeight: 700, color: theme.ink, marginTop: 2 }}>
            {stop.customerName}
          </div>
        </div>

        <span
          style={{
            padding: "2px 8px",
            borderRadius: 6,
            background: theme.surface2,
            border: `1px solid ${theme.border}`,
            fontSize: 11,
            fontWeight: 600,
            color: theme.ink,
            flexShrink: 0
          }}
        >
          {stop.isCod ? "COD" : "Non-COD"}
        </span>
      </div>

      {/* Rincian Produk & Catatan */}
      <div>
        <DeliveryOrderItemsList
          itemsSummary={stop.itemsSummary}
          fontSize={12.5}
          inkColor={theme.ink}
          inkSoftColor={theme.inkSoft}
        />
        {stop.note && (
          <div
            style={{
              marginTop: 7,
              background: theme.surface2,
              border: `1px solid ${theme.border}`,
              borderRadius: 8,
              padding: "6px 10px",
              fontSize: 11.5,
              color: theme.ink,
              lineHeight: 1.4
            }}
          >
            <span style={{ color: theme.inkSoft, fontWeight: 600 }}>Note: </span>
            <span>"{stop.note}"</span>
          </div>
        )}
      </div>

      {/* Card Footer: Total Payment & Action Buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: 10,
          borderTop: `1px dashed ${theme.border}`,
          flexWrap: "wrap",
          gap: 10
        }}
      >
        <div>
          <div style={{ fontSize: 10, color: theme.inkSoft, textTransform: "uppercase" }}>
            {stop.isCod ? "COD Due" : "Order Total"}
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: theme.accent, marginTop: 2 }}>
            Rp {(stop.codAmount || stop.totalAmount || 0).toLocaleString("id-ID")}
          </div>
        </div>

        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <button
            type="button"
            onClick={() => onSelectForMap(stop)}
            style={{
              padding: "6px 10px",
              borderRadius: 8,
              background: theme.surface2,
              border: `1px solid ${theme.border}`,
              color: theme.ink,
              fontSize: 11.5,
              fontWeight: 600,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)"
            }}
          >
            <SolidMapPinIcon size={14} color="#EF4444" />
            <span>Map</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenWhatsApp(stop.customerPhone, stop.customerName, stop.stopNumber)}
            title="Chat WhatsApp"
            style={{
              padding: "6px 8px",
              borderRadius: 8,
              background: theme.surface2,
              border: `1px solid ${theme.border}`,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)"
            }}
          >
            <WhatsAppIcon size={15} color="#25D366" />
          </button>

          <button
            type="button"
            onClick={() => onRequestComplete(stop)}
            style={{
              padding: "6px 14px",
              borderRadius: 8,
              background: theme.surface2,
              color: theme.ink,
              border: `1px solid ${theme.border}`,
              fontSize: 11.5,
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
    </div>
  );
}
