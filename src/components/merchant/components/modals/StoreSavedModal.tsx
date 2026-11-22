import { useEffect } from "react";
import { Check } from "lucide-react";
import type { ThemeType } from "../../../../theme";

interface StoreSavedModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeType;
}

export function StoreSavedModal({ isOpen, onClose, theme }: StoreSavedModalProps) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.4)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: 16,
        animation: "fadeIn 0.15s ease"
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: 20,
          padding: "24px 22px 20px",
          width: "100%",
          maxWidth: 320,
          textAlign: "center",
          boxShadow: "0 16px 40px rgba(0, 0, 0, 0.16)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
          animation: "scaleIn 0.18s ease"
        }}
      >
        <div style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: theme.statusSoft,
          color: theme.status,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <Check size={22} strokeWidth={2.5} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: theme.ink }}>
            Pengaturan Toko Disimpan
          </h3>
          <p style={{ margin: 0, fontSize: 12, color: theme.inkSoft, lineHeight: 1.4 }}>
            Perubahan informasi toko Anda berhasil diperbarui di etalase.
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          style={{
            width: "100%",
            padding: "10px 18px",
            borderRadius: 20,
            background: theme.ink,
            color: theme.bg,
            border: "none",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            marginTop: 4,
            transition: "opacity 0.15s ease"
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = "0.85"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
        >
          Oke, Mengerti
        </button>
      </div>
    </div>
  );
}
