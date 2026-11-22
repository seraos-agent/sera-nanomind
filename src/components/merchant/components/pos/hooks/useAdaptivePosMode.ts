import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import type { MerchantProduct, PosCartItem, StoreType } from "../../../types";
import { getApiBaseUrl } from "../../../../../config/marketplaceConfig";

const HELD_BILLS_PREFIX = "sera_pos_held_bills_";
const TABLES_PREFIX = "sera_pos_tables_";
const DEFAULT_TABLES = ["Table 1", "Table 2", "Table 3", "Table 4", "Table 5", "Table 6"];

export function normalizeTableKey(label?: string): string {
  const clean = (label || "").trim().replace(/^Meja\s+/i, "Table ");
  return clean.toLowerCase();
}

function normalizeTableDisplay(label?: string): string {
  const clean = (label || "").trim();
  if (!clean) return "Table 1";
  return /^Meja\s+(\d+)$/i.test(clean) ? clean.replace(/^Meja\s+/i, "Table ") : clean;
}

function mergeCartItems(base: PosCartItem[], incoming: PosCartItem[]): PosCartItem[] {
  const next = base.map((item) => ({ ...item }));
  for (const inc of incoming) {
    const incVariantId = inc.variant?.id || "";
    const incNotes = (inc.notes || "").trim();
    const existingIdx = next.findIndex(
      (it) =>
        it.product.id === inc.product.id &&
        (it.variant?.id || "") === incVariantId &&
        (it.notes || "").trim() === incNotes
    );
    if (existingIdx >= 0) {
      const existing = next[existingIdx];
      const mergedQty = existing.quantity + inc.quantity;
      const mergedSent = Math.min(
        mergedQty,
        Math.max(0, existing.kitchenSentQty || 0) + Math.max(0, inc.kitchenSentQty || 0)
      );
      next[existingIdx] = {
        ...existing,
        quantity: mergedQty,
        subtotal: (existing.subtotal || 0) + (inc.subtotal || 0),
        kitchenSentQty: mergedSent > 0 ? mergedSent : undefined
      };
    } else {
      next.push({ ...inc });
    }
  }
  return next;
}

function readTables(storageKey: string): string[] {
  try {
    const raw = localStorage.getItem(storageKey);
    const parsed = raw ? JSON.parse(raw) : null;
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed
        .filter((t): t is string => typeof t === "string" && t.trim().length > 0)
        .map((t) => normalizeTableDisplay(t));
    }
  } catch { }
  return [...DEFAULT_TABLES];
}

export interface HeldPosBill {
  id: string;
  label: string;
  orderType: "DINE_IN" | "TAKEAWAY" | "HOLD";
  tableNumber?: string;
  items: PosCartItem[];
  manualDiscountNominal: number;
  updatedBy?: string;
  updatedAt: number;
}

export interface OpenBillAuditLogEntry {
  id: string;
  billId: string;
  label: string;
  tableNumber?: string;
  itemCount: number;
  totalAmount: number;
  action: "CANCELLED" | "MOVED";
  detail?: string;
  actorName: string;
  createdAt: number;
}

function serializeCartItemsForServer(items: PosCartItem[]) {
  return items.map((it) => ({
    itemId: it.product.id,
    name: it.product.name,
    price: it.product.price,
    originalPrice: it.product.originalPrice,
    variantId: it.variant?.id,
    variantName: it.variant?.name,
    variantPrice: it.variant?.price,
    image: it.product.images?.[0],
    quantity: it.quantity,
    subtotal: it.subtotal,
    notes: it.notes?.trim() || undefined,
    kitchenSentQty: it.kitchenSentQty && it.kitchenSentQty > 0 ? it.kitchenSentQty : undefined
  }));
}

function hydrateServerBillItems(rawItems: any[], products: MerchantProduct[]): PosCartItem[] {
  const productMap = new Map(products.map((p) => [p.id, p]));
  return (Array.isArray(rawItems) ? rawItems : []).map((raw) => {
    if (raw?.product?.id) {
      return raw as PosCartItem;
    }
    const matchedProduct = productMap.get(String(raw?.itemId || ""));
    const unitPrice = Number(raw?.variantPrice ?? raw?.price ?? matchedProduct?.price ?? 0);
    const product: MerchantProduct = matchedProduct || {
      id: String(raw?.itemId || `item-${Date.now()}`),
      storeId: "",
      name: String(raw?.name || "Menu"),
      description: "",
      price: Number(raw?.price ?? unitPrice),
      originalPrice: raw?.originalPrice !== undefined ? Number(raw.originalPrice) : undefined,
      type: "GOODS",
      category: "General",
      currency: "IDR",
      rating: 5,
      images: raw?.image ? [String(raw.image)] : [],
      location: ""
    };
    const variant =
      raw?.variantId && matchedProduct?.variants
        ? matchedProduct.variants.find((v) => v.id === raw.variantId) || {
            id: String(raw.variantId),
            name: String(raw.variantName || "Variant"),
            price: Number(raw.variantPrice ?? unitPrice)
          }
        : raw?.variantId
          ? {
              id: String(raw.variantId),
              name: String(raw.variantName || "Variant"),
              price: Number(raw.variantPrice ?? unitPrice)
            }
          : undefined;
    const qty = Math.max(1, Number(raw?.quantity || 1));
    const sent =
      raw?.kitchenSentQty !== undefined
        ? Math.min(qty, Math.max(0, Number(raw.kitchenSentQty) || 0))
        : 0;
    return {
      product,
      variant,
      quantity: qty,
      subtotal: Number(raw?.subtotal ?? (variant ? variant.price : product.price) * qty),
      notes: raw?.notes ? String(raw.notes) : undefined,
      kitchenSentQty: sent > 0 ? sent : undefined
    };
  });
}

function hydrateServerOpenBills(rawBills: any[], products: MerchantProduct[]): HeldPosBill[] {
  if (!Array.isArray(rawBills)) return [];
  return consolidateHeldBills(
    rawBills.map((b) => ({
      id: String(b.id),
      label: String(b.label || b.tableNumber || "Table 1"),
      orderType: b.orderType === "TAKEAWAY" || b.orderType === "HOLD" ? b.orderType : "DINE_IN",
      tableNumber: b.tableNumber ? String(b.tableNumber) : undefined,
      items: hydrateServerBillItems(b.items, products),
      manualDiscountNominal: Number(b.manualDiscountNominal || 0),
      updatedBy: b.updatedBy ? String(b.updatedBy) : undefined,
      updatedAt: Number(b.updatedAt || Date.now())
    }))
  );
}

/**
 * Ensures at most one active unpaid open bill exists per dine-in table.
 * Legacy duplicate bills for the same table are consolidated automatically.
 */
function consolidateHeldBills(bills: HeldPosBill[]): HeldPosBill[] {
  const result: HeldPosBill[] = [];
  const tableBillIndex = new Map<string, number>();

  for (const bill of bills) {
    if (bill.orderType !== "DINE_IN") {
      result.push(bill);
      continue;
    }
    const displayTable = normalizeTableDisplay(bill.tableNumber || bill.label);
    const key = normalizeTableKey(displayTable);
    const existingPos = tableBillIndex.get(key);
    if (existingPos === undefined) {
      tableBillIndex.set(key, result.length);
      result.push({
        ...bill,
        label: displayTable,
        tableNumber: displayTable
      });
    } else {
      const target = result[existingPos];
      result[existingPos] = {
        ...target,
        items: mergeCartItems(target.items, bill.items),
        manualDiscountNominal: (target.manualDiscountNominal || 0) + (bill.manualDiscountNominal || 0),
        updatedAt: Math.max(target.updatedAt, bill.updatedAt)
      };
    }
  }

  return result;
}

function readHeldBills(storageKey: string): HeldPosBill[] {
  try {
    const raw = localStorage.getItem(storageKey);
    const parsed = raw ? (JSON.parse(raw) as HeldPosBill[]) : [];
    return Array.isArray(parsed) ? consolidateHeldBills(parsed) : [];
  } catch {
    return [];
  }
}

interface UseAdaptivePosModeOptions {
  storeId?: string | null;
  storeType?: StoreType;
  products: MerchantProduct[];
  socket?: any;
  actorName?: string;
  cart: PosCartItem[];
  manualDiscountNominal: number;
  setCart: (items: PosCartItem[]) => void;
  setManualDiscountNominal: (val: number) => void;
  clearCart: () => void;
  addToCart: (product: MerchantProduct) => void;
  onManualBarcodeScan: (code: string) => void;
  onClearSearch?: () => void;
  onPlayBeep?: () => void;
  onNotify?: (message: string) => void;
}

/**
 * Shared adaptive POS mode state for FOOD (menu photo grid, tables, item notes)
 * vs BARANG/JASA (compact data/barcode list, enter-to-scan, hold bills),
 * synchronized across devices via Cloud API + Socket.io.
 */
export function useAdaptivePosMode({
  storeId,
  storeType,
  products,
  socket,
  actorName = "Cashier",
  cart,
  manualDiscountNominal,
  setCart,
  setManualDiscountNominal,
  clearCart,
  addToCart,
  onManualBarcodeScan,
  onClearSearch,
  onPlayBeep,
  onNotify
}: UseAdaptivePosModeOptions) {
  const isFoodStore = storeType === "FOOD";
  const storageKey = `${HELD_BILLS_PREFIX}${storeId || "default"}`;
  const tablesStorageKey = `${TABLES_PREFIX}${storeId || "default"}`;

  const [gridViewMode, setGridViewMode] = useState<"grid" | "list">(() =>
    isFoodStore ? "grid" : "list"
  );
  const [foodOrderType, setFoodOrderType] = useState<"DINE_IN" | "TAKEAWAY">("DINE_IN");
  const [tables, setTables] = useState<string[]>(() => readTables(tablesStorageKey));
  const [tableNumber, setTableNumber] = useState<string>(() => readTables(tablesStorageKey)[0] || "Table 1");
  const [activeHeldBillId, setActiveHeldBillId] = useState<string | null>(null);
  const [heldBills, setHeldBills] = useState<HeldPosBill[]>(() => readHeldBills(storageKey));
  const [auditLogs, setAuditLogs] = useState<OpenBillAuditLogEntry[]>([]);

  const productsRef = useRef(products);
  productsRef.current = products;

  const applyServerSnapshot = useCallback((snapshot: any) => {
    if (!snapshot) return;
    if (Array.isArray(snapshot.tables) && snapshot.tables.length > 0) {
      setTables(snapshot.tables.map((t: string) => normalizeTableDisplay(t)));
    }
    if (Array.isArray(snapshot.openBills)) {
      setHeldBills(hydrateServerOpenBills(snapshot.openBills, productsRef.current));
    }
    if (Array.isArray(snapshot.auditLogs)) {
      setAuditLogs(snapshot.auditLogs);
    }
  }, []);

  useEffect(() => {
    setGridViewMode(storeType === "FOOD" ? "grid" : "list");
  }, [storeType]);

  useEffect(() => {
    setHeldBills(readHeldBills(storageKey));
    setActiveHeldBillId(null);
  }, [storageKey]);

  useEffect(() => {
    const loaded = readTables(tablesStorageKey);
    setTables(loaded);
    setTableNumber((prev) => (loaded.includes(prev) ? prev : loaded[0] || "Table 1"));
  }, [tablesStorageKey]);

  // Hydrate tables & open bills from cloud backend when storeId mounts/changes
  useEffect(() => {
    if (!storeId) return;
    let cancelled = false;
    fetch(`${getApiBaseUrl()}/api/market/stores/${storeId}/pos-open-bills`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!cancelled && json?.success && json.data) {
          applyServerSnapshot(json.data);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [storeId, applyServerSnapshot]);

  // Live Socket.io sync across Waiter, Cashier Terminal, and Owner POS
  useEffect(() => {
    if (!socket || !storeId) return;
    const handleOpenBillsUpdated = (payload: any) => {
      if (payload?.storeId === storeId) {
        applyServerSnapshot(payload);
      }
    };
    socket.on("pos:open_bills_updated", handleOpenBillsUpdated);
    return () => {
      socket.off("pos:open_bills_updated", handleOpenBillsUpdated);
    };
  }, [socket, storeId, applyServerSnapshot]);

  useEffect(() => {
    try {
      localStorage.setItem(tablesStorageKey, JSON.stringify(tables));
    } catch { }
  }, [tables, tablesStorageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(heldBills));
    } catch { }
  }, [heldBills, storageKey]);

  const syncTablesToServer = useCallback(
    (nextTables: string[]) => {
      if (!storeId) return;
      fetch(`${getApiBaseUrl()}/api/market/stores/${storeId}/pos-tables`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tables: nextTables })
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((json) => {
          if (json?.success && json.data) applyServerSnapshot(json.data);
        })
        .catch(() => {});
    },
    [storeId, applyServerSnapshot]
  );

  const handleAddTable = useCallback(() => {
    setTables((prev) => {
      const cleanInput = tableNumber.trim();
      let updated: string[];
      if (cleanInput && !prev.includes(cleanInput)) {
        updated = [...prev, cleanInput];
      } else {
        let nextIndex = prev.length + 1;
        while (prev.includes(`Table ${nextIndex}`)) {
          nextIndex++;
        }
        const nextName = `Table ${nextIndex}`;
        setTableNumber(nextName);
        updated = [...prev, nextName];
      }
      syncTablesToServer(updated);
      return updated;
    });
  }, [tableNumber, syncTablesToServer]);

  const occupiedTableBills = useMemo(() => {
    const map = new Map<string, HeldPosBill>();
    for (const bill of heldBills) {
      if (bill.orderType === "DINE_IN") {
        const key = normalizeTableKey(bill.tableNumber || bill.label);
        if (!map.has(key)) map.set(key, bill);
      }
    }
    return map;
  }, [heldBills]);

  const occupiedTableCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const [key, bill] of occupiedTableBills.entries()) {
      counts[key] = bill.items.reduce((sum, it) => sum + it.quantity, 0);
    }
    return counts;
  }, [occupiedTableBills]);

  useEffect(() => {
    if (activeHeldBillId || cart.length > 0) return;
    setTableNumber((prev) => {
      if (!occupiedTableBills.has(normalizeTableKey(prev))) return prev;
      const firstFree = tables.find((t) => !occupiedTableBills.has(normalizeTableKey(t)));
      return firstFree || prev;
    });
  }, [activeHeldBillId, cart.length, occupiedTableBills, tables]);

  const syncUpsertBillToServer = useCallback(
    (payload: {
      id?: string;
      orderType: "DINE_IN" | "TAKEAWAY" | "HOLD";
      tableNumber?: string;
      label?: string;
      items: PosCartItem[];
      manualDiscountNominal?: number;
      mergeIfTableOccupied?: boolean;
    }) => {
      if (!storeId) return;
      fetch(`${getApiBaseUrl()}/api/market/stores/${storeId}/pos-open-bills`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          items: serializeCartItemsForServer(payload.items),
          updatedBy: actorName
        })
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((json) => {
          if (json?.success && json.data) applyServerSnapshot(json.data);
        })
        .catch(() => {});
    },
    [storeId, actorName, applyServerSnapshot]
  );

  const persistActiveHeldBillSnapshot = useCallback(() => {
    if (!activeHeldBillId || cart.length === 0) return;
    const existing = heldBills.find((b) => b.id === activeHeldBillId);
    setHeldBills((prev) => {
      const idx = prev.findIndex((b) => b.id === activeHeldBillId);
      if (idx < 0) return prev;
      const copy = [...prev];
      copy[idx] = {
        ...copy[idx],
        items: [...cart],
        manualDiscountNominal,
        updatedBy: actorName,
        updatedAt: Date.now()
      };
      return copy;
    });
    if (existing) {
      syncUpsertBillToServer({
        id: existing.id,
        orderType: existing.orderType,
        tableNumber: existing.tableNumber,
        label: existing.label,
        items: cart,
        manualDiscountNominal,
        mergeIfTableOccupied: false
      });
    }
  }, [activeHeldBillId, cart, manualDiscountNominal, heldBills, actorName, syncUpsertBillToServer]);

  const handleSelectTable = useCallback(
    (nextTable: string) => {
      const targetKey = normalizeTableKey(nextTable);
      const occupiedBill = occupiedTableBills.get(targetKey);

      if (activeHeldBillId) {
        const currentOpen = heldBills.find((b) => b.id === activeHeldBillId);
        const currentKey = currentOpen
          ? normalizeTableKey(currentOpen.tableNumber || currentOpen.label)
          : "";
        if (targetKey && targetKey === currentKey) {
          setTableNumber(nextTable);
          return;
        }
        persistActiveHeldBillSnapshot();
        setTableNumber(nextTable);
        if (occupiedBill) {
          setCart(occupiedBill.items);
          setManualDiscountNominal(occupiedBill.manualDiscountNominal || 0);
          setActiveHeldBillId(occupiedBill.id);
          onNotify?.(`Opened ${occupiedBill.label} (Occupied)`);
        } else {
          setActiveHeldBillId(null);
          clearCart();
          onNotify?.(`New order: ${nextTable}`);
        }
        return;
      }

      setTableNumber(nextTable);
      if (cart.length === 0 && occupiedBill) {
        setCart(occupiedBill.items);
        setManualDiscountNominal(occupiedBill.manualDiscountNominal || 0);
        setActiveHeldBillId(occupiedBill.id);
        onNotify?.(`Opened ${occupiedBill.label} (Occupied)`);
      }
    },
    [
      activeHeldBillId,
      heldBills,
      occupiedTableBills,
      cart.length,
      persistActiveHeldBillSnapshot,
      setCart,
      setManualDiscountNominal,
      clearCart,
      onNotify
    ]
  );

  const handleChangeFoodOrderType = useCallback(
    (nextType: "DINE_IN" | "TAKEAWAY") => {
      if (nextType === foodOrderType) return;
      if (activeHeldBillId) {
        persistActiveHeldBillSnapshot();
        setActiveHeldBillId(null);
        clearCart();
      }
      setFoodOrderType(nextType);
    },
    [foodOrderType, activeHeldBillId, persistActiveHeldBillSnapshot, clearCart]
  );

  const handleOpenTableBill = useCallback(
    (targetTable?: string) => {
      const key = normalizeTableKey(targetTable || tableNumber);
      const occupiedBill = occupiedTableBills.get(key);
      if (!occupiedBill) return;
      setFoodOrderType("DINE_IN");
      setTableNumber(occupiedBill.tableNumber || occupiedBill.label);
      setCart(occupiedBill.items);
      setManualDiscountNominal(occupiedBill.manualDiscountNominal || 0);
      setActiveHeldBillId(occupiedBill.id);
      onNotify?.(`Opened ${occupiedBill.label} (Occupied)`);
    },
    [tableNumber, occupiedTableBills, setCart, setManualDiscountNominal, onNotify]
  );

  const handleRemoveTable = useCallback(() => {
    const currentOccupied = occupiedTableBills.get(normalizeTableKey(tableNumber));
    if (currentOccupied) {
      onNotify?.(`${tableNumber} currently has an active bill`);
      return;
    }
    setTables((prev) => {
      if (prev.length <= 1) return prev;
      const targetIdx = prev.indexOf(tableNumber);
      const next = targetIdx >= 0 ? prev.filter((_, i) => i !== targetIdx) : prev.slice(0, -1);
      setTableNumber(next[Math.max(0, (targetIdx >= 0 ? targetIdx : next.length) - 1)] || next[0]);
      syncTablesToServer(next);
      return next;
    });
  }, [tableNumber, occupiedTableBills, onNotify, syncTablesToServer]);

  const handleHoldCurrentBill = useCallback(() => {
    if (cart.length === 0) return;

    if (isFoodStore && foodOrderType === "DINE_IN") {
      const cleanTable = normalizeTableDisplay(tableNumber);
      const tableKey = normalizeTableKey(cleanTable);
      const existingForTable = occupiedTableBills.get(tableKey);
      const isEditingSameTableBill = Boolean(
        activeHeldBillId && existingForTable && existingForTable.id === activeHeldBillId
      );

      let notifyMessage = `Saved to ${cleanTable} (Occupied)`;
      const newBillId = isEditingSameTableBill ? activeHeldBillId! : existingForTable?.id || `bill-${Date.now()}`;

      setHeldBills((prev) => {
        const filteredPrev =
          activeHeldBillId && !isEditingSameTableBill
            ? prev.filter((b) => b.id !== activeHeldBillId)
            : prev;

        const targetIdx = filteredPrev.findIndex(
          (b) => b.orderType === "DINE_IN" && normalizeTableKey(b.tableNumber || b.label) === tableKey
        );

        if (targetIdx >= 0) {
          const existing = filteredPrev[targetIdx];
          const updatedItems = isEditingSameTableBill
            ? [...cart]
            : mergeCartItems(existing.items, cart);
          const updatedDiscount = isEditingSameTableBill
            ? manualDiscountNominal
            : (existing.manualDiscountNominal || 0) + manualDiscountNominal;
          const totalQty = updatedItems.reduce((sum, it) => sum + it.quantity, 0);
          notifyMessage = isEditingSameTableBill
            ? `Updated ${cleanTable} bill (${totalQty} items)`
            : `Added items to ${cleanTable} (${totalQty} items)`;

          const copy = [...filteredPrev];
          copy[targetIdx] = {
            ...existing,
            label: cleanTable,
            tableNumber: cleanTable,
            items: updatedItems,
            manualDiscountNominal: updatedDiscount,
            updatedBy: actorName,
            updatedAt: Date.now()
          };
          return copy;
        }

        const newBill: HeldPosBill = {
          id: newBillId,
          label: cleanTable,
          orderType: "DINE_IN",
          tableNumber: cleanTable,
          items: [...cart],
          manualDiscountNominal,
          updatedBy: actorName,
          updatedAt: Date.now()
        };
        return [newBill, ...filteredPrev];
      });

      syncUpsertBillToServer({
        id: activeHeldBillId || undefined,
        orderType: "DINE_IN",
        tableNumber: cleanTable,
        label: cleanTable,
        items: cart,
        manualDiscountNominal,
        mergeIfTableOccupied: !isEditingSameTableBill
      });

      const nextTablesState = (() => {
        const occupiedKeys = new Set<string>();
        for (const b of heldBills) {
          if (b.orderType === "DINE_IN") {
            occupiedKeys.add(normalizeTableKey(b.tableNumber || b.label));
          }
        }
        occupiedKeys.add(tableKey);
        return tables.find((t) => !occupiedKeys.has(normalizeTableKey(t)));
      })();

      setActiveHeldBillId(null);
      if (nextTablesState) {
        setTableNumber(nextTablesState);
      }
      clearCart();
      onNotify?.(notifyMessage);
      return;
    }

    const prefix = isFoodStore ? "Takeaway" : "Nota";
    const existingMaxSeq = heldBills.reduce((max, b) => {
      const match = b.label.match(new RegExp(`^${prefix}\\s+#(\\d+)$`, "i"));
      return match ? Math.max(max, Number(match[1])) : max;
    }, 0);
    const existingResumed = activeHeldBillId
      ? heldBills.find((b) => b.id === activeHeldBillId)
      : undefined;
    const label = existingResumed?.label || `${prefix} #${existingMaxSeq + 1}`;
    const billId = activeHeldBillId || `bill-${Date.now()}`;
    const billOrderType = isFoodStore ? "TAKEAWAY" : "HOLD";
    const nextBill: HeldPosBill = {
      id: billId,
      label,
      orderType: billOrderType,
      tableNumber: undefined,
      items: [...cart],
      manualDiscountNominal,
      updatedBy: actorName,
      updatedAt: Date.now()
    };

    setHeldBills((prev) => {
      const idx = prev.findIndex((b) => b.id === billId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = nextBill;
        return copy;
      }
      return [nextBill, ...prev];
    });
    syncUpsertBillToServer({
      id: activeHeldBillId || undefined,
      orderType: billOrderType,
      label,
      items: cart,
      manualDiscountNominal
    });
    setActiveHeldBillId(null);
    clearCart();
    onNotify?.(`Saved to ${label}`);
  }, [
    cart,
    isFoodStore,
    foodOrderType,
    tableNumber,
    heldBills,
    occupiedTableBills,
    activeHeldBillId,
    manualDiscountNominal,
    tables,
    actorName,
    syncUpsertBillToServer,
    clearCart,
    onNotify
  ]);

  const handleResumeHeldBill = useCallback(
    (bill: HeldPosBill) => {
      if (activeHeldBillId && activeHeldBillId !== bill.id) {
        persistActiveHeldBillSnapshot();
      }
      setCart(bill.items);
      setManualDiscountNominal(bill.manualDiscountNominal || 0);
      setActiveHeldBillId(bill.id);
      if (bill.orderType === "DINE_IN") {
        setFoodOrderType("DINE_IN");
        setTableNumber(bill.tableNumber || bill.label);
      } else if (bill.orderType === "TAKEAWAY") {
        setFoodOrderType("TAKEAWAY");
      }
      onNotify?.(`Opened ${bill.label}`);
    },
    [activeHeldBillId, persistActiveHeldBillSnapshot, setCart, setManualDiscountNominal, onNotify]
  );

  const handleMoveTableBill = useCallback(
    async (billId: string, targetTableRaw: string): Promise<boolean> => {
      const targetDisplay = normalizeTableDisplay(targetTableRaw);
      const targetKey = normalizeTableKey(targetDisplay);
      const conflict = heldBills.find(
        (b) =>
          b.id !== billId &&
          b.orderType === "DINE_IN" &&
          normalizeTableKey(b.tableNumber || b.label) === targetKey
      );
      if (conflict) {
        onNotify?.(`${targetDisplay} already has an active bill.`);
        return false;
      }

      const sourceBill = heldBills.find((b) => b.id === billId);
      const fromLabel = sourceBill?.tableNumber || sourceBill?.label || "Table";

      // Optimistic local move
      setHeldBills((prev) =>
        prev.map((b) =>
          b.id === billId
            ? {
                ...b,
                orderType: "DINE_IN",
                label: targetDisplay,
                tableNumber: targetDisplay,
                updatedBy: actorName,
                updatedAt: Date.now()
              }
            : b
        )
      );
      if (activeHeldBillId === billId) {
        setTableNumber(targetDisplay);
      }

      if (storeId) {
        try {
          const res = await fetch(
            `${getApiBaseUrl()}/api/market/stores/${storeId}/pos-open-bills/${billId}/move`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ targetTable: targetDisplay, actorName })
            }
          );
          const json = await res.json().catch(() => null);
          if (res.ok && json?.success && json.data) {
            applyServerSnapshot(json.data);
          } else if (res.status >= 400 && res.status < 500 && json?.error) {
            onNotify?.(json.error);
            return false;
          }
        } catch {}
      }

      onNotify?.(`${fromLabel} moved to ${targetDisplay}`);
      return true;
    },
    [heldBills, activeHeldBillId, storeId, actorName, applyServerSnapshot, onNotify]
  );

  const handleDeleteHeldBill = useCallback(
    async (
      billId: string,
      opts?: {
        skipAudit?: boolean;
        cashierId?: string;
        supervisorPin?: string;
        reason?: string;
      }
    ): Promise<{ ok: boolean; error?: string }> => {
      if (storeId) {
        try {
          const res = await fetch(
            `${getApiBaseUrl()}/api/market/stores/${storeId}/pos-open-bills/${billId}`,
            {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                actorName,
                cashierId: opts?.cashierId,
                supervisorPin: opts?.supervisorPin,
                skipAudit: opts?.skipAudit,
                reason: opts?.reason
              })
            }
          );
          const json = await res.json().catch(() => null);
          if (!res.ok && json?.error && res.status === 403) {
            return { ok: false, error: json.error };
          }
          if (res.ok && json?.success && json.data) {
            applyServerSnapshot(json.data);
          }
        } catch {}
      }

      setHeldBills((prev) => prev.filter((b) => b.id !== billId));
      if (activeHeldBillId === billId) {
        setActiveHeldBillId(null);
      }
      return { ok: true };
    },
    [storeId, actorName, activeHeldBillId, applyServerSnapshot]
  );

  const clearActiveHeldBillAfterCheckout = useCallback(() => {
    if (activeHeldBillId) {
      const closingId = activeHeldBillId;
      const remainingBills = heldBills.filter((b) => b.id !== closingId);
      setHeldBills(remainingBills);
      setActiveHeldBillId(null);
      const occupiedKeys = new Set(
        remainingBills
          .filter((b) => b.orderType === "DINE_IN")
          .map((b) => normalizeTableKey(b.tableNumber || b.label))
      );
      const nextFree = tables.find((t) => !occupiedKeys.has(normalizeTableKey(t)));
      if (nextFree) setTableNumber(nextFree);
      void handleDeleteHeldBill(closingId, { skipAudit: true });
    }
  }, [activeHeldBillId, heldBills, tables, handleDeleteHeldBill]);

  const markCartSentToKitchen = useCallback(() => {
    if (cart.length === 0) return;
    const updatedCart = cart.map((item) => ({
      ...item,
      kitchenSentQty: item.quantity
    }));
    setCart(updatedCart);

    if (activeHeldBillId) {
      const existing = heldBills.find((b) => b.id === activeHeldBillId);
      setHeldBills((prev) =>
        prev.map((b) =>
          b.id === activeHeldBillId
            ? {
                ...b,
                items: updatedCart,
                updatedBy: actorName,
                updatedAt: Date.now()
              }
            : b
        )
      );
      if (existing) {
        syncUpsertBillToServer({
          id: existing.id,
          orderType: existing.orderType,
          tableNumber: existing.tableNumber,
          label: existing.label,
          items: updatedCart,
          manualDiscountNominal,
          mergeIfTableOccupied: false
        });
      }
    }
  }, [cart, setCart, activeHeldBillId, heldBills, actorName, manualDiscountNominal, syncUpsertBillToServer]);

  const handleBarcodeEnter = useCallback(
    (rawCode: string) => {
      const clean = rawCode.trim().toLowerCase();
      const matched = products.find((p) => p.barcode && p.barcode.toLowerCase() === clean);
      if (matched) {
        onPlayBeep?.();
        addToCart(matched);
        onClearSearch?.();
        onNotify?.(`+1 ${matched.name}`);
        return;
      }
      onManualBarcodeScan(rawCode);
    },
    [products, onPlayBeep, addToCart, onClearSearch, onNotify, onManualBarcodeScan]
  );

  const activeTableOrQueueLabel = isFoodStore
    ? foodOrderType === "DINE_IN"
      ? tableNumber.trim() || "Table"
      : "Takeaway"
    : undefined;

  const activeTableBill = useMemo(
    () => occupiedTableBills.get(normalizeTableKey(tableNumber)) || null,
    [occupiedTableBills, tableNumber]
  );

  return {
    isFoodStore,
    gridViewMode,
    setGridViewMode,
    foodOrderType,
    setFoodOrderType: handleChangeFoodOrderType,
    tables,
    tableNumber,
    setTableNumber: handleSelectTable,
    occupiedTableCounts,
    activeTableBill,
    handleOpenTableBill,
    handleAddTable,
    handleRemoveTable,
    heldBills,
    auditLogs,
    activeHeldBillId,
    setActiveHeldBillId,
    activeTableOrQueueLabel,
    handleHoldCurrentBill,
    handleMoveTableBill,
    handleResumeHeldBill,
    handleDeleteHeldBill,
    clearActiveHeldBillAfterCheckout,
    markCartSentToKitchen,
    handleBarcodeEnter
  };
}
