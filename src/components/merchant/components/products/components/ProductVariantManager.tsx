import React, { useState, useEffect } from "react";
import { Plus, Trash2, AlertCircle } from "lucide-react";
import type { ThemeType } from "../../../../../theme";
import type { StoreType, ProductVariant } from "../../../types";
import { registerBackHandler } from "../../../../../utils/backButton";

interface ProductVariantManagerProps {
  theme: ThemeType;
  storeType: StoreType;
  hasVariants: boolean;
  setHasVariants: (v: boolean) => void;
  variants: ProductVariant[];
  setVariants: React.Dispatch<React.SetStateAction<ProductVariant[]>>;
  calculatedFinalPrice: number;
  prodStock: string;
}

export const ProductVariantManager: React.FC<ProductVariantManagerProps> = ({
  theme,
  storeType,
  hasVariants,
  setHasVariants,
  variants,
  setVariants,
  calculatedFinalPrice,
  prodStock
}) => {
  const [variantToDelete, setVariantToDelete] = useState<{
    variant: ProductVariant;
    index: number;
  } | null>(null);
  const [showLastVariantWarning, setShowLastVariantWarning] = useState(false);

  // Native Back Button Navigation for sub-modals
  useEffect(() => {
    const unregs: (() => void)[] = [];

    if (variantToDelete) {
      unregs.push(
        registerBackHandler("prod_del_var_modal", 85, () => {
          setVariantToDelete(null);
          return true;
        })
      );
    }

    if (showLastVariantWarning) {
      unregs.push(
        registerBackHandler("prod_warn_var_modal", 85, () => {
          setShowLastVariantWarning(false);
          return true;
        })
      );
    }

    return () => {
      unregs.forEach((u) => u());
    };
  }, [variantToDelete, showLastVariantWarning]);

  const handleToggleVariants = () => {
    const next = !hasVariants;
    setHasVariants(next);
    if (next && variants.length === 0) {
      const baseP = calculatedFinalPrice > 0 ? calculatedFinalPrice : 0;
      const cleanedStock = prodStock.replace(/\D/g, "");
      const parsedStock = cleanedStock ? parseInt(cleanedStock, 10) : undefined;
      setVariants([
        { id: `var-${Date.now()}-1`, name: "", price: baseP, stock: parsedStock }
      ]);
    }
  };

  return (
    <>
      {/* TOGGLE VARIAN PRODUK */}
      <div
        onClick={handleToggleVariants}
        style={{
          background: theme.surface2,
          border: `1px solid ${theme.border}`,
          borderRadius: 8,
          padding: "10px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          transition: "all 0.15s ease"
        }}
      >
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: theme.ink }}>
            Enable Variants
          </div>
          <div style={{ fontSize: 11, color: theme.inkSoft, marginTop: 2 }}>
            Sizes, portions, or flavors with separate pricing and stock
          </div>
        </div>
        <input
          type="checkbox"
          checked={hasVariants}
          onChange={() => {}}
          style={{ width: 17, height: 17, cursor: "pointer", accentColor: theme.accent }}
        />
      </div>

      {/* VARIANT LIST */}
      {hasVariants && (
        <div
          style={{
            background: theme.surface2,
            border: `1px solid ${theme.border}`,
            borderRadius: 10,
            padding: 12,
            display: "flex",
            flexDirection: "column",
            gap: 10
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: theme.ink }}>
              Variant Options
            </span>
            <span style={{ fontSize: 11, color: theme.inkSoft, fontWeight: 500 }}>
              {variants.length} Variants
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {variants.map((v, idx) => (
              <div
                key={v.id || idx}
                style={{
                  padding: 10,
                  borderRadius: 8,
                  background: theme.surface,
                  border: `1px solid ${theme.border}`,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8
                }}
              >
                {/* Row 1: Variant Name & Remove */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    type="text"
                    placeholder={
                      idx === 0
                        ? "Variant name (e.g., Regular / Size S)"
                        : "Variant name (e.g., Large / Size L)"
                    }
                    value={v.name}
                    onChange={(e) => {
                      const val = e.target.value;
                      setVariants((prev) =>
                        prev.map((item, i) => (i === idx ? { ...item, name: val } : item))
                      );
                    }}
                    style={{
                      flex: 1,
                      padding: "7px 10px",
                      borderRadius: 6,
                      border: `1px solid ${theme.border}`,
                      background: theme.surface2,
                      color: theme.ink,
                      fontSize: 12.5,
                      fontWeight: 600,
                      outline: "none",
                      boxSizing: "border-box"
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (variants.length <= 1) {
                        setShowLastVariantWarning(true);
                      } else {
                        setVariantToDelete({ variant: v, index: idx });
                      }
                    }}
                    title="Delete Variant"
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 6,
                      background: "transparent",
                      border: `1px solid ${theme.border}`,
                      color: theme.inkSoft,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      padding: 0,
                      flexShrink: 0
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.color = "#EF4444";
                      (e.currentTarget as HTMLElement).style.borderColor = "#EF444455";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.color = theme.inkSoft;
                      (e.currentTarget as HTMLElement).style.borderColor = theme.border;
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                {/* Row 2: Harga Jual | Modal | Stok */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      storeType === "JASA" ? "1fr 1fr" : "1fr 1fr 0.72fr",
                    gap: 8,
                    alignItems: "end"
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 10.5,
                        fontWeight: 600,
                        color: theme.inkSoft,
                        marginBottom: 3,
                        whiteSpace: "nowrap"
                      }}
                    >
                      Sell Price (Rp)
                    </div>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="Price"
                      value={v.price ? Number(v.price).toLocaleString("id-ID") : ""}
                      onChange={(e) => {
                        const clean = e.target.value.replace(/\D/g, "");
                        const val = clean ? parseInt(clean, 10) : 0;
                        setVariants((prev) =>
                          prev.map((item, i) => (i === idx ? { ...item, price: val } : item))
                        );
                      }}
                      onKeyDown={(e) => {
                        if (["e", "E", "+", "-", "."].includes(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      style={{
                        width: "100%",
                        padding: "7px 9px",
                        borderRadius: 6,
                        border: `1px solid ${theme.border}`,
                        background: theme.surface2,
                        color: theme.ink,
                        fontSize: 12,
                        fontWeight: 600,
                        outline: "none",
                        boxSizing: "border-box"
                      }}
                    />
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 10.5,
                        fontWeight: 600,
                        color: theme.inkSoft,
                        marginBottom: 3,
                        whiteSpace: "nowrap"
                      }}
                    >
                      Cost (Rp)
                    </div>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="Optional"
                      value={v.costPrice ? Number(v.costPrice).toLocaleString("id-ID") : ""}
                      onChange={(e) => {
                        const clean = e.target.value.replace(/\D/g, "");
                        const val = clean ? parseInt(clean, 10) : undefined;
                        setVariants((prev) =>
                          prev.map((item, i) => (i === idx ? { ...item, costPrice: val } : item))
                        );
                      }}
                      onKeyDown={(e) => {
                        if (["e", "E", "+", "-", "."].includes(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      style={{
                        width: "100%",
                        padding: "7px 9px",
                        borderRadius: 6,
                        border: `1px solid ${theme.border}`,
                        background: theme.surface2,
                        color: theme.ink,
                        fontSize: 12,
                        outline: "none",
                        boxSizing: "border-box"
                      }}
                    />
                  </div>

                  {storeType !== "JASA" && (
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 10.5,
                          fontWeight: 600,
                          color: theme.inkSoft,
                          marginBottom: 3,
                          whiteSpace: "nowrap"
                        }}
                      >
                        Stock
                      </div>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="Stock"
                        value={
                          v.stock !== undefined && v.stock !== null
                            ? Number(v.stock).toLocaleString("id-ID")
                            : ""
                        }
                        onChange={(e) => {
                          const clean = e.target.value.replace(/\D/g, "");
                          const val = clean ? parseInt(clean, 10) : 0;
                          setVariants((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, stock: val } : item))
                          );
                        }}
                        onKeyDown={(e) => {
                          if (["e", "E", "+", "-", "."].includes(e.key)) {
                            e.preventDefault();
                          }
                        }}
                        style={{
                          width: "100%",
                          padding: "7px 9px",
                          borderRadius: 6,
                          border: `1px solid ${theme.border}`,
                          background: theme.surface2,
                          color: theme.ink,
                          fontSize: 12,
                          outline: "none",
                          boxSizing: "border-box"
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 4
            }}
          >
            <button
              type="button"
              onClick={() => {
                setVariants((prev) => [
                  ...prev,
                  {
                    id: `var-${Date.now()}-${prev.length + 1}`,
                    name: "",
                    price: 0,
                    stock: undefined
                  }
                ]);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "6px 12px",
                borderRadius: 6,
                background: theme.surface,
                border: `1px solid ${theme.border}`,
                color: theme.ink,
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              <Plus size={13} />
              <span>Add Variant</span>
            </button>

            {storeType !== "JASA" && (
              <div style={{ fontSize: 11, color: theme.inkSoft, textAlign: "right" }}>
                Total Stock:{" "}
                <strong style={{ color: theme.ink }}>
                  {variants.reduce((acc, curr) => acc + (curr.stock || 0), 0)}
                </strong>
              </div>
            )}
          </div>
        </div>
      )}

      {/* REMOVE VARIANT CONFIRMATION MODAL */}
      {variantToDelete && (
        <div
          onClick={() => setVariantToDelete(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(4px)",
            zIndex: 150,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: theme.surface,
              border: `1px solid ${theme.border}`,
              borderRadius: 16,
              width: "100%",
              maxWidth: 360,
              padding: 22,
              boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              boxSizing: "border-box"
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: "#EF444415",
                color: "#EF4444",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 14
              }}
            >
              <Trash2 size={24} />
            </div>

            <h3 style={{ margin: "0 0 12px 0", fontSize: 16, fontWeight: 700, color: theme.ink }}>
              Delete Variant?
            </h3>

            <div
              style={{
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
              }}
            >
              "{variantToDelete.variant.name || `Option #${variantToDelete.index + 1}`}"
            </div>

            <p
              style={{
                margin: "0 0 20px 0",
                fontSize: 12,
                lineHeight: 1.5,
                color: theme.inkSoft
              }}
            >
              This variant will be removed from the product options list.
            </p>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                width: "100%",
                boxSizing: "border-box"
              }}
            >
              <button
                type="button"
                onClick={() => setVariantToDelete(null)}
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
                onClick={() => {
                  setVariants((prev) => prev.filter((_, i) => i !== variantToDelete.index));
                  setVariantToDelete(null);
                }}
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
      )}

      {/* POPUP PERINGATAN VARIAN TERAKHIR */}
      {showLastVariantWarning && (
        <div
          onClick={() => setShowLastVariantWarning(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(4px)",
            zIndex: 150,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
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
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: "#F59E0B15",
                color: "#F59E0B",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 14
              }}
            >
              <AlertCircle size={24} />
            </div>

            <h3 style={{ margin: "0 0 8px 0", fontSize: 16, fontWeight: 700, color: theme.ink }}>
              Last Remaining Variant
            </h3>

            <p
              style={{
                margin: "0 0 20px 0",
                fontSize: 12,
                lineHeight: 1.5,
                color: theme.inkSoft
              }}
            >
              At least 1 active variant is required while variants are enabled. If this product has
              no variants, you can turn off the variant feature.
            </p>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                width: "100%",
                boxSizing: "border-box"
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setHasVariants(false);
                  setVariants([]);
                  setShowLastVariantWarning(false);
                }}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: 8,
                  background: `${theme.accent}15`,
                  color: theme.accent,
                  border: `1px solid ${theme.accent}30`,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer"
                }}
              >
                Disable Variants Feature
              </button>
              <button
                type="button"
                onClick={() => setShowLastVariantWarning(false)}
                style={{
                  width: "100%",
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
                Keep Using Variants
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

