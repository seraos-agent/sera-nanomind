import React, { useRef } from "react";
import { getApiBaseUrl } from "../../../config/marketplaceConfig";
import type { MerchantStore, MerchantOrder } from "../types";
import { isLegacyDummyDriverProfile } from "../../driver/types";

interface UseMerchantOrderActionsProps {
  store: MerchantStore | null;
  setOrders: React.Dispatch<React.SetStateAction<MerchantOrder[]>>;
}

export function useMerchantOrderActions({
  store,
  setOrders
}: UseMerchantOrderActionsProps) {
  // Lock to prevent simultaneous double-clicks during active network dispatch
  const inFlightDispatchRef = useRef<Set<string>>(new Set());

  const handleUpdateOrderStatus = async (
    orderId: string,
    nextStatus: MerchantOrder["status"]
  ) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
    );

    // Sync to buyer's local orders immediately so customer view updates
    try {
      const rawCustomerOrders = localStorage.getItem("sera_customer_orders");
      if (rawCustomerOrders) {
        const coList = JSON.parse(rawCustomerOrders);
        if (Array.isArray(coList)) {
          const updatedCo = coList.map((co: any) =>
            co.id === orderId ? { ...co, orderStatus: nextStatus } : co
          );
          localStorage.setItem("sera_customer_orders", JSON.stringify(updatedCo));
        }
      }
    } catch {}

    // Dispatch global order status changed event
    try {
      window.dispatchEvent(
        new CustomEvent("sera:order-status-changed", {
          detail: { orderId, status: nextStatus }
        })
      );
    } catch {}

    try {
      let backendStatus:
        | "CONFIRMED"
        | "PREPARING"
        | "SHIPPED"
        | "DELIVERED"
        | "COMPLETED"
        | "CANCELLED" = "CONFIRMED";
      if (nextStatus === "PROCESSING") backendStatus = "PREPARING";
      else if (nextStatus === "SHIPPED") backendStatus = "SHIPPED";
      else if (nextStatus === "DELIVERED") backendStatus = "DELIVERED";
      else if (nextStatus === "COMPLETED") backendStatus = "COMPLETED";
      else if (nextStatus === "CANCELLED") backendStatus = "CANCELLED";

      await fetch(`${getApiBaseUrl()}/api/market/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: backendStatus })
      });
    } catch (err) {
      console.warn("Failed to sync order status to backend:", err);
    }
  };

  const handleRequestCourier = async (order: MerchantOrder) => {
    if (!store) return;
    if (inFlightDispatchRef.current.has(order.id)) {
      console.warn(`[OrderActions] Order ${order.id} courier dispatch is already in progress.`);
      return;
    }
    if (order.status === "COMPLETED" || order.status === "CANCELLED") {
      console.warn(`[OrderActions] Order ${order.id} is already completed/cancelled.`);
      return;
    }
    inFlightDispatchRef.current.add(order.id);

    try {
      // Check if an authentic courier for this store in the current browser session is online
      let isDriverOnlineLocally = false;
      try {
        const rawDriver = localStorage.getItem("sera_driver_profile");
        if (rawDriver) {
          const drv = JSON.parse(rawDriver);
          if (!isLegacyDummyDriverProfile(drv) && drv.linkedStoreId === store.id && drv.isOnline !== false) {
            isDriverOnlineLocally = true;
          }
        }
      } catch {}

      // Validation: Store courier cannot be Offline when assigned
      if (
        order.shippingMethod === "STORE_DELIVERY" &&
        store.linkedCouriers &&
        store.linkedCouriers.length > 0
      ) {
        const activeCouriers = store.linkedCouriers.filter(
          (c) => c.status !== "OFFLINE" || isDriverOnlineLocally
        );
        if (activeCouriers.length === 0 && !isDriverOnlineLocally) {
          alert(
            `Your store courier (${store.linkedCouriers[0]?.name || "Courier"}) is currently Offline. Delivery cannot be assigned until the courier switches to Online.`
          );
          return;
        }
      }

      // Immediately advance local order to SHIPPED and SEARCHING
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: "SHIPPED", courierStatus: "SEARCHING" } : o))
      );

      try {
        const resolvedShippingAddress =
          (order.shippingAddress && order.shippingAddress !== "-"
            ? order.shippingAddress
            : "") ||
          (typeof window !== "undefined"
            ? localStorage.getItem("sera_customer_address") || ""
            : "") ||
          "Buyer Address";

        let resolvedDestCoords = order.destCoords;
        if (!resolvedDestCoords && typeof window !== "undefined") {
          try {
            const rawCo = localStorage.getItem("sera_customer_orders");
            if (rawCo) {
              const coList = JSON.parse(rawCo);
              if (Array.isArray(coList)) {
                const matched = coList.find((c: any) => c.id === order.id);
                if (matched?.destCoords || matched?.customer?.destCoords) {
                  resolvedDestCoords = matched.destCoords || matched.customer?.destCoords;
                }
              }
            }
          } catch {}
        }

        const payload = {
          orderId: order.id,
          storeId: store.id,
          merchantName: store.name,
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          pickupAddress: store.address || `${store.name}`,
          destAddress: resolvedShippingAddress,
          destCoords: resolvedDestCoords,
          pickupCoords:
            store.latitude && store.longitude
              ? { lat: store.latitude, lng: store.longitude }
              : undefined,
          itemsDescription: order.itemsSummary,
          serviceType: "MOTOR",
          category: store.type === "FOOD" ? "FOOD" : "GOODS",
          distanceKm: 2.5,
          fareAmount: order.shippingCost || 12000,
          paymentMethod: order.paymentMethod || "QRIS",
          notes:
            order.shippingMethod === "STORE_DELIVERY"
              ? `[Store Courier] Order ${order.id} from ${store.name}`
              : `[Courier Partner] Order ${order.id} from ${store.name}`
        };

        await fetch(`${getApiBaseUrl()}/api/market/rides/request`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        // 1. Advance order status to SHIPPED in merchant dashboard and backend
        await handleUpdateOrderStatus(order.id, "SHIPPED");

        // 2. Update buyer's local orders immediately so CartDrawer moves to "Shipped"
        try {
          const rawCustomerOrders = localStorage.getItem("sera_customer_orders");
          if (rawCustomerOrders) {
            const coList = JSON.parse(rawCustomerOrders);
            if (Array.isArray(coList)) {
              const updatedCo = coList.map((co: any) =>
                co.id === order.id ? { ...co, orderStatus: "SHIPPED" } : co
              );
              localStorage.setItem("sera_customer_orders", JSON.stringify(updatedCo));
            }
          }
        } catch {}

        // 3. Dispatch global order status changed event
        try {
          window.dispatchEvent(
            new CustomEvent("sera:order-status-changed", {
              detail: { orderId: order.id, status: "SHIPPED" }
            })
          );
        } catch {}

        // 4. Dispatch local event for instant in-browser courier delivery queue
        try {
          window.dispatchEvent(
            new CustomEvent("sera:new-delivery-order", {
              detail: {
                id: order.id,
                customerName: order.customerName,
                customerPhone: order.customerPhone,
                shippingAddress: resolvedShippingAddress,
                destAddress: resolvedShippingAddress,
                destCoords: resolvedDestCoords,
                itemsSummary: order.itemsSummary,
                totalAmount: order.totalAmount,
                paymentMethod: order.paymentMethod,
                note: order.customerNote
              }
            })
          );
        } catch {}
      } catch (err) {
        console.warn("Failed to dispatch courier request:", err);
      }
    } catch (err) {
      console.warn("Error in handleRequestCourier:", err);
    } finally {
      inFlightDispatchRef.current.delete(order.id);
    }
  };

  return {
    handleUpdateOrderStatus,
    handleRequestCourier
  };
}

