import React from "react";
import { ChevronLeft } from "lucide-react";
import type { ThemeType } from "../../../../../theme";
import type { MerchantProduct } from "../../../types";
import { ProductCard } from "./ProductCard";

interface ProductCategoryDetailProps {
  theme: ThemeType;
  categoryName: string;
  products: MerchantProduct[];
  isMobileView?: boolean;
  onBack: () => void;
  onOpenAddProduct: (category?: string) => void;
  onEditProduct: (product: MerchantProduct) => void;
  onDeleteProduct: (product: MerchantProduct) => void;
}

export const ProductCategoryDetail: React.FC<ProductCategoryDetailProps> = ({
  theme,
  categoryName,
  products,
  isMobileView,
  onBack,
  onOpenAddProduct,
  onEditProduct,
  onDeleteProduct
}) => {
  const categoryProducts = (products || []).filter((p) => p && p.category === categoryName);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Header Navigasi Detail Kategori */}
      <div
        style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: 14,
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 10
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            type="button"
            onClick={onBack}
            title="Kembali ke Daftar Kategori"
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              border: `1px solid ${theme.border}`,
              background: theme.surface2,
              color: theme.ink,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.15s ease"
            }}
          >
            <ChevronLeft size={18} />
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: theme.ink }}>
              {categoryName}
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: theme.ink,
                background: theme.surface2,
                border: `1px solid ${theme.border}`,
                padding: "2px 8px",
                borderRadius: 12
              }}
            >
              {categoryProducts.length} Produk
            </span>
          </div>
        </div>
      </div>

      {/* Daftar Produk di Kategori Ini */}
      {categoryProducts.length === 0 ? (
        <div
          style={{
            padding: 36,
            borderRadius: 12,
            border: `1px dashed ${theme.border}`,
            background: theme.surface,
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 10
          }}
        >
          <div style={{ fontSize: 32 }}>📦</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: theme.ink }}>
            Belum ada produk di kategori "{categoryName}"
          </div>
          <p style={{ margin: 0, fontSize: 11, color: theme.inkSoft }}>
            Tambahkan produk baru ke dalam kategori ini agar pembeli dapat menemukannya.
          </p>
          <button
            type="button"
            onClick={() => onOpenAddProduct(categoryName)}
            style={{
              marginTop: 6,
              padding: "8px 16px",
              borderRadius: 8,
              background: theme.accent,
              color: "#FFFFFF",
              border: "none",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            + Tambah Produk Sekarang
          </button>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobileView
              ? "repeat(2, 1fr)"
              : "repeat(auto-fill, minmax(210px, 1fr))",
            gap: 12,
            contain: "layout paint"
          }}
        >
          {categoryProducts.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              theme={theme}
              isMobileView={isMobileView}
              onEdit={onEditProduct}
              onDelete={onDeleteProduct}
            />
          ))}
        </div>
      )}
    </div>
  );
};

