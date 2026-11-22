import { Trash2 } from "lucide-react";
import type { ThemeType } from "../../../../theme";

interface DeleteCategoryModalProps {
  category: string | null;
  onClose: () => void;
  onConfirm: (cat: string) => void;
  theme: ThemeType;
}

export function DeleteCategoryModal({ category, onClose, onConfirm, theme }: DeleteCategoryModalProps) {
  if (!category) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(4px)",
        zIndex: 110,
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
        borderRadius: 16,
        width: "100%",
        maxWidth: 380,
        padding: 22,
        boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        boxSizing: "border-box"
      }}>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          background: "#EF444415",
          color: "#EF4444",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 14
        }}>
          <Trash2 size={24} />
        </div>

        <h3 style={{
          margin: "0 0 12px 0",
          fontSize: 16,
          fontWeight: 700,
          color: theme.ink
        }}>
          Hapus Kategori?
        </h3>

        {/* Kotak Highlight Nama Kategori */}
        <div style={{
          width: "100%",
          padding: "10px 14px",
          background: theme.surface2,
          border: `1px solid ${theme.border}`,
          borderRadius: 10,
          fontSize: 13,
          fontWeight: 700,
          color: theme.ink,
          lineHeight: 1.4,
          wordBreak: "break-word",
          overflowWrap: "anywhere",
          boxSizing: "border-box",
          marginBottom: 12
        }}>
          "{category}"
        </div>

        <p style={{
          margin: "0 0 20px 0",
          fontSize: 12,
          lineHeight: 1.5,
          color: theme.inkSoft
        }}>
          Kategori ini akan dihapus dari etalase toko. Produk di dalamnya tidak akan terhapus dan otomatis dipindahkan ke etalase utama (Semua).
        </p>

        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          width: "100%",
          boxSizing: "border-box"
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: 8,
              background: theme.surface2,
              color: theme.ink,
              border: `1px solid ${theme.border}`,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => onConfirm(category)}
            style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: 8,
              background: "#EF4444",
              color: "#FFFFFF",
              border: "none",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.12)"
            }}
          >
            Ya, Hapus
          </button>
        </div>
      </div>
    </div>
  );
}
