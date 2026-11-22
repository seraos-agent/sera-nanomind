import React from "react";
import { Plus, FolderPlus } from "lucide-react";
import type { ThemeType } from "../../../../../theme";
import type { StoreType } from "../../../types";

interface ProductCategoryTabsProps {
  theme: ThemeType;
  storeType: StoreType;
  totalProducts: number;
  totalDrafts: number;
  totalCategories: number;
  selectedFilterCategory: string;
  onSelectTab: (tab: "ALL" | "DRAFT" | "KATEGORI") => void;
  isAddingCategory: boolean;
  onToggleAddCategory: () => void;
  onOpenAddProduct: () => void;
}

export const ProductCategoryTabs: React.FC<ProductCategoryTabsProps> = ({
  theme,
  storeType,
  totalProducts,
  totalDrafts,
  totalCategories,
  selectedFilterCategory,
  onSelectTab,
  isAddingCategory,
  onToggleAddCategory,
  onOpenAddProduct
}) => {
  return (
    <>
      {/* Action Buttons: Tambah Produk (Kiri) & Tambah Kategori (Kanan) Sejajar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          width: "100%"
        }}
      >
        {/* Tombol Kiri: Tambah Produk / Menu Baru */}
        <button
          type="button"
          onClick={onOpenAddProduct}
          style={{
            flex: 1,
            padding: "11px 14px",
            borderRadius: 12,
            background: theme.surface,
            color: theme.ink,
            border: `1px solid ${theme.border}`,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            whiteSpace: "nowrap",
            transition: "all 0.15s ease",
            minWidth: 0
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = theme.surface2;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = theme.surface;
          }}
        >
          <Plus size={16} color={theme.ink} style={{ flexShrink: 0 }} />
          <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
            {storeType === "JASA"
              ? "New Service"
              : storeType === "FOOD"
                ? "New Menu"
                : "New Product"}
          </span>
        </button>

        {/* Right Button: Add Category */}
        <button
          type="button"
          onClick={onToggleAddCategory}
          style={{
            flex: 1,
            padding: "11px 14px",
            borderRadius: 12,
            background:
              selectedFilterCategory === "KATEGORI" && isAddingCategory
                ? theme.surface2
                : theme.surface,
            color: theme.ink,
            border:
              selectedFilterCategory === "KATEGORI" && isAddingCategory
                ? `1px solid ${theme.ink}`
                : `1px solid ${theme.border}`,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            whiteSpace: "nowrap",
            transition: "all 0.15s ease",
            minWidth: 0
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = theme.surface2;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background =
              selectedFilterCategory === "KATEGORI" && isAddingCategory
                ? theme.surface2
                : theme.surface;
          }}
        >
          <FolderPlus size={16} color={theme.ink} style={{ flexShrink: 0 }} />
          <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
            {isAddingCategory ? "Close Form" : "Category"}
          </span>
        </button>
      </div>

      {/* Horizontal Tabs: Exactly 2 permanent tabs */}
      <div
        className="no-scrollbar"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          overflowX: "auto",
          paddingBottom: 4,
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch"
        }}
      >
        {/* Tab 1: Semua Produk Aktif */}
        <button
          type="button"
          onClick={() => onSelectTab("ALL")}
          style={{
            padding: "6px 14px",
            borderRadius: 20,
            border:
              selectedFilterCategory === "ALL"
                ? `1px solid ${theme.ink}`
                : `1px solid ${theme.border}`,
            background: theme.surface,
            color: selectedFilterCategory === "ALL" ? theme.ink : theme.inkSoft,
            fontSize: 12,
            fontWeight: selectedFilterCategory === "ALL" ? 700 : 500,
            cursor: "pointer",
            whiteSpace: "nowrap",
            display: "flex",
            alignItems: "center",
            gap: 6,
            transition: "all 0.15s ease"
          }}
        >
          <span>All</span>
          <span style={{ fontSize: 10, opacity: 0.8 }}>({totalProducts})</span>
        </button>

        {/* Tab 2: Drafts */}
        <button
          type="button"
          onClick={() => onSelectTab("DRAFT")}
          style={{
            padding: "6px 14px",
            borderRadius: 20,
            border:
              selectedFilterCategory === "DRAFT"
                ? `1px solid #D97706`
                : `1px solid ${theme.border}`,
            background:
              selectedFilterCategory === "DRAFT"
                ? "rgba(245, 158, 11, 0.12)"
                : theme.surface,
            color:
              selectedFilterCategory === "DRAFT" ? "#D97706" : theme.inkSoft,
            fontSize: 12,
            fontWeight: selectedFilterCategory === "DRAFT" ? 700 : 500,
            cursor: "pointer",
            whiteSpace: "nowrap",
            display: "flex",
            alignItems: "center",
            gap: 6,
            transition: "all 0.15s ease"
          }}
        >
          <span>Draft</span>
          <span style={{ fontSize: 10, opacity: 0.85 }}>({totalDrafts})</span>
        </button>

        {/* Tab 3: Categories */}
        <button
          type="button"
          onClick={() => onSelectTab("KATEGORI")}
          style={{
            padding: "6px 14px",
            borderRadius: 20,
            border:
              selectedFilterCategory === "KATEGORI"
                ? `1px solid ${theme.ink}`
                : `1px solid ${theme.border}`,
            background: theme.surface,
            color: selectedFilterCategory === "KATEGORI" ? theme.ink : theme.inkSoft,
            fontSize: 12,
            fontWeight: selectedFilterCategory === "KATEGORI" ? 700 : 500,
            cursor: "pointer",
            whiteSpace: "nowrap",
            display: "flex",
            alignItems: "center",
            gap: 6,
            transition: "all 0.15s ease"
          }}
        >
          <span>Categories</span>
          <span style={{ fontSize: 10, opacity: 0.8 }}>({totalCategories})</span>
        </button>
      </div>
    </>
  );
};

