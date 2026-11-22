import { useState, useEffect, useCallback } from "react";
import type {
  MerchantStore,
  MerchantProduct,
  ProductVariant,
  PosCartItem,
  PosPaymentMethodType,
  PosPaymentPart,
  PosTransaction,
  MerchantOrder
} from "../../../types";
import { getApiBaseUrl } from "../../../../../config/marketplaceConfig";
import { mapPosTransactionToMerchantOrder } from "../../../utils/posOrderMapper";
import { mapServerTxToUiTransaction } from "../../../../cashier/types";

export interface UsePosTransactionsProps {
  store: MerchantStore | null;
  products: MerchantProduct[];
  socket?: any;
  onUpdateProducts: (updated: MerchantProduct[]) => void;
  onAddOrder: (order: MerchantOrder) => void;
  onPlayBeep?: () => void;
  onNotify?: (message: string) => void;
}

export function usePosTransactions({
  store,
  products,
  socket,
  onUpdateProducts,
  onAddOrder,
  onPlayBeep,
  onNotify
}: UsePosTransactionsProps) {
  const [posTransactions, setPosTransactions] = useState<PosTransaction[]>(() => {
    const saved = localStorage.getItem("sera_merchant_pos_history");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch { }
    }
    return [];
  });

  const [completedTransaction, setCompletedTransaction] = useState<PosTransaction | null>(null);

  useEffect(() => {
    localStorage.setItem("sera_merchant_pos_history", JSON.stringify(posTransactions));
  }, [posTransactions]);

  // Hydrate cloud POS transactions (Owner + Mitra Kasir terminals) for date-range & profit reporting
  useEffect(() => {
    if (!store?.id) return;
    let cancelled = false;
    fetch(`${getApiBaseUrl()}/api/market/pos/transactions?storeId=${encodeURIComponent(store.id)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (cancelled || !json?.success || !Array.isArray(json.data)) return;
        const remoteMapped: PosTransaction[] = json.data.map((raw: any) =>
          mapServerTxToUiTransaction(raw, products)
        );
        setPosTransactions((prev) => {
          const remoteKeys = new Set<string>();
          for (const r of remoteMapped) {
            remoteKeys.add(r.id);
            if (r.receiptNumber) remoteKeys.add(r.receiptNumber);
          }
          const unsyncedLocals = prev.filter((l) => {
            if (l.storeId && l.storeId !== store.id) return false;
            const keyMatch =
              remoteKeys.has(l.id) ||
              (l.serverId && remoteKeys.has(l.serverId)) ||
              (l.receiptNumber && remoteKeys.has(l.receiptNumber));
            return !keyMatch;
          });
          return [...unsyncedLocals, ...remoteMapped].sort(
            (a, b) => b.createdAt - a.createdAt
          );
        });
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [store?.id, products]);

  // Real-time Socket.io sync for POS transactions created or voided on connected cashier terminals
  useEffect(() => {
    if (!socket || !store?.id) return;

    const handleTxCreated = (rawTx: any) => {
      if (!rawTx || rawTx.storeId !== store.id) return;
      const mapped = mapServerTxToUiTransaction(rawTx, products);
      setPosTransactions((prev) => {
        const idx = prev.findIndex(
          (item) =>
            item.id === mapped.id ||
            item.serverId === mapped.id ||
            (mapped.receiptNumber && item.receiptNumber === mapped.receiptNumber)
        );
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = { ...copy[idx], ...mapped, serverId: mapped.id };
          return copy;
        }
        return [mapped, ...prev].sort((a, b) => b.createdAt - a.createdAt);
      });
    };

    const handleTxVoided = (rawTx: any) => {
      if (!rawTx || rawTx.storeId !== store.id) return;
      setPosTransactions((prev) =>
        prev.map((item) =>
          item.id === rawTx.id ||
          item.serverId === rawTx.id ||
          (rawTx.receiptNumber && item.receiptNumber === rawTx.receiptNumber)
            ? { ...item, status: "VOIDED", voidReason: rawTx.voidReason }
            : item
        )
      );
    };

    socket.on("pos:transaction_created", handleTxCreated);
    socket.on("pos:transaction_voided", handleTxVoided);
    return () => {
      socket.off("pos:transaction_created", handleTxCreated);
      socket.off("pos:transaction_voided", handleTxVoided);
    };
  }, [socket, store?.id, products]);

  const finalizeTransaction = useCallback(
    ({
      cart,
      finalTotal,
      totalDiscount,
      taxAmount = 0,
      serviceChargeAmount = 0,
      paymentMethod,
      payments,
      tenderedNum,
      changeAmount,
      tableOrQueueNumber
    }: {
      cart: PosCartItem[];
      finalTotal: number;
      totalDiscount: number;
      taxAmount?: number;
      serviceChargeAmount?: number;
      paymentMethod: PosPaymentMethodType;
      payments?: PosPaymentPart[];
      tenderedNum: number;
      changeAmount: number;
      tableOrQueueNumber?: string;
    }) => {
      if (cart.length === 0) return null;

      const hasSplit = Array.isArray(payments) && payments.length > 1;
      const effectiveMethod: PosPaymentMethodType = hasSplit ? "SPLIT" : paymentMethod;
      const computedPaid = hasSplit
        ? payments.reduce((sum, p) => sum + Number(p.amount || 0), 0)
        : paymentMethod === "CASH"
          ? tenderedNum
          : finalTotal;
      const computedChange = hasSplit
        ? Math.max(0, computedPaid - finalTotal)
        : paymentMethod === "CASH"
          ? changeAmount
          : 0;

      const receiptNo = `STR-${Date.now().toString().slice(-6)}`;
      const cleanTable = tableOrQueueNumber?.trim() || undefined;
      const itemsWithCost: PosCartItem[] = cart.map((item) => ({
        ...item,
        costPrice: item.costPrice ?? item.variant?.costPrice ?? item.product.costPrice
      }));
      const itemsSubtotal = itemsWithCost.reduce((sum, item) => sum + item.subtotal, 0);
      const tx: PosTransaction = {
        id: `pos-${Date.now()}`,
        storeId: store?.id || "store-pos",
        receiptNumber: receiptNo,
        items: itemsWithCost,
        subtotalAmount: itemsSubtotal,
        taxAmount,
        serviceChargeAmount,
        totalAmount: finalTotal,
        discountAmount: totalDiscount,
        paymentMethod: effectiveMethod,
        payments: hasSplit ? payments : undefined,
        amountPaid: computedPaid,
        changeAmount: computedChange,
        customerName: "Pelanggan Kasir",
        cashierName: "Store Owner",
        tableOrQueueNumber: cleanTable,
        createdAt: Date.now(),
        status: "COMPLETED"
      };

      // 1. Save to local POS History
      setPosTransactions((prev) => [tx, ...prev]);

      // 2. Deduct stock from products locally
      const updatedProducts = products.map((p) => {
        const cartMatches = cart.filter((item) => item.product.id === p.id);
        if (cartMatches.length === 0) return p;

        const totalDeducted = cartMatches.reduce((sum, item) => sum + item.quantity, 0);

        let updatedVariants: ProductVariant[] | undefined = undefined;
        if (p.variants && p.variants.length > 0) {
          updatedVariants = p.variants.map((v) => {
            const vMatch = cartMatches.find((item) => item.variant?.id === v.id);
            if (vMatch) {
              return {
                ...v,
                stock: Math.max(0, (v.stock ?? 10) - vMatch.quantity)
              };
            }
            return v;
          });
        }

        const nextStock =
          p.stock !== undefined ? Math.max(0, p.stock - totalDeducted) : undefined;

        return {
          ...p,
          stock: nextStock,
          variants: updatedVariants
        };
      });

      onUpdateProducts(updatedProducts);

      // 3. Add to Merchant Orders list immediately
      const mappedOrder = mapPosTransactionToMerchantOrder({
        ...tx,
        cashierName: "Store Owner"
      });
      onAddOrder(mappedOrder);

      // 4. Persist to Cloud POS API (falling back to batch-stock only if store isn't cloud-registered)
      const fallbackBatchStock = () => {
        const stockUpdates = cart.map((it) => ({
          id: it.product.id,
          deltaQty: -it.quantity
        }));
        fetch(`${getApiBaseUrl()}/api/market/products/batch-stock`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ updates: stockUpdates })
        }).catch(() => { });
      };

      if (store?.id) {
        fetch(`${getApiBaseUrl()}/api/market/pos/transactions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            storeId: store.id,
            cashierId: "owner",
            cashierName: "Store Owner",
            receiptNumber: receiptNo,
            tableOrQueueNumber: cleanTable,
            items: cart.map((item) => ({
              itemId: item.product.id,
              name: item.product.name,
              variantId: item.variant?.id,
              variantName: item.variant?.name,
              price: item.variant ? item.variant.price : item.product.price,
              quantity: item.quantity,
              notes: item.notes?.trim() || undefined
            })),
            discountAmount: totalDiscount,
            taxAmount,
            serviceChargeAmount,
            paymentMethod: effectiveMethod,
            payments: hasSplit ? payments : undefined,
            amountPaid: computedPaid
          })
        })
          .then((res) => (res.ok ? res.json() : null))
          .then((json) => {
            const serverTx = json?.success ? json.data?.transaction : null;
            if (serverTx?.id) {
              setPosTransactions((prev) =>
                prev.map((item) =>
                  item.id === tx.id ? { ...item, serverId: serverTx.id } : item
                )
              );
            } else {
              fallbackBatchStock();
            }
          })
          .catch(() => {
            fallbackBatchStock();
          });
      } else {
        fallbackBatchStock();
      }

      setCompletedTransaction(tx);
      onPlayBeep?.();
      return tx;
    },
    [store, products, onUpdateProducts, onAddOrder, onPlayBeep]
  );

  const voidTransaction = useCallback(
    (tx: PosTransaction) => {
      // 1. Mark transaction as VOIDED in history
      setPosTransactions((prev) =>
        prev.map((t) => (t.id === tx.id ? { ...t, status: "VOIDED" } : t))
      );

      // 2. Restore stock for each item locally
      const updatedProducts = products.map((p) => {
        const matches = tx.items.filter((item) => item.product.id === p.id);
        if (matches.length === 0) return p;

        const totalRestored = matches.reduce((sum, item) => sum + item.quantity, 0);

        let updatedVariants: ProductVariant[] | undefined = undefined;
        if (p.variants && p.variants.length > 0) {
          updatedVariants = p.variants.map((v) => {
            const vMatch = matches.find((item) => item.variant?.id === v.id);
            if (vMatch) {
              return {
                ...v,
                stock: (v.stock ?? 0) + vMatch.quantity
              };
            }
            return v;
          });
        }

        const nextStock =
          p.stock !== undefined ? p.stock + totalRestored : undefined;

        return {
          ...p,
          stock: nextStock,
          variants: updatedVariants
        };
      });

      onUpdateProducts(updatedProducts);

      // Notify unified Merchant Orders list immediately
      try {
        window.dispatchEvent(
          new CustomEvent("sera:pos-transaction-voided", {
            detail: {
              id: tx.serverId || tx.id,
              receiptNumber: tx.receiptNumber,
              storeId: tx.storeId || store?.id
            }
          })
        );
      } catch { }

      // 3. Void via cloud POS endpoint if synced, otherwise restore batch-stock
      const fallbackRestoreStock = () => {
        const restoreUpdates = tx.items.map((it) => ({
          id: it.product.id,
          deltaQty: it.quantity
        }));
        fetch(`${getApiBaseUrl()}/api/market/products/batch-stock`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ updates: restoreUpdates })
        }).catch(() => { });
      };

      if (tx.serverId) {
        fetch(`${getApiBaseUrl()}/api/market/pos/transactions/${tx.serverId}/void`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cashierId: "owner", voidedBy: "Store Owner" })
        }).catch(() => fallbackRestoreStock());
      } else {
        fallbackRestoreStock();
      }

      onPlayBeep?.();
      onNotify?.(`Transaksi ${tx.receiptNumber} dibatalkan & stok dikembalikan.`);
    },
    [store?.id, products, onUpdateProducts, onPlayBeep, onNotify]
  );

  return {
    posTransactions,
    completedTransaction,
    setCompletedTransaction,
    finalizeTransaction,
    voidTransaction
  };
}

