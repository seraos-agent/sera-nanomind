import { useState } from "react";
import { RotateCcw, AlertTriangle } from "lucide-react";
import type { ThemeType } from "../../../../../theme";

interface ResetStoreConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeName: string;
  onResetStore?: () => Promise<void> | void;
  theme: ThemeType;
}

export function ResetStoreConfirmModal({
  isOpen,
  onClose,
  storeName,
  onResetStore,
  theme
}: ResetStoreConfirmModalProps) {
  const [isResetting, setIsResetting] = useState(false);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.65)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: 20
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isResetting) {
          onClose();
        }
      }}
    >
      <div
        style={{
          background: theme.surface,
          borderRadius: 24,
          border: `1px solid ${theme.border}`,
          padding: "24px 22px",
          maxWidth: 420,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 16,
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.35)",
          animation: "fadeIn 0.15s ease-out"
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: theme.isDark ? "rgba(239, 68, 68, 0.15)" : "#fee2e2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ef4444"
          }}
        >
          <AlertTriangle size={24} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: theme.ink }}>
            Reset Demo Store?
          </h3>
          <p style={{ margin: 0, fontSize: 13, color: theme.inkSoft, lineHeight: 1.5 }}>
            This will remove local store data for <strong>{storeName || "This Store"}</strong>, all products, and sample order history. You will be redirected back to the <strong>Store Onboarding</strong> screen to start fresh.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <button
            type="button"
            disabled={isResetting}
            onClick={onClose}
            style={{
              flex: 1,
              padding: "12px 16px",
              borderRadius: 14,
              background: theme.surface2,
              border: `1px solid ${theme.border}`,
              color: theme.ink,
              fontSize: 14,
              fontWeight: 600,
              cursor: isResetting ? "not-allowed" : "pointer",
              opacity: isResetting ? 0.6 : 1
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isResetting}
            onClick={async () => {
              setIsResetting(true);
              try {
                if (onResetStore) {
                  await onResetStore();
                }
              } finally {
                setIsResetting(false);
                onClose();
              }
            }}
            style={{
              flex: 1,
              padding: "12px 16px",
              borderRadius: 14,
              background: "#ef4444",
              border: "none",
              color: "#ffffff",
              fontSize: 14,
              fontWeight: 600,
              cursor: isResetting ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              opacity: isResetting ? 0.6 : 1
            }}
          >
            <RotateCcw size={15} />
            <span>{isResetting ? "Resetting..." : "Yes, Reset Store"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
