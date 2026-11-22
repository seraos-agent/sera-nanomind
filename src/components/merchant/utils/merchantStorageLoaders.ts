import { safeSetStorage } from "../../../utils/safeStorage";
import {
  type MerchantStore,
  type MerchantProduct,
  type MerchantOrder,
  normalizeStoreType,
  formatOrderDateTime,
  isStoreCurrentlyOpen
} from "../types";

export function mapMarketplaceOrderToMerchant(co: any): MerchantOrder {
  let mappedStatus: MerchantOrder["status"] = "PENDING";
  if (co.orderStatus === "PREPARING" || co.orderStatus === "PROCESSING") {
    mappedStatus = "PROCESSING";
  } else if (co.orderStatus === "SHIPPED") {
    mappedStatus = "SHIPPED";
  } else if (co.orderStatus === "DELIVERED") {
    mappedStatus = "DELIVERED";
  } else if (co.orderStatus === "COMPLETED") {
    mappedStatus = "COMPLETED";
  } else if (co.orderStatus === "CANCELLED") {
    mappedStatus = "CANCELLED";
  } else {
    mappedStatus = "PENDING";
  }

  const resolvedAddr =
    co.customer?.address ||
    co.shippingAddress ||
    co.destAddress ||
    (typeof window !== "undefined" ? localStorage.getItem("sera_customer_address") || "" : "") ||
    "-";

  const itemNotes = Array.isArray(co.items)
    ? co.items
        .map((i: any) =>
          i.notes && String(i.notes).trim() ? `${i.name}: ${String(i.notes).trim()}` : ""
        )
        .filter(Boolean)
        .join("; ")
    : "";
  const resolvedNote =
    (co.customer?.notes && String(co.customer.notes).trim()) ||
    (co.customerNote && String(co.customerNote).trim()) ||
    (co.notes && String(co.notes).trim()) ||
    itemNotes ||
    undefined;

  return {
    id: co.id,
    customerName: co.customer?.name || co.customerName || "Marketplace Buyer",
    customerPhone: co.customer?.phone || co.customerPhone || "-",
    itemsSummary: Array.isArray(co.items)
      ? co.items.map((i: any) => `${i.name} (${i.quantity}x)`).join(", ")
      : co.itemsSummary || "Order",
    totalAmount: co.totalAmount || 0,
    paymentMethod: co.paymentMethod || "DANA",
    paymentStatus: co.paymentStatus === "PAID" ? "PAID" : "PENDING",
    paymentProofUrl:
      co.paymentProofUrl ||
      co.payment_proof_url ||
      co.paymentProof ||
      co.proofUrl ||
      co.customer?.paymentProofUrl ||
      undefined,
    status: mappedStatus,
    createdAt: formatOrderDateTime(co.createdAt),
    shippingMethod:
      co.shippingMethod ||
      (resolvedAddr === "In-Store Pickup" || resolvedAddr === "Ambil di Toko" || resolvedAddr === "Ambil ke Toko"
        ? "PICKUP"
        : "REGULAR"),
    shippingAddress: resolvedAddr,
    destCoords: co.destCoords || co.customer?.destCoords,
    shippingCost: co.deliveryOrServiceFee || co.shippingCost || 0,
    customerNote: resolvedNote
  };
}

export function loadInitialMerchantStore(): MerchantStore | null {
  const saved = localStorage.getItem("sera_merchant_store");
  if (!saved) return null;
  try {
    const parsed = JSON.parse(saved);
    if (parsed && typeof parsed === "object" && parsed.name && parsed.id) {
      if (parsed.id === "toko-berkah-sembako" && parsed.name.toLowerCase() === "toko berkah sembako") {
        try { localStorage.removeItem("sera_merchant_store"); } catch {}
        return null;
      }
      if (parsed.id === "toko-berkah-sembako" && parsed.name.toLowerCase() !== "toko berkah sembako") {
        const newSlug = parsed.name.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-") || "toko-glosir-malang";
        parsed.id = newSlug;
        safeSetStorage("sera_merchant_store", JSON.stringify(parsed));
      }
      const liveStatus = isStoreCurrentlyOpen(parsed);
      return {
        ...parsed,
        type: normalizeStoreType(parsed.type),
        isOpen: liveStatus.isOpen
      };
    }
  } catch {}
  return null;
}

export function loadInitialMerchantProducts(): MerchantProduct[] {
  const saved = localStorage.getItem("sera_merchant_products");
  if (!saved) return [];
  try {
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const clean = parsed.filter((p: any) => p.id !== "prod-1" && p.id !== "prod-2");
      return clean.map((p: any) => ({
        ...p,
        price: Number(p.price || p.finalPrice || p.normalPrice || 0),
        originalPrice: p.originalPrice
          ? Number(p.originalPrice)
          : Number(p.price || p.finalPrice || 0),
        images:
          Array.isArray(p.images) && p.images.length > 0
            ? p.images
            : ["https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500"]
      }));
    }
  } catch {}
  return [];
}

export function loadInitialMerchantOrders(): MerchantOrder[] {
  let combined: MerchantOrder[] = [];
  const saved = localStorage.getItem("sera_merchant_orders");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        const LEGACY_DUMMY_IDS = new Set([
          "ORD-98214",
          "ORD-98230",
          "ORD-98240",
          "ORD-98188"
        ]);
        combined = parsed.filter((o) => !LEGACY_DUMMY_IDS.has(o.id));
      }
    } catch {}
  }

  try {
    const customerRaw = localStorage.getItem("sera_customer_orders");
    if (customerRaw) {
      const customerOrders = JSON.parse(customerRaw);
      if (Array.isArray(customerOrders)) {
        const combinedMap = new Map(combined.map((o) => [o.id, o]));
        customerOrders.forEach((co) => {
          const mapped = mapMarketplaceOrderToMerchant(co);
          const existing = combinedMap.get(co.id);
          if (existing) {
            if (!existing.paymentProofUrl && mapped.paymentProofUrl) {
              existing.paymentProofUrl = mapped.paymentProofUrl;
            }
          } else {
            combined.push(mapped);
            combinedMap.set(co.id, mapped);
          }
        });
      }
    }
  } catch {}

  return combined.map((o: any) => ({
    ...o,
    totalAmount: Number(o.totalAmount || 0),
    createdAt: formatOrderDateTime(o.createdAt)
  }));
}
