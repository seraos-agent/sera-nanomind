import { CheckCircle2 } from "lucide-react";
import type { ThemeType } from "../../../../theme";
import type { DeliveryStop } from "../../types";

interface DeliveryCompleteModalProps {
  stop: DeliveryStop | null;
  onClose: () => void;
  onConfirm: () => void;
  theme?: ThemeType;
}

export function DeliveryCompleteModal({ stop, onClose, onConfirm, theme }: DeliveryCompleteModalProps) {
  if (!stop) return null;

  const surfaceBg = theme?.surface || "#FFFFFF";
  const surface2Bg = theme?.surface2 || "#F8FAFC";
  const borderCol = theme?.border || "#CBD5E1";
  const textInk = theme?.ink || "#0F172A";
  const textSoft = theme?.inkSoft || "#64748B";

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 360,
          background: surfaceBg,
          borderRadius: 12,
          border: `1px solid ${borderCol}`,
          padding: 22,
          textAlign: "center",
          boxShadow: theme?.isDark ? "0 10px 30px rgba(0, 0, 0, 0.5)" : "0 10px 30px rgba(15, 23, 42, 0.15)",
          boxSizing: "border-box"
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: surface2Bg,
            color: textInk,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 12px"
          }}
        >
          <CheckCircle2 size={24} />
        </div>

        <h3 style={{ fontSize: 16, fontWeight: 700, color: textInk, margin: "0 0 8px 0" }}>
          Complete Delivery #{stop.stopNumber}?
        </h3>

        <div
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            background: surface2Bg,
            border: `1px solid ${borderCol}`,
            fontSize: 13,
            fontWeight: 700,
            color: textInk,
            marginBottom: 10
          }}
        >
          {stop.customerName}
        </div>

        <p style={{ fontSize: 12.5, color: textSoft, margin: "0 0 16px 0", lineHeight: 1.45 }}>
          {stop.isCod
            ? `Please ensure you have collected Rp ${stop.codAmount.toLocaleString("id-ID")} COD cash from the customer.`
            : "Please ensure the package has been safely handed over to the customer."}
        </p>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              padding: "9px 12px",
              borderRadius: 8,
              border: `1px solid ${borderCol}`,
              background: surface2Bg,
              color: textInk,
              fontSize: 12.5,
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              flex: 1.2,
              padding: "9px 12px",
              borderRadius: 8,
              border: "none",
              background: theme?.accent || "#0F172A",
              color: theme?.accentInk || "#FFFFFF",
              fontSize: 12.5,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(15, 23, 42, 0.2)"
            }}
          >
            Yes, Complete
          </button>
        </div>
      </div>
    </div>
  );
}
