import { useEffect } from "react";
import { RefreshCw } from "lucide-react";
import type { ThemeType } from "../../../../../theme";
import { registerBackHandler } from "../../../../../utils/backButton";

interface ResetCourierCodeModalProps {
  courier: { id: string; name: string } | null;
  onClose: () => void;
  onConfirm: () => void;
  isResetting: boolean;
  theme: ThemeType;
}

export function ResetCourierCodeModal({
  courier,
  onClose,
  onConfirm,
  isResetting,
  theme
}: ResetCourierCodeModalProps) {
  // Register sequential back handler for reset courier code modal
  useEffect(() => {
    if (!courier) return;
    return registerBackHandler("reset_courier_code_modal", 90, () => {
      if (!isResetting) {
        onClose();
        return true;
      }
      return false;
    });
  }, [courier, isResetting, onClose]);

  if (!courier) return null;

  return (
    <div
      onClick={() => !isResetting && onClose()}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(4px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: 20,
          width: "100%",
          maxWidth: 400,
          padding: 24,
          boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          boxSizing: "border-box"
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            background: theme.surface2,
            color: theme.ink,
            border: `1px solid ${theme.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16
          }}
        >
          <RefreshCw size={22} />
        </div>

        <h3
          style={{
            margin: "0 0 10px 0",
            fontSize: 17,
            fontWeight: 700,
            color: theme.ink
          }}
        >
          Reset PIN Aktivasi?
        </h3>

        <div
          style={{
            width: "100%",
            padding: "11px 16px",
            background: theme.surface2,
            border: `1px solid ${theme.border}`,
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 700,
            color: theme.ink,
            lineHeight: 1.4,
            wordBreak: "break-word",
            boxSizing: "border-box",
            marginBottom: 12
          }}
        >
          "{courier.name}"
        </div>

        <p
          style={{
            margin: "0 0 20px 0",
            fontSize: 13,
            lineHeight: 1.5,
            color: theme.inkSoft
          }}
        >
          The previous activation code will be invalidated and a new code will be generated for this courier.
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            width: "100%",
            boxSizing: "border-box"
          }}
        >
          <button
            type="button"
            disabled={isResetting}
            onClick={onClose}
            style={{
              flex: 1,
              height: 48,
              borderRadius: 20,
              background: theme.surface2,
              color: theme.ink,
              border: `1px solid ${theme.border}`,
              fontSize: 14,
              fontWeight: 600,
              cursor: isResetting ? "not-allowed" : "pointer"
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isResetting}
            onClick={onConfirm}
            style={{
              flex: 1.3,
              height: 48,
              borderRadius: 20,
              border: "none",
              background: theme.ink,
              color: theme.surface,
              fontSize: 14,
              fontWeight: 700,
              cursor: isResetting ? "not-allowed" : "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              boxShadow: "0 2px 6px rgba(0,0,0,0.08)"
            }}
          >
            {isResetting ? "Resetting..." : "Generate New Code"}
          </button>
        </div>
      </div>
    </div>
  );
}
