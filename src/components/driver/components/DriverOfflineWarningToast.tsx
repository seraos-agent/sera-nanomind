import { AlertTriangle } from "lucide-react";

interface DriverOfflineWarningToastProps {
  message: string | null;
  isMobileView?: boolean;
  onDismiss: () => void;
}

export function DriverOfflineWarningToast({
  message,
  isMobileView,
  onDismiss
}: DriverOfflineWarningToastProps) {
  if (!message) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: isMobileView ? 14 : 20,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        width: isMobileView ? "calc(100% - 28px)" : "auto",
        maxWidth: 420,
        background: "#0F172A",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        color: "#FFFFFF",
        padding: "10px 14px",
        borderRadius: 14,
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.35)",
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        animation: "fadeIn 0.2s ease"
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: "rgba(245, 158, 11, 0.16)",
          color: "#F59E0B",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          marginTop: 1
        }}
      >
        <AlertTriangle size={15} color="#F59E0B" />
      </div>

      <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#F8FAFC" }}>
          Tidak Dapat Offline
        </div>
        <div style={{ fontSize: 11.5, color: "#94A3B8", marginTop: 2, lineHeight: 1.45 }}>
          {message}
        </div>
      </div>

      <button
        type="button"
        onClick={onDismiss}
        style={{
          background: "transparent",
          border: "none",
          color: "#64748B",
          cursor: "pointer",
          padding: "2px 4px",
          fontSize: 14,
          lineHeight: 1,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
        title="Tutup"
      >
        ✕
      </button>
    </div>
  );
}
