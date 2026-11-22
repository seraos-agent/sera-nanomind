import React, { useState, useEffect } from "react";
import { ArrowLeftRight, Bookmark, ChefHat, Minus, Plus, ShoppingBag, Utensils, X } from "lucide-react";
import type { ThemeType } from "../../../../../theme";
import { normalizeTableKey, type HeldPosBill } from "../hooks/useAdaptivePosMode";

interface HeldBillsStripProps {
  theme: ThemeType;
  isFoodStore: boolean;
  heldBills: HeldPosBill[];
  activeHeldBillId: string | null;
  onResume: (bill: HeldPosBill) => void;
  onDelete: (billId: string) => void;
}

/**
 * Horizontal chip strip displaying open table bills (FOOD) or held carts (BARANG).
 */
export const HeldBillsStrip: React.FC<HeldBillsStripProps> = ({
  theme,
  isFoodStore,
  heldBills,
  activeHeldBillId,
  onResume,
  onDelete
}) => {
  if (heldBills.length === 0) return null;

  return (
    <div
      className="no-scrollbar"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        overflowX: "auto",
        paddingBottom: 2,
        scrollbarWidth: "none",
        WebkitOverflowScrolling: "touch"
      }}
    >
      {!isFoodStore && (
        <span style={{ fontSize: 11, fontWeight: 700, color: theme.inkSoft, whiteSpace: "nowrap" }}>
          Nota Tersimpan:
        </span>
      )}
      {heldBills.map((bill) => {
        const isActiveBill = activeHeldBillId === bill.id;
        const billQty = bill.items.reduce((s, it) => s + it.quantity, 0);
        const isDineIn = bill.orderType === "DINE_IN";
        return (
          <div
            key={bill.id}
            onClick={() => onResume(bill)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 9px",
              borderRadius: 999,
              border: `1px solid ${
                isActiveBill ? theme.accent : isDineIn ? "rgba(245, 158, 11, 0.4)" : theme.border
              }`,
              background: isActiveBill
                ? `${theme.accent}18`
                : isDineIn
                  ? "rgba(245, 158, 11, 0.1)"
                  : theme.surface,
              color: isActiveBill ? theme.accent : theme.ink,
              fontSize: 11.5,
              fontWeight: 600,
              whiteSpace: "nowrap",
              cursor: "pointer"
            }}
          >
            {isDineIn && (
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: isActiveBill ? theme.accent : "#f59e0b",
                  flexShrink: 0
                }}
              />
            )}
            <span>
              {bill.label} ({billQty})
            </span>
            {!isDineIn && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(bill.id);
                }}
                title="Delete saved bill"
                style={{
                  background: "transparent",
                  border: "none",
                  color: theme.inkSoft,
                  cursor: "pointer",
                  padding: 0,
                  display: "flex"
                }}
              >
                <X size={13} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

interface FoodTableSelectorProps {
  theme: ThemeType;
  foodOrderType: "DINE_IN" | "TAKEAWAY";
  tables: string[];
  tableNumber: string;
  openBillEnabled?: boolean;
  occupiedTableCounts?: Record<string, number>;
  activeTableBill?: HeldPosBill | null;
  activeHeldBillId?: string | null;
  onOpenTableBill?: (tableName?: string) => void;
  onCancelTableBill?: (bill: HeldPosBill) => void;
  onMoveTableBill?: (billId: string, targetTable: string) => void | Promise<boolean>;
  onChangeOrderType: (type: "DINE_IN" | "TAKEAWAY") => void;
  onChangeTableNumber: (table: string) => void;
  onAddTable: () => void;
  onRemoveTable: () => void;
}

/**
 * Dine-In vs Takeaway and dynamic table number selector rendered inside the cart for FOOD stores.
 */
export const FoodTableSelector: React.FC<FoodTableSelectorProps> = ({
  theme,
  foodOrderType,
  tables,
  tableNumber,
  openBillEnabled = true,
  occupiedTableCounts,
  activeTableBill,
  activeHeldBillId,
  onOpenTableBill,
  onCancelTableBill,
  onMoveTableBill,
  onChangeOrderType,
  onChangeTableNumber,
  onAddTable,
  onRemoveTable
}) => {
  const [showMovePicker, setShowMovePicker] = useState(false);

  const selectedOccQty = activeTableBill
    ? activeTableBill.items.reduce((sum, it) => sum + it.quantity, 0)
    : 0;
  const isEditingSelectedBill = Boolean(
    activeTableBill && activeHeldBillId && activeHeldBillId === activeTableBill.id
  );
  const availableTables = tables.filter(
    (m) => (occupiedTableCounts?.[normalizeTableKey(m)] || 0) === 0
  );

  useEffect(() => {
    if (!isEditingSelectedBill) {
      setShowMovePicker(false);
    }
  }, [isEditingSelectedBill, activeTableBill?.id]);
  return (
    <div
      style={{
        padding: "10px 14px",
        borderBottom: `1px solid ${theme.border}`,
        background: theme.surface2,
        display: "flex",
        flexDirection: "column",
        gap: 8
      }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        <button
          type="button"
          onClick={() => onChangeOrderType("DINE_IN")}
          style={{
            padding: "6px 8px",
            borderRadius: 8,
            border: `1px solid ${foodOrderType === "DINE_IN" ? theme.accent : theme.border}`,
            background: foodOrderType === "DINE_IN" ? `${theme.accent}16` : theme.surface,
            color: foodOrderType === "DINE_IN" ? theme.accent : theme.inkSoft,
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 5
          }}
        >
          <Utensils size={13} /> Dine-In Table
        </button>
        <button
          type="button"
          onClick={() => onChangeOrderType("TAKEAWAY")}
          style={{
            padding: "6px 8px",
            borderRadius: 8,
            border: `1px solid ${foodOrderType === "TAKEAWAY" ? theme.accent : theme.border}`,
            background: foodOrderType === "TAKEAWAY" ? `${theme.accent}16` : theme.surface,
            color: foodOrderType === "TAKEAWAY" ? theme.accent : theme.inkSoft,
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 5
          }}
        >
          <ShoppingBag size={13} /> Takeaway
        </button>
      </div>

      {foodOrderType === "DINE_IN" && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
              {availableTables.length > 0 ? (
                availableTables.map((m) => {
                  const isSelected = !isEditingSelectedBill && tableNumber === m;
                  const shortLabel = m.startsWith("Table ")
                    ? m.replace("Table ", "T")
                    : m.startsWith("Meja ")
                      ? m.replace("Meja ", "T")
                      : m;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => onChangeTableNumber(m)}
                      title={
                        isEditingSelectedBill
                          ? `Start new order at ${m}`
                          : `${m} • Empty`
                      }
                      style={{
                        padding: "3px 8px",
                        borderRadius: 6,
                        border: `1px solid ${isSelected ? theme.accent : theme.border}`,
                        background: isSelected ? `${theme.accent}18` : theme.surface,
                        color: isSelected ? theme.accent : theme.inkSoft,
                        fontSize: 11,
                        fontWeight: isSelected ? 700 : 600,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center"
                      }}
                    >
                      <span>{shortLabel}</span>
                    </button>
                  );
                })
              ) : (
                <span style={{ fontSize: 11, color: "#f59e0b", fontWeight: 600 }}>
                  All tables occupied
                </span>
              )}
              <button
                type="button"
                onClick={onRemoveTable}
                disabled={tables.length <= 1}
                title="Remove table"
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  border: `1px solid ${theme.border}`,
                  background: theme.surface,
                  color: tables.length <= 1 ? theme.inkFaint : theme.inkSoft,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: tables.length <= 1 ? "not-allowed" : "pointer",
                  padding: 0
                }}
              >
                <Minus size={12} />
              </button>
              <button
                type="button"
                onClick={onAddTable}
                title="Add new table"
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  border: `1px solid ${theme.accent}40`,
                  background: `${theme.accent}14`,
                  color: theme.accent,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  padding: 0
                }}
              >
                <Plus size={12} />
              </button>
          </div>

          {activeTableBill && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                padding: "6px 8px",
                borderRadius: 7,
                background: "rgba(245, 158, 11, 0.1)",
                border: "1px solid rgba(245, 158, 11, 0.28)",
                fontSize: 11
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 6,
                  flexWrap: "wrap"
                }}
              >
                <span style={{ color: theme.ink, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "#f59e0b",
                      flexShrink: 0
                    }}
                  />
                  {activeTableBill.label} Terisi ({selectedOccQty} item)
                </span>
                {isEditingSelectedBill ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    {onMoveTableBill && availableTables.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowMovePicker((p) => !p)}
                        title="Move bill to another empty table"
                        style={{
                          border: `1px solid ${showMovePicker ? theme.accent : theme.border}`,
                          background: showMovePicker ? `${theme.accent}18` : theme.surface,
                          color: showMovePicker ? theme.accent : theme.ink,
                          borderRadius: 5,
                          padding: "2px 7px",
                          fontSize: 10.5,
                          fontWeight: 700,
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 3
                        }}
                      >
                        <ArrowLeftRight size={10} />
                        <span>Move</span>
                      </button>
                    )}
                    {onCancelTableBill && (
                      <button
                        type="button"
                        onClick={() => onCancelTableBill(activeTableBill)}
                        style={{
                          border: "1px solid rgba(239, 68, 68, 0.35)",
                          background: "rgba(239, 68, 68, 0.12)",
                          color: "#EF4444",
                          borderRadius: 5,
                          padding: "2px 7px",
                          fontSize: 10.5,
                          fontWeight: 700,
                          cursor: "pointer",
                          whiteSpace: "nowrap"
                        }}
                      >
                        Cancel Bill
                      </button>
                    )}
                  </div>
                ) : (
                  onOpenTableBill && (
                    <button
                      type="button"
                      onClick={() => onOpenTableBill(activeTableBill.tableNumber || activeTableBill.label)}
                      style={{
                        border: `1px solid ${theme.border}`,
                        background: theme.surface,
                        color: theme.ink,
                        borderRadius: 5,
                        padding: "2px 7px",
                        fontSize: 10.5,
                        fontWeight: 700,
                        cursor: "pointer",
                        whiteSpace: "nowrap"
                      }}
                    >
                      Open Bill
                    </button>
                  )
                )}
              </div>

              {isEditingSelectedBill && showMovePicker && availableTables.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    flexWrap: "wrap",
                    paddingTop: 5,
                    borderTop: "1px dashed rgba(245, 158, 11, 0.3)"
                  }}
                >
                  <span style={{ fontSize: 10.5, fontWeight: 600, color: theme.inkSoft }}>
                    Move to:
                  </span>
                  {availableTables.map((dest) => {
                    const shortLabel = dest.startsWith("Table ")
                      ? dest.replace("Table ", "T")
                      : dest;
                    return (
                      <button
                        key={dest}
                        type="button"
                        onClick={() => {
                          setShowMovePicker(false);
                          void onMoveTableBill?.(activeTableBill.id, dest);
                        }}
                        style={{
                          padding: "2px 7px",
                          borderRadius: 5,
                          border: `1px solid ${theme.accent}45`,
                          background: theme.surface,
                          color: theme.accent,
                          fontSize: 10.5,
                          fontWeight: 700,
                          cursor: "pointer"
                        }}
                      >
                        {shortLabel}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {!openBillEnabled && !activeTableBill && (
            <div style={{ fontSize: 10.5, color: theme.inkSoft }}>
              Pay-First Mode active: orders are completed immediately at checkout.
            </div>
          )}
        </>
      )}
    </div>
  );
};

interface CancelTableBillModalProps {
  bill: HeldPosBill | null;
  theme: ThemeType;
  isSubmitting?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * Explicit confirmation dialog before cancelling an unpaid open table bill without checkout.
 */
export const CancelTableBillModal: React.FC<CancelTableBillModalProps> = ({
  bill,
  theme,
  isSubmitting = false,
  onClose,
  onConfirm
}) => {
  if (!bill) return null;
  const itemCount = bill.items.reduce((sum, it) => sum + it.quantity, 0);
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        background: "rgba(0,0,0,0.68)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 380,
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: 16,
          padding: 20,
          display: "flex",
          flexDirection: "column",
          gap: 12
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: theme.ink }}>
            Cancel Open Bill {bill.label}?
          </h3>
          <button
            type="button"
            onClick={onClose}
            style={{ background: "transparent", border: "none", color: theme.inkSoft, cursor: "pointer" }}
          >
            <X size={18} />
          </button>
        </div>
        <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.5, color: theme.inkSoft }}>
          This table has <strong>{itemCount} unpaid items</strong>. Only use this if guests cancelled or an incorrect table was selected.
        </p>
        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            style={{
              flex: 1,
              padding: "10px 12px",
              borderRadius: 10,
              border: `1px solid ${theme.border}`,
              background: theme.surface2,
              color: theme.ink,
              fontSize: 12.5,
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            Back
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onConfirm}
            style={{
              flex: 1.3,
              padding: "10px 12px",
              borderRadius: 10,
              border: "none",
              background: "#EF4444",
              color: "#fff",
              fontSize: 12.5,
              fontWeight: 700,
              cursor: isSubmitting ? "wait" : "pointer"
            }}
          >
            Yes, Cancel Bill
          </button>
        </div>
      </div>
    </div>
  );
};

interface HoldBillButtonProps {
  theme: ThemeType;
  disabled: boolean;
  isFoodStore: boolean;
  onClick: () => void;
}

/**
 * Secondary cart action button to save an open table bill (FOOD) or hold a cart (BARANG).
 */
export const HoldBillButton: React.FC<HoldBillButtonProps> = ({
  theme,
  disabled,
  isFoodStore,
  onClick
}) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    title={isFoodStore ? "Save Table Open Bill" : "Save Temporary Bill"}
    style={{
      padding: "11px 10px",
      borderRadius: 12,
      border: `1px solid ${theme.border}`,
      background: theme.surface,
      color: !disabled ? theme.ink : theme.inkSoft,
      fontSize: 12,
      fontWeight: 700,
      cursor: !disabled ? "pointer" : "not-allowed",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 5,
      whiteSpace: "nowrap",
      opacity: !disabled ? 1 : 0.5
    }}
  >
    <Bookmark size={14} />
    <span>{isFoodStore ? "Save Bill" : "Hold"}</span>
  </button>
);

interface PrintKitchenTicketButtonProps {
  theme: ThemeType;
  disabled: boolean;
  pendingCount?: number;
  hasPreviouslySent?: boolean;
  onClick: () => void;
}

/**
 * Compact action button to print a kitchen/barista preparation ticket (or delta additions) from the active cart.
 */
export const PrintKitchenTicketButton: React.FC<PrintKitchenTicketButtonProps> = ({
  theme,
  disabled,
  pendingCount = 0,
  hasPreviouslySent = false,
  onClick
}) => {
  const showAddBadge = hasPreviouslySent && pendingCount > 0;
  const allAlreadySent = !disabled && hasPreviouslySent && pendingCount === 0;
  const label = showAddBadge
    ? `Kitchen (+${pendingCount})`
    : allAlreadySent
      ? "Kitchen ✓"
      : "Kitchen";

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      title={
        showAddBadge
          ? `Print ${pendingCount} additional portions to kitchen (no prices)`
          : allAlreadySent
            ? "All items already sent to kitchen (click to reprint)"
            : "Print Kitchen / Barista Ticket (no prices)"
      }
      style={{
        padding: "11px 10px",
        borderRadius: 12,
        border: `1px solid ${showAddBadge ? theme.accent : theme.border}`,
        background: showAddBadge ? `${theme.accent}14` : theme.surface,
        color: !disabled ? (showAddBadge ? theme.accent : theme.ink) : theme.inkSoft,
        fontSize: 12,
        fontWeight: 700,
        cursor: !disabled ? "pointer" : "not-allowed",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 5,
        whiteSpace: "nowrap",
        opacity: !disabled ? 1 : 0.5
      }}
    >
      <ChefHat size={15} />
      <span>{label}</span>
    </button>
  );
};

interface KitchenReprintConfirmModalProps {
  isOpen: boolean;
  theme: ThemeType;
  tableLabel?: string;
  onClose: () => void;
  onConfirmReprint: () => void;
}

/**
 * Confirmation dialog preventing accidental duplicate kitchen tickets when all cart items were already sent.
 */
export const KitchenReprintConfirmModal: React.FC<KitchenReprintConfirmModalProps> = ({
  isOpen,
  theme,
  tableLabel,
  onClose,
  onConfirmReprint
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10040,
        background: "rgba(0,0,0,0.65)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: 16,
          width: "100%",
          maxWidth: 360,
          padding: 18,
          boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
          display: "flex",
          flexDirection: "column",
          gap: 12
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: `${theme.accent}18`,
              color: theme.accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}
          >
            <ChefHat size={18} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: theme.ink }}>
              Already Sent to Kitchen
            </div>
            <div style={{ fontSize: 11, color: theme.inkSoft }}>
              {tableLabel || "Active order"}
            </div>
          </div>
        </div>
        <p style={{ margin: 0, fontSize: 12.5, color: theme.inkSoft, lineHeight: 1.5 }}>
          All items on this order have already been sent to the kitchen. Reprint the full kitchen ticket?
        </p>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "9px 14px",
              borderRadius: 10,
              border: `1px solid ${theme.border}`,
              background: theme.surface2,
              color: theme.ink,
              fontSize: 12.5,
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            Close
          </button>
          <button
            type="button"
            onClick={onConfirmReprint}
            style={{
              padding: "9px 14px",
              borderRadius: 10,
              border: "none",
              background: theme.ink,
              color: theme.surface,
              fontSize: 12.5,
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            Reprint All
          </button>
        </div>
      </div>
    </div>
  );
};
