import { Check, AlertCircle } from "lucide-react";

interface CourierToastProps {
  toast: { message: string; type: "success" | "error" } | null;
}

export function CourierToast({ toast }: CourierToastProps) {
  if (!toast) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 10000,
        background: toast.type === "error" ? "#EF4444" : "#10B981",
        color: "#FFFFFF",
        padding: "12px 22px",
        borderRadius: 24,
        fontSize: 13.5,
        fontWeight: 600,
        boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
        display: "flex",
        alignItems: "center",
        gap: 9,
        maxWidth: "90%",
        boxSizing: "border-box"
      }}
    >
      {toast.type === "error" ? (
        <AlertCircle size={17} style={{ flexShrink: 0 }} />
      ) : (
        <Check size={17} style={{ flexShrink: 0 }} />
      )}
      <span>{toast.message}</span>
    </div>
  );
}
