import { CheckCircle2 } from "lucide-react";
import type { ThemeType } from "../../../../theme";
import type { DeliveryStop } from "../../types";
import { DeliveryCompletedCard } from "./DeliveryCompletedCard";

interface DeliveryCompletedTabProps {
  completedStops: DeliveryStop[];
  totalCodCollected: number;
  isCodSettled: boolean;
  theme: ThemeType;
  isMobileView?: boolean;
  onContactStore?: () => void;
  onOpenSettlement?: () => void;
}

export function DeliveryCompletedTab({
  completedStops,
  totalCodCollected,
  isCodSettled,
  theme,
  isMobileView,
  onContactStore: _onContactStore,
  onOpenSettlement
}: DeliveryCompletedTabProps) {
  if (completedStops.length === 0) {
    return (
      <div
        style={{
          padding: 36,
          textAlign: "center",
          background: theme.surface,
          borderRadius: 14,
          border: `1px solid ${theme.border}`,
          color: theme.inkSoft,
          boxShadow: "0 1px 2px rgba(0,0,0,0.02)"
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: theme.surface2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 12px",
            color: theme.inkSoft
          }}
        >
          <CheckCircle2 size={24} />
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: theme.ink, marginBottom: 4 }}>
          No Completed Deliveries Yet
        </div>
        <div style={{ fontSize: 12, color: theme.inkSoft, maxWidth: 320, margin: "0 auto", lineHeight: 1.5 }}>
          Packages you have successfully handed over to customers will appear here along with COD cash totals.
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Completed Summary Card */}
      <div
        style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: 14,
          padding: isMobileView ? "14px" : "16px 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 1px 2px rgba(0,0,0,0.02)"
        }}
      >
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: theme.ink }}>
            Completed Delivery Summary
          </div>
          <div style={{ fontSize: 11.5, color: theme.inkSoft, marginTop: 2 }}>
            {completedStops.length} packages delivered today
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, color: theme.inkSoft, fontWeight: 600 }}>COD Cash Collected</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: theme.accent, marginTop: 2 }}>
            Rp {totalCodCollected.toLocaleString("id-ID")}
          </div>
        </div>
      </div>

      {/* COD Settlement Reminder Banner */}
      {totalCodCollected > 0 && (
        <div
          style={{
            background: theme.surface,
            border: `1px solid ${theme.border}`,
            borderRadius: 14,
            padding: isMobileView ? "14px" : "16px 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
            boxShadow: "0 1px 2px rgba(0,0,0,0.02)"
          }}
        >
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: theme.ink }}>
              COD Cash Handover to Store Cashier
            </div>
            <div style={{ fontSize: 11.5, color: theme.inkSoft, marginTop: 2 }}>
              Cash collected from {completedStops.filter(s => s.isCod).length} COD orders. Please hand over to the store cashier.
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              justifyContent: isMobileView ? "space-between" : "flex-end",
              width: isMobileView ? "100%" : "auto",
              ...(isMobileView ? { paddingTop: 10, borderTop: `1px solid ${theme.border}` } : {})
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 800, color: theme.accent }}>
              Rp {totalCodCollected.toLocaleString("id-ID")}
            </div>
            {onOpenSettlement && (
              <button
                type="button"
                onClick={onOpenSettlement}
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  background: "#10B981",
                  color: "#FFFFFF",
                  border: "none",
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.12)",
                  transition: "transform 0.1s ease, filter 0.15s ease"
                }}
              >
                Settle Cash
              </button>
            )}
          </div>
        </div>
      )}

      {/* Settlement Complete Notice */}
      {isCodSettled && (
        <div
          style={{
            background: theme.surface2,
            border: `1px solid ${theme.border}`,
            borderRadius: 10,
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 12,
            fontWeight: 600,
            color: theme.inkSoft
          }}
        >
          <CheckCircle2 size={15} color="#10B981" />
          <span>All COD cash collected today has been handed over to the store cashier.</span>
        </div>
      )}

      {/* List Kartu Selesai */}
      {completedStops.map(stop => (
        <DeliveryCompletedCard
          key={stop.id}
          stop={stop}
          theme={theme}
          isMobileView={isMobileView}
        />
      ))}
    </div>
  );
}
