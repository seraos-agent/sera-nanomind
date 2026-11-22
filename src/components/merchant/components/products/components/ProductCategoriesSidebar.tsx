import React, { useState } from "react";
import { FolderPlus, LayoutGrid, Tag, Trash2, X } from "lucide-react";
import type { ThemeType } from "../../../../../theme";
import type { MerchantProduct, StoreType } from "../../../types";

interface ProductCategoriesSidebarProps {
  theme: ThemeType;
  storeType: StoreType;
  categories: string[];
  customCategorySet: Set<string>;
  products: MerchantProduct[];
  activeFilter: string;
  onSelectCategory: (cat: string) => void;
  isAddingCategory: boolean;
  setIsAddingCategory: React.Dispatch<React.SetStateAction<boolean>>;
  newCategoryName: string;
  setNewCategoryName: (name: string) => void;
  onSaveCategory: (e: React.FormEvent) => void;
  onSetCategoryToDelete: (cat: string | null) => void;
}

export const ProductCategoriesSidebar: React.FC<ProductCategoriesSidebarProps> = ({
  theme,
  storeType,
  categories,
  customCategorySet,
  products,
  activeFilter,
  onSelectCategory,
  isAddingCategory,
  setIsAddingCategory,
  newCategoryName,
  setNewCategoryName,
  onSaveCategory,
  onSetCategoryToDelete
}) => {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [hoveredDeleteCat, setHoveredDeleteCat] = useState<string | null>(null);

  const allLabel =
    storeType === "FOOD"
      ? "All Menu"
      : storeType === "JASA"
        ? "All Services"
        : "All Products";

  const activeBg = theme.isDark ? theme.surface2 : theme.bg;

  const renderCategoryPill = (
    keyId: string,
    label: string,
    count: number,
    Icon: typeof LayoutGrid,
    isActive: boolean,
    onClick: () => void,
    canDelete: boolean
  ) => {
    const isHovered = hoveredKey === keyId;
    const isDeleteHovered = hoveredDeleteCat === keyId;

    return (
      <div
        key={keyId}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          borderRadius: 10,
          background: isActive ? activeBg : isHovered ? theme.surface2 : "transparent",
          border: `1px solid ${isActive ? theme.border : "transparent"}`,
          transition: "background 0.15s ease, border-color 0.15s ease"
        }}
        onMouseEnter={() => setHoveredKey(keyId)}
        onMouseLeave={() => setHoveredKey((prev) => (prev === keyId ? null : prev))}
      >
        <button
          type="button"
          onClick={onClick}
          aria-current={isActive ? "page" : undefined}
          style={{
            flex: 1,
            minWidth: 0,
            textAlign: "left",
            background: "transparent",
            border: "none",
            padding: "9px 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            cursor: "pointer"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}>
            <Icon
              size={15}
              color={isActive || isHovered ? theme.ink : theme.inkSoft}
              style={{ flexShrink: 0 }}
            />
            <span
              style={{
                fontSize: 13.5,
                fontWeight: isActive ? 600 : 500,
                color: isActive || isHovered ? theme.ink : theme.inkSoft,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              }}
            >
              {label}
            </span>
          </div>

          <span
            style={{
              fontSize: 11.5,
              fontWeight: isActive ? 700 : 500,
              color: isActive ? theme.ink : theme.inkFaint,
              flexShrink: 0
            }}
          >
            {count}
          </span>
        </button>

        {canDelete && (
          <button
            type="button"
            title={`Delete category "${label}"`}
            aria-label={`Delete category ${label}`}
            onClick={(e) => {
              e.stopPropagation();
              onSetCategoryToDelete(label);
            }}
            onMouseEnter={() => setHoveredDeleteCat(keyId)}
            onMouseLeave={() => setHoveredDeleteCat((prev) => (prev === keyId ? null : prev))}
            style={{
              background: isDeleteHovered ? "rgba(239, 68, 68, 0.12)" : "transparent",
              border: "none",
              borderRadius: 7,
              width: 28,
              height: 28,
              marginRight: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: isDeleteHovered ? "#EF4444" : theme.inkFaint,
              opacity: isHovered || isActive || isDeleteHovered ? 1 : 0.65,
              cursor: "pointer",
              flexShrink: 0,
              transition: "all 0.15s ease"
            }}
          >
            <Trash2 size={13.5} />
          </button>
        )}
      </div>
    );
  };

  return (
    <div
      style={{
        background: theme.surface,
        border: `1px solid ${theme.border}`,
        borderRadius: 18,
        padding: 12,
        display: "flex",
        flexDirection: "column",
        gap: 6,
        flexShrink: 0
      }}
    >
      {/* Header Row */}
      <div
        style={{
          padding: "4px 6px 6px 10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 700, color: theme.inkSoft }}>
          Categories
        </span>
        <button
          type="button"
          onClick={() => {
            if (isAddingCategory) {
              setIsAddingCategory(false);
              setNewCategoryName("");
            } else {
              setIsAddingCategory(true);
            }
          }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            padding: "4px 10px",
            borderRadius: 8,
            background: isAddingCategory ? theme.surface2 : "transparent",
            border: `1px solid ${theme.border}`,
            color: theme.ink,
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            flexShrink: 0
          }}
        >
          {isAddingCategory ? <X size={13} /> : <FolderPlus size={13} />}
          <span>{isAddingCategory ? "Close" : "Add"}</span>
        </button>
      </div>

      {/* Inline Add Category Form */}
      {isAddingCategory && (
        <form
          onSubmit={onSaveCategory}
          style={{
            padding: 10,
            borderRadius: 12,
            background: theme.bg,
            border: `1px solid ${theme.border}`,
            display: "flex",
            flexDirection: "column",
            gap: 8,
            marginBottom: 4
          }}
        >
          <input
            type="text"
            required
            autoFocus
            maxLength={80}
            placeholder={
              storeType === "FOOD"
                ? "Category name (e.g., Signature Tea)"
                : storeType === "JASA"
                  ? "Category name (e.g., Quick Repair)"
                  : "Category name (e.g., Essentials)"
            }
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "8px 10px",
              borderRadius: 8,
              border: `1px solid ${theme.border}`,
              background: theme.surface,
              color: theme.ink,
              fontSize: 12.5,
              outline: "none"
            }}
          />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
            <span style={{ fontSize: 10.5, color: newCategoryName.length >= 80 ? "#EF4444" : theme.inkFaint }}>
              {newCategoryName.length}/80 characters
            </span>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                type="button"
                onClick={() => {
                  setIsAddingCategory(false);
                  setNewCategoryName("");
                }}
                style={{
                  padding: "5px 10px",
                  borderRadius: 7,
                  background: theme.surface2,
                  border: `1px solid ${theme.border}`,
                  color: theme.inkSoft,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  padding: "5px 12px",
                  borderRadius: 7,
                  background: theme.ink,
                  border: "none",
                  color: theme.bg,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                Save
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Pill List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {renderCategoryPill(
          "ALL",
          allLabel,
          products.length,
          LayoutGrid,
          activeFilter === "ALL",
          () => onSelectCategory("ALL"),
          false
        )}

        {categories.map((cat) => {
          const count = products.filter((p) => p && p.category === cat).length;
          return renderCategoryPill(
            `cat:${cat}`,
            cat,
            count,
            Tag,
            activeFilter === cat,
            () => onSelectCategory(cat),
            customCategorySet.has(cat)
          );
        })}
      </div>

      {categories.length === 0 && !isAddingCategory && (
        <div style={{ padding: "8px 10px 4px", fontSize: 11.5, color: theme.inkFaint, lineHeight: 1.4 }}>
          No categories yet. Click Add to organize items.
        </div>
      )}
    </div>
  );
};
