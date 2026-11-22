import { useState, useMemo, useEffect } from "react";
import type { MerchantOrder, MerchantStore } from "../../../types";

export type OrderFilterType = "ACTIVE" | "COURIER" | "COMPLETED" | "REVIEWS";

interface UseOrderReconciliationProps {
  orders: MerchantOrder[];
  store?: MerchantStore | null;
  initialTab?: OrderFilterType;
  onUpdateOrderStatus: (orderId: string, nextStatus: MerchantOrder["status"]) => void;
}

export function useMerchantOrderReconciliation({
  orders,
  store,
  initialTab = "ACTIVE",
  onUpdateOrderStatus
}: UseOrderReconciliationProps) {
  const [filter, setFilter] = useState<OrderFilterType>(() => {
    return (
      (localStorage.getItem("sera_merchant_order_filter") as OrderFilterType) ||
      initialTab
    );
  });

  useEffect(() => {
    localStorage.setItem("sera_merchant_order_filter", filter);
  }, [filter]);

  // Store COD settlement and delivery reconciliation state
  const [reconciledCouriers, setReconciledCouriers] = useState<Record<string, boolean>>(() => {
    const storeId = store?.id || "default";
    try {
      const raw = localStorage.getItem(`sera_store_reconciled_couriers_${storeId}`);
      if (raw) return JSON.parse(raw);
    } catch {}
    return {};
  });

  const [settledOrderIds, setSettledOrderIds] = useState<Record<string, boolean>>(() => {
    const storeId = store?.id || "default";
    try {
      const raw = localStorage.getItem(`sera_store_settled_orders_${storeId}`);
      if (raw) return JSON.parse(raw);
    } catch {}
    return {};
  });

  const [settlementSuccessMsg, setSettlementSuccessMsg] = useState<string | null>(null);

  // Real orders only (Production clean architecture, no dummy injection)
  const allOrders = useMemo(() => {
    return (orders || []).filter(Boolean).map((o) => {
      const isSettled =
        !!settledOrderIds[o.id] ||
        (o.courierName ? !!reconciledCouriers[o.courierName] : false);
      if (isSettled) {
        return { ...o, status: "COMPLETED" as const };
      }
      return o;
    });
  }, [orders, settledOrderIds, reconciledCouriers]);

  const isOrderReconciled = (order: MerchantOrder) => {
    if (!order) return false;
    if (settledOrderIds[order.id]) return true;
    if (order.status === "COMPLETED") {
      if (order.shippingMethod === "STORE_DELIVERY" || order.courierName) {
        const cKey = order.courierName || "test";
        return !!reconciledCouriers[cKey];
      }
      return true;
    }
    return false;
  };

  // 1. ACTIVE ORDERS (Pesanan Masuk / Diproses di Dapur)
  const activeOrders = useMemo(
    () =>
      allOrders.filter(
        (o) =>
          o.status === "PENDING" ||
          o.status === "CONFIRMED" ||
          o.status === "PROCESSING"
      ),
    [allOrders]
  );

  // 2. SHIPPED ORDERS (Tab Dikirim): Semua pesanan yang sedang diantar kurir & belum direkonsiliasi toko
  const shippedOrders = useMemo(
    () =>
      allOrders.filter((o) => {
        if (o.status === "CANCELLED") return false;
        if (
          o.status === "PENDING" ||
          o.status === "CONFIRMED" ||
          o.status === "PROCESSING"
        )
          return false;
        return !isOrderReconciled(o);
      }),
    [allOrders, settledOrderIds, reconciledCouriers]
  );

  // 3. COMPLETED ORDERS (Tab Selesai): Pesanan yang telah selesai & diverifikasi rekonsiliasinya
  const completedOrders = useMemo(
    () =>
      allOrders.filter((o) => {
        if (o.status === "CANCELLED") return false;
        if (isOrderReconciled(o)) return true;
        if (
          o.status === "COMPLETED" &&
          o.shippingMethod !== "STORE_DELIVERY" &&
          !o.courierName
        ) {
          return true;
        }
        return false;
      }),
    [allOrders, settledOrderIds, reconciledCouriers]
  );

  const totalRevenue = useMemo(
    () => completedOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
    [completedOrders]
  );

  const handleReconcileCourier = (
    courierId: string,
    courierName: string,
    codAmount: number,
    ordersToSettle: MerchantOrder[]
  ) => {
    const storeId = store?.id || "default";

    // 1. Mark orders as settled
    const newSettledOrderIds = { ...settledOrderIds };
    ordersToSettle.forEach((o) => {
      newSettledOrderIds[o.id] = true;
      onUpdateOrderStatus(o.id, "COMPLETED");
    });
    setSettledOrderIds(newSettledOrderIds);
    localStorage.setItem(
      `sera_store_settled_orders_${storeId}`,
      JSON.stringify(newSettledOrderIds)
    );

    // 2. Mark courier as reconciled
    const newReconciled = {
      ...reconciledCouriers,
      [courierId]: true,
      [courierName]: true,
      default: true
    };
    setReconciledCouriers(newReconciled);
    localStorage.setItem(
      `sera_store_reconciled_couriers_${storeId}`,
      JSON.stringify(newReconciled)
    );
    localStorage.setItem(`sera_store_cod_settled_${storeId}`, Date.now().toString());
    localStorage.setItem("sera_driver_settled_me", Date.now().toString());

    // 3. Dispatch event to driver app
    window.dispatchEvent(
      new CustomEvent("sera:driver-settlement-confirmed", { detail: { courierId } })
    );

    // 4. Success message
    const codText =
      codAmount > 0 ? ` dan kas COD sebesar Rp ${codAmount.toLocaleString("id-ID")}` : "";
    setSettlementSuccessMsg(
      `${ordersToSettle.length} pesanan dari kurir ${courierName}${codText} resmi diverifikasi dan dipindahkan ke tab Selesai.`
    );
    setTimeout(() => setSettlementSuccessMsg(null), 4500);
  };

  return {
    filter,
    setFilter,
    allOrders,
    activeOrders,
    shippedOrders,
    completedOrders,
    totalRevenue,
    isOrderReconciled,
    handleReconcileCourier,
    settlementSuccessMsg
  };
}

