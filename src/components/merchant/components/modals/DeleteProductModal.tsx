import { Trash2 } from "lucide-react";
import type { ThemeType } from "../../../../theme";
import type { MerchantProduct } from "../../types";

interface DeleteProductModalProps {
  product: MerchantProduct | null;
  onClose: () => void;
  onConfirm: (productId: string) => void;
  theme: ThemeType;
}

export function DeleteProductModal({ product, onClose, onConfirm, theme }: DeleteProductModalProps) {
  if (!product) return null;

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
          Delete Product?
        </h3>

        {/* Product Name Highlight Box */}
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
          "{product.name}"
        </div>

        <p style={{
          margin: "0 0 20px 0",
          fontSize: 12,
          lineHeight: 1.5,
          color: theme.inkSoft
        }}>
          This product will be permanently removed from your store showcase.
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
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(product.id)}
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
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
}
