import { Trash2 } from "lucide-react";
import type { ThemeType } from "../../../../theme";

interface ConfirmClearChatModalProps {
  theme: ThemeType;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmClearChatModal({ theme, onCancel, onConfirm }: ConfirmClearChatModalProps) {
  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 99999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 16
    }}>
      <div
        onClick={onCancel}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0, 0, 0, 0.55)",
          backdropFilter: "blur(4px)"
        }}
      />
      <div style={{
        position: "relative",
        background: theme.isDark ? "#18181B" : theme.surface,
        border: `1px solid ${theme.isDark ? "#2E2E33" : theme.border}`,
        borderRadius: 18,
        padding: "24px 22px 20px",
        maxWidth: 380,
        width: "100%",
        boxShadow: "0 20px 40px rgba(0,0,0,0.35)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        boxSizing: "border-box",
        animation: "walletPageIn 180ms ease forwards"
      }}>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          background: "rgba(239, 68, 68, 0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16
        }}>
          <Trash2 size={24} color="#ef4444" />
        </div>

        <h3 style={{ margin: "0 0 8px", fontSize: 17, fontWeight: 600, color: theme.ink }}>
          Hapus Seluruh Percakapan?
        </h3>
        <p style={{ margin: "0 0 20px", fontSize: 13, color: theme.inkSoft, lineHeight: 1.5 }}>
          Seluruh riwayat chat dalam sesi ini akan dihapus permanen dan memulai percakapan baru. Tindakan ini tidak dapat dibatalkan.
        </p>

        <div style={{ display: "flex", gap: 10, width: "100%" }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              flex: 1,
              padding: "11px 16px",
              borderRadius: 10,
              border: `1px solid ${theme.border}`,
              background: theme.surface2,
              color: theme.ink,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 150ms"
            }}
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: "11px 16px",
              borderRadius: 10,
              border: "none",
              background: "#ef4444",
              color: "#ffffff",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.12)",
              transition: "all 150ms"
            }}
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}
