import { Printer } from "lucide-react";
import type { ThemeType } from "../../../../../theme";
import type { PosTransaction } from "../../../types";
import {
  formatPosPaymentBreakdown,
  getPaymentMethodDisplayLabel
} from "../../../utils/posPaymentUtils";

interface PosTransactionCardProps {
  tx: PosTransaction;
  theme: ThemeType;
  onReprintReceipt: (tx: PosTransaction) => void;
  onRequestVoid: (tx: PosTransaction) => void;
}

export function PosTransactionCard({
  tx,
  theme,
  onReprintReceipt,
  onRequestVoid
}: PosTransactionCardProps) {
  const isVoided = tx.status === "VOIDED";
  const dateObj = new Date(tx.createdAt);
  const dateTimeString = `${dateObj.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric"
  })}, ${dateObj.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit"
  })}`;

  return (
    <div
      style={{
        padding: "12px 14px",
        borderRadius: 12,
        background: isVoided ? theme.surface2 : theme.surface,
        border: `1px solid ${theme.border}`,
        opacity: isVoided ? 0.65 : 1,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        transition: "all 0.15s ease"
      }}
    >
      {/* Top Row: Receipt Number, Timestamp, & Payment Status */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              fontFamily: "monospace",
              color: theme.ink,
              letterSpacing: -0.2
            }}
          >
            {tx.receiptNumber}
          </span>
          <span style={{ fontSize: 11, color: theme.inkSoft }}>
            • {dateTimeString}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            title={
              tx.paymentMethod === "SPLIT" && Array.isArray(tx.payments)
                ? tx.payments
                    .map(
                      (p) =>
                        `${getPaymentMethodDisplayLabel(p.method)}: Rp ${p.amount.toLocaleString("id-ID")}`
                    )
                    .join(" | ")
                : undefined
            }
            style={{
              fontSize: 11,
              padding: "2px 8px",
              borderRadius: 6,
              background: theme.surface2,
              border: `1px solid ${theme.border}`,
              color: theme.ink,
              fontWeight: 600
            }}
          >
            {formatPosPaymentBreakdown(tx)}
          </span>

          {isVoided && (
            <span
              style={{
                fontSize: 10,
                padding: "2px 7px",
                borderRadius: 6,
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.25)",
                color: "#EF4444",
                fontWeight: 700
              }}
            >
              VOIDED
            </span>
          )}
        </div>
      </div>

      {/* Middle: Purchased Items List */}
      <div
        style={{
          fontSize: 12,
          color: theme.ink,
          fontWeight: 500,
          lineHeight: 1.5,
          wordBreak: "break-word"
        }}
      >
        {tx.items.map((it, idx) => (
          <span key={idx}>
            {idx > 0 && <span style={{ color: theme.inkSoft, margin: "0 6px" }}>•</span>}
            <strong style={{ fontWeight: 700 }}>{it.quantity}x</strong>{" "}
            <span>
              {it.product.name}
              {it.variant ? ` (${it.variant.name})` : ""}
            </span>
          </span>
        ))}
      </div>

      {/* Bottom Row: Total Amount & Action Buttons */}
      <div
        style={{
          paddingTop: 8,
          borderTop: `1px dashed ${theme.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8
        }}
      >
        <div>
          <span style={{ fontSize: 11, color: theme.inkSoft, marginRight: 5 }}>
            Total:
          </span>
          <span
            style={{
              fontSize: 15,
              fontWeight: 800,
              color: isVoided ? theme.inkSoft : theme.ink,
              textDecoration: isVoided ? "line-through" : "none"
            }}
          >
            Rp {tx.totalAmount.toLocaleString("id-ID")}
          </span>
        </div>

        {!isVoided ? (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button
              type="button"
              onClick={() => onReprintReceipt(tx)}
              title="Reprint Receipt"
              style={{
                padding: "5px 10px",
                borderRadius: 6,
                background: theme.surface2,
                border: `1px solid ${theme.border}`,
                color: theme.ink,
                cursor: "pointer",
                fontSize: 11,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 4,
                transition: "all 0.15s ease"
              }}
            >
              <Printer size={12} />
              <span>Print</span>
            </button>

            <button
              type="button"
              onClick={() => onRequestVoid(tx)}
              title="Void Transaction (Restore Stock)"
              style={{
                padding: "5px 10px",
                borderRadius: 6,
                background: "rgba(239, 68, 68, 0.08)",
                border: "1px solid rgba(239, 68, 68, 0.2)",
                color: "#EF4444",
                cursor: "pointer",
                fontSize: 11,
                fontWeight: 600,
                transition: "all 0.15s ease"
              }}
            >
              Void
            </button>
          </div>
        ) : (
          <span style={{ fontSize: 11, color: "#EF4444", fontWeight: 600 }}>
            Voided
          </span>
        )}
      </div>
    </div>
  );
}
