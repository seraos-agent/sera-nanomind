import type { ThemeType } from "../../../../theme";
import type { DeliveryStop } from "../../types";
import { DeliveryOrderItemsList } from "./DeliveryOrderItemsList";

interface DeliveryCompletedCardProps {
  stop: DeliveryStop;
  theme: ThemeType;
  isMobileView?: boolean;
}

export function DeliveryCompletedCard({
  stop,
  theme,
  isMobileView
}: DeliveryCompletedCardProps) {
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
      {/* Header Kartu */}
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
          <div style={{ fontSize: 11.5, color: theme.inkSoft, fontFamily: "monospace" }}>
            {stop.orderId} • {stop.completedAt || "Delivered"}
          </div>
          {/* Recipient Name Below Order ID */}
          <div style={{ fontSize: 13, fontWeight: 700, color: theme.ink, marginTop: 2 }}>
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
          {stop.isCod ? "COD Cash" : "Non-COD (Paid)"}
        </span>
      </div>

      {/* Product Details & Note */}
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

      {/* Card Footer */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: 10,
          borderTop: `1px dashed ${theme.border}`,
          gap: 10
        }}
      >
        <div style={{ fontSize: 12, color: theme.inkSoft, fontWeight: 500 }}>
          {stop.isCod ? "COD Cash Collected" : "Order Total"}
        </div>
        <div style={{ fontSize: 16, fontWeight: 800, color: theme.ink }}>
          Rp {(stop.codAmount || stop.totalAmount || 0).toLocaleString("id-ID")}
        </div>
      </div>
    </div>
  );
}
