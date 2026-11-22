import { useEffect } from "react";
import { Trash2 } from "lucide-react";
import type { ThemeType } from "../../../../../theme";
import { registerBackHandler } from "../../../../../utils/backButton";

interface UnlinkCourierModalProps {
  courier: { id: string; name: string } | null;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
  theme: ThemeType;
}

export function UnlinkCourierModal({
  courier,
  onClose,
  onConfirm,
  isDeleting,
  theme
}: UnlinkCourierModalProps) {
  // Register sequential back handler for unlink courier modal
  useEffect(() => {
    if (!courier) return;
    return registerBackHandler("unlink_courier_modal", 90, () => {
      if (!isDeleting) {
        onClose();
        return true;
      }
      return false;
    });
  }, [courier, isDeleting, onClose]);

  if (!courier) return null;

  return (
    <div
      onClick={() => !isDeleting && onClose()}
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
        {/* Red Trash Icon Badge */}
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            background: "#FEE2E2",
            color: "#EF4444",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16
          }}
        >
          <Trash2 size={24} />
        </div>

        <h3
          style={{
            margin: "0 0 10px 0",
            fontSize: 17,
            fontWeight: 700,
            color: theme.ink
          }}
        >
          Remove Courier?
        </h3>

        {/* Courier Name Badge */}
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
          This courier will be removed from your store's official fleet. Their courier app will disconnect and stop receiving store orders.
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
            disabled={isDeleting}
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
              cursor: isDeleting ? "not-allowed" : "pointer"
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            style={{
              flex: 1.3,
              height: 48,
              borderRadius: 20,
              background: "#EF4444",
              color: "#FFFFFF",
              border: "none",
              fontSize: 14,
              fontWeight: 700,
              cursor: isDeleting ? "not-allowed" : "pointer",
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.12)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6
            }}
          >
            {isDeleting ? "Removing..." : "Yes, Remove"}
          </button>
        </div>
      </div>
    </div>
  );
}
