import { X } from "lucide-react";

interface OrderProofLightboxModalProps {
  proofUrl: string;
  orderId: string;
  onClose: () => void;
}

export function OrderProofLightboxModal({
  proofUrl,
  orderId,
  onClose,
}: OrderProofLightboxModalProps) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.85)",
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        backdropFilter: "blur(4px)"
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: "relative",
          maxWidth: 500,
          width: "100%",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}
      >
        <button
          type="button"
          onClick={onClose}
          style={{
            position: "absolute",
            top: -40,
            right: 0,
            background: "rgba(255,255,255,0.2)",
            border: "none",
            color: "#FFFFFF",
            borderRadius: "50%",
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer"
          }}
        >
          <X size={20} />
        </button>
        <img
          src={proofUrl}
          alt={`Bukti Transfer ${orderId}`}
          style={{
            maxWidth: "100%",
            maxHeight: "80vh",
            objectFit: "contain",
            borderRadius: 12,
            boxShadow: "0 16px 32px rgba(0,0,0,0.4)"
          }}
        />
      </div>
    </div>
  );
}
