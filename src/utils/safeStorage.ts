/**
 * Safe LocalStorage Utilities with QuotaExceededError protection and automatic pruning.
 */

export function safeSetStorage(key: string, value: string): boolean {
  if (typeof window === "undefined") return false;

  try {
    localStorage.setItem(key, value);
    return true;
  } catch (err: any) {
    const isQuotaError =
      err?.name === "QuotaExceededError" ||
      err?.code === 22 ||
      err?.code === 1014 ||
      err?.number === -2147024882 ||
      String(err?.message || "").toLowerCase().includes("quota");

    if (!isQuotaError) {
      console.warn(`[SafeStorage] Failed to save key "${key}":`, err);
      return false;
    }

    console.warn(`[SafeStorage] Quota exceeded while saving key "${key}". Attempting pruning...`);

    // Handle order collections: prune large payment proof data URLs and trim historical records
    if (key === "sera_merchant_orders" || key === "sera_customer_orders") {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Pass 1: Strip large data URLs only from orders older than the top 5
          const prunedPass1 = parsed.map((ord: any, idx: number) => {
            if (idx >= 5 && ord.paymentProofUrl && ord.paymentProofUrl.startsWith("data:")) {
              const { paymentProofUrl: _, ...rest } = ord;
              return rest;
            }
            return ord;
          });

          try {
            localStorage.setItem(key, JSON.stringify(prunedPass1));
            return true;
          } catch {}

          // Pass 2: Keep latest 25 orders with proofs preserved on top 3
          const prunedPass2 = parsed.slice(0, 25).map((ord: any, idx: number) => {
            if (idx >= 3 && ord.paymentProofUrl && ord.paymentProofUrl.startsWith("data:")) {
              const { paymentProofUrl: _, ...rest } = ord;
              return rest;
            }
            return ord;
          });

          try {
            localStorage.setItem(key, JSON.stringify(prunedPass2));
            return true;
          } catch {}
        }
      } catch {}
    }

    // Pass 3: If still failing or other key, try removing legacy bloated keys if present
    try {
      localStorage.removeItem("sera_driver_logs");
      localStorage.removeItem("sera_old_orders_cache");
      localStorage.setItem(key, value);
      return true;
    } catch {
      console.warn(`[SafeStorage] Could not persist key "${key}" even after pruning. Suppressing crash.`);
      return false;
    }
  }
}

export function safeGetStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

/**
 * Emergency cleanup utility to recover when localStorage is completely full.
 */
export function cleanupBloatedOrdersStorage(): void {
  if (typeof window === "undefined") return;
  const targetKeys = ["sera_merchant_orders", "sera_customer_orders"];
  for (const key of targetKeys) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Only strip gigantic uncompressed legacy photos (> 1.5MB) from historical completed/cancelled orders
        const cleaned = parsed.slice(0, 30).map((ord: any, idx: number) => {
          const isHistorical =
            ord.status === "COMPLETED" ||
            ord.status === "CANCELLED" ||
            ord.orderStatus === "COMPLETED" ||
            ord.orderStatus === "CANCELLED";
          if (idx >= 5 && isHistorical && ord.paymentProofUrl && ord.paymentProofUrl.length > 1500000) {
            const { paymentProofUrl: _, ...rest } = ord;
            return rest;
          }
          return ord;
        });
        localStorage.setItem(key, JSON.stringify(cleaned));
      }
    } catch {}
  }
}

