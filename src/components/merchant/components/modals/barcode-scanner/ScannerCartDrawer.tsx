import React, { useState } from "react";
import { X, Check, ShoppingCart, Trash2, Plus, Minus } from "lucide-react";
import type { ThemeType } from "../../../../../theme";
import type { PosCartItem } from "../../../types";

interface ScannerCartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeType;
  cartItems?: PosCartItem[];
  totalCount: number;
  totalAmount: number;
  productDiscountTotal: number;
  manualDiscountNominal: number;
  onUpdateManualDiscount?: (val: number) => void;
  onUpdateQty?: (index: number, nextQty: number) => void;
  onRemoveItem?: (index: number) => void;
  onClearCart?: () => void;
  onProceedToPayment?: () => void;
}

export const ScannerCartDrawer: React.FC<ScannerCartDrawerProps> = ({
  isOpen,
  onClose,
  theme,
  cartItems,
  totalCount,
  totalAmount,
  productDiscountTotal,
  manualDiscountNominal,
  onUpdateManualDiscount,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  onProceedToPayment,
}) => {
  const [showDiscountInput, setShowDiscountInput] = useState(false);
  const totalDiscount = (productDiscountTotal || 0) + (manualDiscountNominal || 0);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop Overlay */}
      <div
        onClick={onClose}
        onTouchMove={(e) => e.preventDefault()}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.55)",
          zIndex: 40,
          backdropFilter: "blur(3px)",
          touchAction: "none",
        }}
      />

      {/* Cart Drawer */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          maxHeight: "85vh",
          height: "auto",
          display: "flex",
          flexDirection: "column",
          background: theme.surface,
          borderTopLeftRadius: 22,
          borderTopRightRadius: 22,
          borderTop: `1px solid ${theme.border}`,
          boxShadow: "0 -10px 40px rgba(0, 0, 0, 0.35)",
          zIndex: 50,
          animation: "slideUpDrawer 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Drag Handle */}
        <div
          onClick={onClose}
          title="Close Cart"
          style={{
            width: "100%",
            padding: "10px 0 6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            userSelect: "none",
          }}
        >
          <div
            style={{
              width: 38,
              height: 4.5,
              borderRadius: 3,
              background: theme.inkFaint,
              opacity: 0.7,
              transition: "all 0.15s ease",
            }}
          />
        </div>

        {/* Drawer Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "6px 18px 12px",
            borderBottom: `1px solid ${theme.border}`,
          }}
        >
          <div>
            <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: theme.ink }}>
              POS Cart ({totalCount})
            </h4>
          </div>

          {cartItems && cartItems.length > 0 && onClearCart && (
            <button
              type="button"
              onClick={onClearCart}
              title="Clear Cart"
              style={{
                background: "transparent",
                border: "none",
                color: "#EF4444",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                padding: "4px 8px",
              }}
            >
              Reset
            </button>
          )}
        </div>

        {/* Drawer Item List */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
            padding: "12px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {!cartItems || cartItems.length === 0 ? (
            <div style={{ textAlign: "center", padding: "36px 16px", color: theme.inkSoft }}>
              <ShoppingCart size={36} style={{ margin: "0 auto 8px", opacity: 0.4 }} />
              <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>No products in cart yet</p>
            </div>
          ) : (
            cartItems.map((item, idx) => {
              const itemPrice = item.variant ? item.variant.price : item.product.price;
              return (
                <div
                  key={`${item.product.id}-${item.variant?.id || "base"}-${idx}`}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 12,
                    background: theme.surface2,
                    border: `1px solid ${theme.border}`,
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  {/* Top Line: Product Info & Single Trash Delete Button */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: 10,
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 13.5,
                          fontWeight: 600,
                          color: theme.ink,
                          wordBreak: "break-word",
                          lineHeight: 1.35,
                        }}
                      >
                        {item.product.name}
                      </div>
                      {item.variant && (
                        <div style={{ fontSize: 11, color: theme.inkSoft, marginTop: 1 }}>
                          Variant: {item.variant.name}
                        </div>
                      )}
                      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 2 }}>
                        <span style={{ fontSize: 11.5, color: theme.inkSoft }}>
                          @ Rp {itemPrice.toLocaleString("id-ID")}
                        </span>
                        {!item.variant &&
                          item.product.originalPrice &&
                          item.product.originalPrice > item.product.price && (
                            <span
                              style={{
                                fontSize: 10.5,
                                color: theme.inkSoft,
                                textDecoration: "line-through",
                              }}
                            >
                              Rp {item.product.originalPrice.toLocaleString("id-ID")}
                            </span>
                          )}
                      </div>
                    </div>

                    {/* Trash Delete Button */}
                    {onRemoveItem && (
                      <button
                        type="button"
                        onClick={() => onRemoveItem(idx)}
                        title="Remove item"
                        style={{
                          background: "transparent",
                          border: "none",
                          color: theme.inkFaint,
                          cursor: "pointer",
                          padding: "4px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: 6,
                          transition: "color 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.color = "#EF4444";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.color = theme.inkFaint;
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>

                  {/* Bottom Line: Subtotal & Stepper */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingTop: 6,
                      borderTop: `1px solid ${theme.border}`,
                    }}
                  >
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: theme.ink }}>
                      Rp {item.subtotal.toLocaleString("id-ID")}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        background: theme.surface,
                        borderRadius: 8,
                        border: `1px solid ${theme.border}`,
                        padding: "3px 6px",
                      }}
                    >
                      <button
                        type="button"
                        disabled={item.quantity <= 1}
                        onClick={() => onUpdateQty && onUpdateQty(idx, Math.max(1, item.quantity - 1))}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: item.quantity <= 1 ? theme.inkFaint : theme.ink,
                          cursor: item.quantity <= 1 ? "not-allowed" : "pointer",
                          width: 22,
                          height: 22,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: 0,
                        }}
                      >
                        <Minus size={13} />
                      </button>

                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          minWidth: 20,
                          textAlign: "center",
                          color: theme.ink,
                        }}
                      >
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() => onUpdateQty && onUpdateQty(idx, item.quantity + 1)}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: theme.ink,
                          cursor: "pointer",
                          width: 22,
                          height: 22,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: 0,
                        }}
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer Actions */}
        <div
          style={{
            padding: "12px 16px 18px",
            borderTop: `1px solid ${theme.border}`,
            background: theme.surface,
            display: "flex",
            flexDirection: "column",
            gap: 10,
            flexShrink: 0,
          }}
        >
          {/* Discount Section */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: theme.inkSoft }}>Order Discount</span>

            {!showDiscountInput ? (
              <div
                style={{
                  cursor: onUpdateManualDiscount ? "pointer" : "default",
                  padding: "2px 4px",
                  borderRadius: 6,
                }}
                onClick={() => {
                  if (onUpdateManualDiscount) setShowDiscountInput(true);
                }}
                title="Click to edit discount amount"
              >
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: totalDiscount > 0 ? "#10B981" : theme.inkSoft,
                  }}
                >
                  {totalDiscount > 0
                    ? `-Rp ${totalDiscount.toLocaleString("id-ID")}`
                    : "Rp 0"}
                </span>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ fontSize: 11, color: theme.inkSoft, fontWeight: 600 }}>Rp</span>
                <input
                  type="text"
                  inputMode="numeric"
                  autoFocus
                  value={manualDiscountNominal ? manualDiscountNominal.toLocaleString("id-ID") : ""}
                  placeholder="0"
                  onChange={(e) => {
                    const val = parseInt(e.target.value.replace(/[^0-9]/g, ""), 10) || 0;
                    if (onUpdateManualDiscount) onUpdateManualDiscount(val);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") setShowDiscountInput(false);
                  }}
                  style={{
                    width: 85,
                    padding: "3px 6px",
                    fontSize: 12,
                    borderRadius: 6,
                    border: `1px solid ${theme.border}`,
                    background: theme.surface2,
                    color: theme.ink,
                    textAlign: "right",
                    outline: "none",
                  }}
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDiscountInput(false);
                  }}
                  title="Done"
                  style={{
                    background: `${theme.accent}14`,
                    border: "none",
                    color: theme.accent,
                    cursor: "pointer",
                    padding: "4px",
                    borderRadius: 4,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Check size={13} />
                </button>
                {(manualDiscountNominal || 0) > 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onUpdateManualDiscount) onUpdateManualDiscount(0);
                      setShowDiscountInput(false);
                    }}
                    title="Remove manual discount"
                    style={{
                      background: "#EF444414",
                      border: "none",
                      color: "#EF4444",
                      cursor: "pointer",
                      padding: "4px",
                      borderRadius: 4,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Total Tagihan Row */}
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              paddingTop: 8,
              borderTop: `1px dashed ${theme.border}`,
            }}
          >
            <span style={{ fontSize: 13, color: theme.ink, fontWeight: 700 }}>
              Total Due ({totalCount} items)
            </span>
            <span style={{ fontSize: 18, fontWeight: 800, color: theme.ink, letterSpacing: -0.3 }}>
              Rp {totalAmount.toLocaleString("id-ID")}
            </span>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: 10,
                border: `1px solid ${theme.border}`,
                background: theme.surface2,
                color: theme.ink,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Continue Scan
            </button>

            <button
              type="button"
              disabled={totalCount <= 0}
              onClick={onProceedToPayment}
              style={{
                flex: 1.5,
                padding: "12px",
                borderRadius: 10,
                border: "none",
                background: totalCount > 0 ? "#2563EB" : theme.border,
                color: totalCount > 0 ? "#FFFFFF" : theme.inkSoft,
                fontSize: 13,
                fontWeight: 700,
                cursor: totalCount > 0 ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: totalCount > 0 ? "0 2px 6px rgba(0, 0, 0, 0.12)" : "none",
              }}
            >
              <span>Pay Now</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
