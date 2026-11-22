import React from "react";
import { createPortal } from "react-dom";
import { ShoppingBag, Minus, Plus, Trash2, Check, X } from "lucide-react";
import type { ThemeType } from "../../../../../theme";
import type { PosCartItem, StoreType } from "../../../types";

export interface PosCartDrawerProps {
  theme: ThemeType;
  isMobileView?: boolean;
  isActive?: boolean;
  cart: PosCartItem[];
  mobileCartOpen: boolean;
  onSetMobileCartOpen: (open: boolean) => void;
  totalItemCount: number;
  finalTotal: number;
  totalDiscount: number;
  manualDiscountNominal: number;
  showDiscountInput: boolean;
  onSetManualDiscountNominal: (val: number) => void;
  onSetShowDiscountInput: (show: boolean) => void;
  onUpdateQuantity: (idx: number, nextQty: number) => void;
  onRemoveFromCart: (idx: number) => void;
  onClearCart: () => void;
  onOpenPayment: () => void;
  allowManualDiscount?: boolean;
  taxAmount?: number;
  taxLabel?: string;
  serviceChargeAmount?: number;
  serviceChargeLabel?: string;
  onUpdateItemNote?: (idx: number, note: string) => void;
  cartTopSlot?: React.ReactNode;
  secondaryActionSlot?: React.ReactNode;
  storeType?: StoreType;
  foodOrderType?: "DINE_IN" | "TAKEAWAY";
}

export const PosCartDrawer: React.FC<PosCartDrawerProps> = ({
  theme,
  isMobileView,
  isActive = true,
  cart,
  mobileCartOpen,
  onSetMobileCartOpen,
  totalItemCount,
  finalTotal,
  totalDiscount,
  manualDiscountNominal,
  showDiscountInput,
  onSetManualDiscountNominal,
  onSetShowDiscountInput,
  onUpdateQuantity,
  onRemoveFromCart,
  onClearCart,
  onOpenPayment,
  allowManualDiscount = true,
  taxAmount = 0,
  taxLabel = "Pajak",
  serviceChargeAmount = 0,
  serviceChargeLabel = "Service Charge",
  onUpdateItemNote,
  cartTopSlot,
  secondaryActionSlot,
  storeType,
  foodOrderType = "DINE_IN"
}) => {
  if (isActive === false) return null;
  const content = (
    <>
      {(!isMobileView || mobileCartOpen) && (
        <>
          {/* Mobile Backdrop Overlay (Clicking outside closes modal, prevents background touch scroll) */}
          {isMobileView && (
            <div
              onClick={() => onSetMobileCartOpen(false)}
              onTouchMove={(e) => e.preventDefault()}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0, 0, 0, 0.55)",
                backdropFilter: "blur(2px)",
                zIndex: 995,
                touchAction: "none"
              }}
            />
          )}

          <div
            style={{
              width: isMobileView ? "100%" : 360,
              flexShrink: 0,
              background: theme.surface,
              border: isMobileView ? "none" : `1px solid ${theme.border}`,
              borderTop: isMobileView ? `1px solid ${theme.border}` : undefined,
              borderRadius: isMobileView ? "22px 22px 0 0" : 16,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              maxHeight: isMobileView ? "85vh" : "calc(100vh - 140px)",
              position: isMobileView ? "fixed" : "sticky",
              bottom: isMobileView ? 0 : undefined,
              left: isMobileView ? 0 : undefined,
              right: isMobileView ? 0 : undefined,
              top: isMobileView ? undefined : 20,
              zIndex: isMobileView ? 999 : 5,
              boxShadow: isMobileView ? "0 -10px 40px rgba(0,0,0,0.35)" : "none",
              animation: isMobileView ? "slideUpDrawer 0.22s cubic-bezier(0.16, 1, 0.3, 1)" : undefined
            }}
          >
            {/* Drag Handle on Mobile (Click to Close Drawer) */}
            {isMobileView && (
              <div
                onClick={() => onSetMobileCartOpen(false)}
                title="Close Cart"
                style={{
                  width: "100%",
                  padding: "10px 0 6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  userSelect: "none"
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 4.5,
                    borderRadius: 3,
                    background: theme.inkFaint,
                    opacity: 0.7,
                    transition: "all 0.15s ease"
                  }}
                />
              </div>
            )}

            {/* Cart Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: isMobileView ? "6px 18px 12px" : "14px 16px",
                borderBottom: `1px solid ${theme.border}`,
                background: isMobileView ? theme.surface : theme.surface2
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: isMobileView ? 15 : 14, fontWeight: 700, color: theme.ink }}>
                  {storeType === "FOOD"
                    ? foodOrderType === "TAKEAWAY"
                      ? `Takeaway Order (${totalItemCount})`
                      : `Table Order (${totalItemCount})`
                    : storeType === "JASA"
                      ? `Service Order (${totalItemCount})`
                      : `POS Cart (${totalItemCount})`}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {cart.length > 0 && (
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
                      padding: "4px 8px"
                    }}
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* Optional Top Slot (e.g. Table Selector for FOOD) */}
            {cartTopSlot}

            {/* Cart Items List */}
            <div
              style={{
                flex: 1,
                minHeight: 0,
                maxHeight: isMobileView ? "calc(85vh - 230px)" : "calc(100vh - 380px)",
                overflowY: "auto",
                overscrollBehavior: "contain",
                WebkitOverflowScrolling: "touch",
                padding: isMobileView ? "12px 16px" : "12px 14px",
                display: "flex",
                flexDirection: "column",
                gap: 10
              }}
            >
              {cart.length === 0 ? (
                <div
                  style={{
                    padding: "40px 16px",
                    textAlign: "center",
                    color: theme.inkSoft
                  }}
                >
                  <ShoppingBag size={40} style={{ opacity: 0.3, marginBottom: 10 }} />
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>
                    {storeType === "FOOD"
                      ? foodOrderType === "TAKEAWAY"
                        ? "Takeaway order is empty"
                        : "Table has no items yet"
                      : storeType === "JASA"
                        ? "No services selected yet"
                        : "Cart is empty"}
                  </p>
                  <p style={{ margin: "4px 0 0", fontSize: 11 }}>
                    {storeType === "FOOD"
                      ? "Tap food or drink items to start an order"
                      : storeType === "JASA"
                        ? "Select service packages to add to the order"
                        : "Tap products on the left or scan a product barcode"}
                  </p>
                </div>
              ) : (
                cart.map((item, idx) => (
                  <div
                    key={`${item.product.id}-${item.variant?.id || "base"}`}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                      padding: "8px 10px",
                      background: theme.surface2,
                      border: `1px solid ${theme.border}`,
                      borderRadius: 10
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 8
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: theme.ink,
                            wordBreak: "break-word",
                            lineHeight: 1.35
                          }}
                        >
                          {item.product.name}
                        </div>
                        {item.variant && (
                          <div style={{ fontSize: 11, color: theme.inkSoft }}>
                            Variant: {item.variant.name}
                          </div>
                        )}
                        <div style={{ display: "flex", alignItems: "baseline", gap: 5, marginTop: 2 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: theme.accent }}>
                            Rp {item.subtotal.toLocaleString("id-ID")}
                          </span>
                          {!item.variant && item.product.originalPrice && item.product.originalPrice > item.product.price && (
                            <span style={{ fontSize: 10, color: theme.inkSoft, textDecoration: "line-through" }}>
                              Rp {(item.product.originalPrice * item.quantity).toLocaleString("id-ID")}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Stepper */}
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(idx, item.quantity - 1)}
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: 6,
                            border: `1px solid ${theme.border}`,
                            background: theme.surface,
                            color: theme.ink,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer"
                          }}
                        >
                          <Minus size={13} />
                        </button>
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: theme.ink,
                            minWidth: 20,
                            textAlign: "center"
                          }}
                        >
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(idx, item.quantity + 1)}
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: 6,
                            border: `1px solid ${theme.border}`,
                            background: theme.surface,
                            color: theme.ink,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer"
                          }}
                        >
                          <Plus size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onRemoveFromCart(idx)}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#EF4444",
                            cursor: "pointer",
                            padding: 4,
                            marginLeft: 2
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    {onUpdateItemNote && (
                      <textarea
                        rows={Math.min(3, Math.max(1, (item.notes || "").split("\n").length, Math.ceil((item.notes || "").length / 36)))}
                        maxLength={120}
                        value={item.notes || ""}
                        onChange={(e) => onUpdateItemNote(idx, e.target.value)}
                        placeholder="+ Note"
                        style={{
                          width: "100%",
                          padding: "5px 8px",
                          borderRadius: 6,
                          border: `1px solid ${theme.border}`,
                          background: theme.surface,
                          color: theme.ink,
                          fontSize: 11,
                          fontFamily: "inherit",
                          lineHeight: 1.35,
                          resize: "none",
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                          overflowWrap: "anywhere",
                          outline: "none",
                          boxSizing: "border-box"
                        }}
                      />
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Cart Footer & Bill Summary */}
            <div
              style={{
                borderTop: `1px solid ${theme.border}`,
                padding: "14px 16px",
                background: theme.surface2,
                display: "flex",
                flexDirection: "column",
                gap: 10,
                flexShrink: 0
              }}
            >
              {/* Discount Section */}
              {(allowManualDiscount || totalDiscount > 0) && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: theme.inkSoft }}>Order Discount</span>

                  {!allowManualDiscount ? (
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#10B981" }}>
                      -Rp {totalDiscount.toLocaleString("id-ID")}
                    </span>
                  ) : !showDiscountInput ? (
                    <div
                      style={{
                        cursor: "pointer",
                        padding: "2px 4px",
                        borderRadius: 6
                      }}
                      onClick={() => onSetShowDiscountInput(true)}
                      title="Click to edit discount amount"
                    >
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: totalDiscount > 0 ? "#10B981" : theme.inkSoft
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
                          onSetManualDiscountNominal(val);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") onSetShowDiscountInput(false);
                        }}
                        style={{
                          width: 85,
                          padding: "3px 6px",
                          fontSize: 12,
                          borderRadius: 6,
                          border: `1px solid ${theme.border}`,
                          background: theme.surface,
                          color: theme.ink,
                          textAlign: "right",
                          outline: "none"
                        }}
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSetShowDiscountInput(false);
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
                          alignItems: "center"
                        }}
                      >
                        <Check size={13} />
                      </button>
                      {manualDiscountNominal > 0 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSetManualDiscountNominal(0);
                            onSetShowDiscountInput(false);
                          }}
                          title="Clear manual discount"
                          style={{
                            background: "#EF444414",
                            border: "none",
                            color: "#EF4444",
                            cursor: "pointer",
                            padding: "4px",
                            borderRadius: 4,
                            display: "flex",
                            alignItems: "center"
                          }}
                        >
                          <X size={13} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {taxAmount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: theme.inkSoft }}>{taxLabel}</span>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: theme.ink }}>
                    Rp {taxAmount.toLocaleString("id-ID")}
                  </span>
                </div>
              )}

              {serviceChargeAmount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: theme.inkSoft }}>{serviceChargeLabel}</span>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: theme.ink }}>
                    Rp {serviceChargeAmount.toLocaleString("id-ID")}
                  </span>
                </div>
              )}

              {/* Total Row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  paddingTop: 6,
                  borderTop: `1px dashed ${theme.border}`
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 700, color: theme.ink }}>
                  Total Due
                </span>
                <span
                  style={{
                    fontSize: 20,
                    fontWeight: 800,
                    color: theme.ink,
                    letterSpacing: -0.5
                  }}
                >
                  Rp {finalTotal.toLocaleString("id-ID")}
                </span>
              </div>

              {/* Pay & Hold Action Buttons */}
              <div style={{ display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
                {secondaryActionSlot}
                <button
                  type="button"
                  disabled={cart.length === 0}
                  onClick={onOpenPayment}
                  style={{
                    flex: 1,
                    minWidth: 125,
                    padding: "11px 12px",
                    borderRadius: 12,
                    background: cart.length > 0 ? "#2563EB" : theme.border,
                    color: cart.length > 0 ? "#FFFFFF" : theme.inkSoft,
                    border: "none",
                    fontSize: 13.5,
                    fontWeight: 700,
                    cursor: cart.length > 0 ? "pointer" : "not-allowed",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    whiteSpace: "nowrap",
                    boxShadow: cart.length > 0 ? "0 2px 6px rgba(0, 0, 0, 0.12)" : "none",
                    transition: "all 0.15s ease"
                  }}
                >
                  <span>Pay Now</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Mobile Floating Action Button (FAB) - Option A: Pure Circle with Product Count Badge */}
      {isMobileView && !mobileCartOpen && (
        <button
          type="button"
          onClick={() => onSetMobileCartOpen(true)}
          title="POS Cart"
          style={{
            position: "fixed",
            bottom: 22,
            right: 20,
            zIndex: 90,
            width: 54,
            height: 54,
            borderRadius: "50%",
            background: totalItemCount > 0 ? "#2563EB" : theme.surface,
            color: totalItemCount > 0 ? "#FFFFFF" : theme.ink,
            border: totalItemCount > 0 ? "none" : `1px solid ${theme.border}`,
            boxShadow: totalItemCount > 0
              ? "0 4px 14px rgba(0, 0, 0, 0.18)"
              : (theme.isDark ? "0 4px 14px rgba(0, 0, 0, 0.35)" : "0 2px 10px rgba(0, 0, 0, 0.08)"),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.18s ease",
            userSelect: "none",
            WebkitTapHighlightColor: "transparent",
            padding: 0
          }}
          aria-label="POS Cart"
        >
          {/* Cashier / Shopping Bag Icon */}
          <ShoppingBag size={24} strokeWidth={2.2} />

          {/* Active Product Count Badge (Indikator Produk) */}
          {totalItemCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: -3,
                right: -3,
                background: "#EF4444",
                color: "#FFFFFF",
                fontSize: 11,
                fontWeight: 800,
                minWidth: 20,
                height: 20,
                borderRadius: 10,
                padding: "0 5px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.2)",
                border: "2px solid #FFFFFF",
                boxSizing: "border-box",
                lineHeight: 1,
                letterSpacing: "-0.2px"
              }}
            >
              {totalItemCount > 99 ? "99+" : totalItemCount}
            </span>
          )}
        </button>
      )}
    </>
  );

  if (isMobileView && typeof document !== "undefined") {
    return createPortal(content, document.body);
  }

  return content;
};

