import React from "react";
import { FolderPlus, Trash2 } from "lucide-react";
import type { ThemeType } from "../../../../../theme";
import type { StoreType, MerchantProduct } from "../../../types";

interface ProductCategoryManagerProps {
  theme: ThemeType;
  storeType: StoreType;
  isMobileView?: boolean;
  categories: string[];
  products: MerchantProduct[];
  isAddingCategory: boolean;
  setIsAddingCategory: React.Dispatch<React.SetStateAction<boolean>>;
  newCategoryName: string;
  setNewCategoryName: (name: string) => void;
  onSaveCategory: (e: React.FormEvent) => void;
  onSelectCategoryDetail: (cat: string) => void;
  onSetCategoryToDelete: (cat: string | null) => void;
}

export const ProductCategoryManager: React.FC<ProductCategoryManagerProps> = ({
  theme,
  storeType,
  isMobileView,
  categories,
  products,
  isAddingCategory,
  setIsAddingCategory,
  newCategoryName,
  setNewCategoryName,
  onSaveCategory,
  onSelectCategoryDetail,
  onSetCategoryToDelete
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12
      }}
    >
      {/* Form Tambah Kategori */}
      {isAddingCategory && (
        <form
          onSubmit={onSaveCategory}
          style={{
            background: theme.surface,
            border: `1px solid ${theme.accent}35`,
            borderRadius: 14,
            padding: isMobileView ? "14px 14px" : "16px 18px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
            boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
            boxSizing: "border-box",
            width: "100%",
            maxWidth: "100%"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <FolderPlus size={16} color={theme.ink} />
            <span style={{ fontSize: 13, fontWeight: 700, color: theme.ink }}>
              Add New Category
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4, width: "100%" }}>
            <textarea
              required
              autoFocus
              rows={2}
              maxLength={80}
              placeholder={
                storeType === "FOOD"
                  ? "Category name (e.g., Fresh Beverages...)"
                  : storeType === "JASA"
                    ? "Category name (e.g., Quick Repairs...)"
                    : "Category name (e.g., Cooking Essentials...)"
              }
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value.replace(/[\r\n]/g, ""))}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onSaveCategory(e);
                }
              }}
              style={{
                width: "100%",
                minWidth: 0,
                boxSizing: "border-box",
                padding: "10px 14px",
                borderRadius: 10,
                border: `1px solid ${theme.border}`,
                background: theme.bg,
                color: theme.ink,
                fontSize: 13,
                fontFamily: "inherit",
                lineHeight: 1.4,
                resize: "none",
                outline: "none",
                wordBreak: "break-word",
                transition: "border-color 0.15s ease"
              }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                paddingRight: 2
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  color: newCategoryName.length >= 80 ? "#EF4444" : theme.inkSoft,
                  fontWeight: newCategoryName.length >= 80 ? 600 : 400
                }}
              >
                {newCategoryName.length}/80 karakter
              </span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 8,
              width: "100%",
              boxSizing: "border-box"
            }}
          >
            <button
              type="button"
              onClick={() => {
                setIsAddingCategory(false);
                setNewCategoryName("");
              }}
              style={{
                flex: isMobileView ? 1 : "none",
                padding: isMobileView ? "9px 12px" : "8px 16px",
                borderRadius: 8,
                background: theme.surface2,
                color: theme.inkSoft,
                border: `1px solid ${theme.border}`,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxSizing: "border-box"
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                flex: isMobileView ? 1 : "none",
                padding: isMobileView ? "9px 16px" : "8px 20px",
                borderRadius: 8,
                background: theme.accent,
                color: "#FFFFFF",
                border: "none",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxSizing: "border-box",
                boxShadow: "0 2px 6px rgba(0,0,0,0.08)"
              }}
            >
              Save
            </button>
          </div>
        </form>
      )}

      {/* Category List */}
      {categories.length === 0 ? (
        <div
          style={{
            padding: 36,
            borderRadius: 12,
            background: theme.surface,
            border: `1px dashed ${theme.border}`,
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: `${theme.accent}12`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: theme.accent
            }}
          >
            <FolderPlus size={20} />
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: theme.ink }}>
            No Categories Created Yet
          </div>
          <div style={{ fontSize: 11, color: theme.inkSoft, maxWidth: 380 }}>
            All products currently appear in the main catalog (All). You can create
            categories using the button above.
          </div>
          {!isAddingCategory && (
            <button
              type="button"
              onClick={() => setIsAddingCategory(true)}
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
              + Add Category Now
            </button>
          )}
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8
          }}
        >
          {categories.map((cat) => {
            const count = (products || []).filter((p) => p && p.category === cat).length;
            return (
              <div
                key={cat}
                style={{
                  background: theme.bg,
                  border: `1px solid ${theme.border}`,
                  borderRadius: 10,
                  padding: "12px 16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: theme.ink,
                      wordBreak: "break-word",
                      lineHeight: 1.35
                    }}
                  >
                    {cat}
                  </div>
                  <div style={{ fontSize: 11, color: theme.inkSoft, marginTop: 2 }}>
                    {count} products
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => onSelectCategoryDetail(cat)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 6,
                      background: theme.surface,
                      border: `1px solid ${theme.border}`,
                      color: theme.ink,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      transition: "all 0.15s ease"
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = theme.surface2;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = theme.surface;
                    }}
                  >
                    View Products
                  </button>
                  <button
                    type="button"
                    onClick={() => onSetCategoryToDelete(cat)}
                    title={`Delete category "${cat}"`}
                    style={{
                      padding: "6px 8px",
                      borderRadius: 6,
                      background: "#EF444410",
                      border: "1px solid #EF444425",
                      color: "#EF4444",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.15s ease"
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

