import React from "react";
import { X } from "lucide-react";
import type { ThemeType } from "../../../../../theme";
import type { MerchantProduct, ProductVariant } from "../../../types";

export interface PosVariantModalProps {
  product: MerchantProduct | null;
  onClose: () => void;
  theme: ThemeType;
  onSelectVariant: (product: MerchantProduct, variant: ProductVariant) => void;
}

export const PosVariantModal: React.FC<PosVariantModalProps> = ({
  product,
  onClose,
  theme,
  onSelectVariant
}) => {
  if (!product) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0,0,0,0.65)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16
      }}
    >
      <div
        style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: 16,
          width: "100%",
          maxWidth: 380,
          padding: 18,
          boxShadow: "0 20px 40px rgba(0,0,0,0.25)"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: theme.ink }}>
            Pilih Varian Produk
          </h3>
          <button
            type="button"
            onClick={onClose}
            style={{ background: "transparent", border: "none", cursor: "pointer", color: theme.inkSoft }}
          >
            <X size={18} />
          </button>
        </div>
        <p style={{ margin: "0 0 14px", fontSize: 12, color: theme.inkSoft }}>
          {product.name}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {product.variants?.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => onSelectVariant(product, v)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                borderRadius: 10,
                border: `1px solid ${theme.border}`,
                background: theme.surface2,
                cursor: "pointer",
                textAlign: "left"
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 600, color: theme.ink }}>
                {v.name}
              </span>
              <span style={{ fontSize: 13, fontWeight: 700, color: theme.accent }}>
                Rp {v.price.toLocaleString("id-ID")}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

