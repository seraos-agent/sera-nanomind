import { AlertTriangle } from "lucide-react";
import type { ThemeType } from "../../../../../theme";
import type { PosTransaction } from "../../../types";

interface PosVoidConfirmModalProps {
  transactionToVoid: PosTransaction | null;
  theme: ThemeType;
  onCancel: () => void;
  onConfirmVoid: (tx: PosTransaction) => void;
}

export function PosVoidConfirmModal({
  transactionToVoid,
  theme,
  onCancel,
  onConfirmVoid
}: PosVoidConfirmModalProps) {
  if (!transactionToVoid) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10001,
        background: "rgba(0,0,0,0.65)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16
      }}
    >
      <div
        style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: 14,
          width: "100%",
          maxWidth: 360,
          padding: 18,
          boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#EF4444", marginBottom: 8 }}>
          <AlertTriangle size={20} />
          <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: theme.ink }}>
            Batalkan Transaksi?
          </h4>
        </div>
        <p style={{ margin: "0 0 14px", fontSize: 12, color: theme.inkSoft, lineHeight: 1.5 }}>
          Transaksi <strong>{transactionToVoid.receiptNumber}</strong> sebesar{" "}
          <strong>Rp {transactionToVoid.totalAmount.toLocaleString("id-ID")}</strong> akan dibatalkan, dan stok barang akan otomatis dikembalikan ke katalog.
        </p>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              border: `1px solid ${theme.border}`,
              background: theme.surface2,
              color: theme.ink,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => onConfirmVoid(transactionToVoid)}
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              border: "none",
              background: "#EF4444",
              color: "#FFFFFF",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            Ya, Batalkan Transaksi
          </button>
        </div>
      </div>
    </div>
  );
}
