import type { DeliveryStop } from "../../types";
import { getApiBaseUrl } from "../../../../config/marketplaceConfig";
import { calculateRoadDistanceKm, isRealCustomerAddress } from "./deliveryMapUtils";

export const DUMMY_STOPS = new Set([
  "STP-01",
  "STP-02",
  "STP-03",
  "ORD-9912",
  "ORD-9915",
  "ORD-9920"
]);

function readLocalArray(key: string): any[] {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

/**
 * Aggregates dispatched orders from the remote marketplace API and localStorage caches
 * into normalized DeliveryStop entries, preserving permanent stop numbers.
 */
export async function syncEligibleStopsFromSources(
  linkedStoreId: string | undefined,
  prevQueue: DeliveryStop[],
  referenceCoords: { lat: number; lng: number }
): Promise<DeliveryStop[]> {
  let remoteOrders: any[] = [];
  const storeQuery = linkedStoreId ? `?storeId=${linkedStoreId}` : "";
  try {
    const res = await fetch(`${getApiBaseUrl()}/api/market/orders${storeQuery}`);
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.data)) remoteOrders = json.data;
    }
  } catch {}

  const localCustomerOrders = readLocalArray("sera_customer_orders");
  const localMerchantOrders = readLocalArray("sera_merchant_orders");

  const merchantOrderMap = new Map<string, any>();
  localMerchantOrders.forEach((mo) => {
    if (mo?.id) merchantOrderMap.set(mo.id, mo);
  });

  const customerOrderMap = new Map<string, any>();
  localCustomerOrders.forEach((co) => {
    if (co?.id) customerOrderMap.set(co.id, co);
  });

  const combinedMap = new Map<string, any>();
  remoteOrders.forEach((o) => combinedMap.set(o.id, o));

  localCustomerOrders.forEach((o) => {
    if (!combinedMap.has(o.id) && (!linkedStoreId || !o.storeId || o.storeId === linkedStoreId)) {
      combinedMap.set(o.id, o);
    } else if (combinedMap.has(o.id)) {
      const existingRemote = combinedMap.get(o.id);
      const resolvedAddress = existingRemote.customer?.address || o.customer?.address;
      const resolvedCoords =
        existingRemote.destCoords ||
        existingRemote.customer?.destCoords ||
        o.destCoords ||
        o.customer?.destCoords;
      combinedMap.set(o.id, {
        ...existingRemote,
        destCoords: resolvedCoords,
        customer: {
          ...existingRemote.customer,
          address: resolvedAddress,
          destCoords: resolvedCoords
        }
      });
    }
  });

  localMerchantOrders.forEach((mo) => {
    const matchingCo = customerOrderMap.get(mo.id);
    const resolvedCoords =
      mo.destCoords || matchingCo?.destCoords || matchingCo?.customer?.destCoords;

    if (!combinedMap.has(mo.id)) {
      combinedMap.set(mo.id, {
        id: mo.id,
        storeId: linkedStoreId,
        shippingMethod: mo.shippingMethod,
        orderStatus: mo.status,
        paymentMethod: mo.paymentMethod,
        totalAmount: mo.totalAmount,
        itemsSummary: mo.itemsSummary,
        shippingAddress: mo.shippingAddress,
        destCoords: resolvedCoords,
        customer: {
          name: mo.customerName,
          phone: mo.customerPhone,
          address: mo.shippingAddress,
          destCoords: resolvedCoords
        }
      });
    } else if (resolvedCoords) {
      const existingItem = combinedMap.get(mo.id);
      if (!existingItem.destCoords) {
        combinedMap.set(mo.id, {
          ...existingItem,
          destCoords: resolvedCoords,
          customer: {
            ...existingItem.customer,
            destCoords: resolvedCoords
          }
        });
      }
    }
  });

  const eligibleOrders = Array.from(combinedMap.values()).filter((o: any) => {
    const localMo = merchantOrderMap.get(o.id);
    const effectiveStatus = localMo?.status || o.orderStatus || o.status;
    const effectiveShipping = o.shippingMethod || localMo?.shippingMethod;
    return (
      effectiveShipping !== "PICKUP" &&
      effectiveStatus !== "CANCELLED" &&
      (effectiveStatus === "SHIPPED" || effectiveStatus === "DELIVERED" || effectiveStatus === "COMPLETED")
    );
  });

  if (eligibleOrders.length === 0) {
    return [];
  }

  const cleanPrev = prevQueue.filter((s) => !DUMMY_STOPS.has(s.id) && !DUMMY_STOPS.has(s.orderId));
  const prevMap = new Map(cleanPrev.map((s) => [s.orderId, s]));

  const savedCustomerAddress =
    typeof window !== "undefined" ? localStorage.getItem("sera_customer_address") || "" : "";

  const usedActiveNumbers = new Set<number>();
  cleanPrev.forEach((s) => {
    if (s.status !== "COMPLETED" && s.stopNumber) {
      usedActiveNumbers.add(s.stopNumber);
    }
  });
  let nextAssignNum = 1;
  const getNextStopNumber = () => {
    while (usedActiveNumbers.has(nextAssignNum)) {
      nextAssignNum++;
    }
    usedActiveNumbers.add(nextAssignNum);
    return nextAssignNum;
  };

  return eligibleOrders.map((mo: any, idx: number) => {
    const existing = prevMap.get(mo.id);
    const localMo = merchantOrderMap.get(mo.id);
    const effectiveStatus = localMo?.status || mo.orderStatus || mo.status;
    const isCod = (mo.paymentMethod || localMo?.paymentMethod) === "COD";
    const isCompleted =
      effectiveStatus === "COMPLETED" ||
      effectiveStatus === "DELIVERED" ||
      existing?.status === "COMPLETED";

    const assignedStopNumber = existing?.stopNumber
      ? existing.stopNumber
      : isCompleted
        ? idx + 1
        : getNextStopNumber();

    const candidates = [
      mo.customer?.address,
      mo.shippingAddress,
      mo.destAddress,
      localMo?.shippingAddress,
      existing?.destAddress,
      savedCustomerAddress
    ];
    const resolvedAddress =
      candidates.find((c) => isRealCustomerAddress(c)) ||
      mo.customer?.address ||
      mo.shippingAddress ||
      localMo?.shippingAddress ||
      existing?.destAddress ||
      "Store Delivery Address";

    const matchingCo = customerOrderMap.get(mo.id);
    const resolvedCoords =
      mo.destCoords ||
      mo.customer?.destCoords ||
      localMo?.destCoords ||
      matchingCo?.destCoords ||
      matchingCo?.customer?.destCoords ||
      existing?.destCoords;
    const computedDist = resolvedCoords
      ? calculateRoadDistanceKm(referenceCoords, resolvedCoords)
      : existing?.distanceKm || Number((1.2 + idx * 1.4).toFixed(1));
    const computedMinutes = resolvedCoords
      ? Math.max(3, Math.round(computedDist * 3.5))
      : existing?.estimatedMinutes || 5 + idx * 4;

    return {
      id: existing?.id || `STP-${mo.id}`,
      orderId: mo.id,
      stopNumber: assignedStopNumber,
      customerName:
        mo.customer?.name || mo.customerName || localMo?.customerName || existing?.customerName || "Store Customer",
      customerPhone:
        mo.customer?.phone || mo.customerPhone || localMo?.customerPhone || existing?.customerPhone || "08123456789",
      destAddress: resolvedAddress,
      destCoords: resolvedCoords,
      distanceKm: computedDist,
      estimatedMinutes: computedMinutes,
      itemsSummary: Array.isArray(mo.items)
        ? mo.items.map((i: any) => `${i.name} (${i.quantity}x)`).join(", ")
        : mo.itemsSummary || localMo?.itemsSummary || existing?.itemsSummary || "Store Order",
      totalAmount: mo.totalAmount || localMo?.totalAmount || existing?.totalAmount || 50000,
      paymentMethod: isCod ? "COD" : "QRIS",
      isCod,
      codAmount: isCod ? mo.totalAmount || localMo?.totalAmount || 50000 : 0,
      status: isCompleted ? "COMPLETED" : existing?.status || (idx === 0 ? "ACTIVE" : "PENDING"),
      note:
        mo.customer?.notes ||
        mo.notes ||
        (mo.customer?.bookingDate ? "Scheduled Booking Order" : existing?.note || "Please deliver carefully"),
      completedAt: existing?.completedAt
    };
  });
}

export function areStopQueuesEquivalent(prev: DeliveryStop[], next: DeliveryStop[]): boolean {
  const cleanPrev = prev.filter((s) => !DUMMY_STOPS.has(s.id) && !DUMMY_STOPS.has(s.orderId));
  if (cleanPrev.length !== next.length) return false;
  return cleanPrev.every((p, i) => {
    const m = next[i];
    return (
      p.id === m.id &&
      p.orderId === m.orderId &&
      p.status === m.status &&
      p.destAddress === m.destAddress &&
      p.destCoords?.lat === m.destCoords?.lat &&
      p.destCoords?.lng === m.destCoords?.lng &&
      p.totalAmount === m.totalAmount &&
      p.isCod === m.isCod
    );
  });
}

/**
 * Persist DELIVERED status locally across customer/merchant storage caches and emit DOM status event.
 */
export function broadcastStopDeliveredLocally(orderId: string): void {
  try {
    const coList = readLocalArray("sera_customer_orders");
    if (coList.length > 0) {
      const updatedCo = coList.map((co: any) =>
        co.id === orderId ? { ...co, orderStatus: "DELIVERED" } : co
      );
      localStorage.setItem("sera_customer_orders", JSON.stringify(updatedCo));
    }
  } catch {}

  try {
    const moList = readLocalArray("sera_merchant_orders");
    if (moList.length > 0) {
      const updatedMo = moList.map((mo: any) =>
        mo.id === orderId ? { ...mo, status: "DELIVERED", courierStatus: "DELIVERED" } : mo
      );
      localStorage.setItem("sera_merchant_orders", JSON.stringify(updatedMo));
    }
  } catch {}

  try {
    window.dispatchEvent(
      new CustomEvent("sera:order-status-changed", {
        detail: { orderId, status: "DELIVERED" }
      })
    );
  } catch {}
}
