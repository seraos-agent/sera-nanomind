import React, { useEffect, useCallback } from "react";
import { getApiBaseUrl } from "../../../config/marketplaceConfig";
import { safeSetStorage, cleanupBloatedOrdersStorage } from "../../../utils/safeStorage";
import { mapPosTransactionToMerchantOrder } from "../utils/posOrderMapper";
import {
  type MerchantStore,
  type MerchantProduct,
  type MerchantOrder,
  type MerchantReview,
  normalizeStoreType,
  isStoreCurrentlyOpen
} from "../types";

interface UseMerchantRemoteSyncProps {
  store: MerchantStore | null;
  setStore: React.Dispatch<React.SetStateAction<MerchantStore | null>>;
  products: MerchantProduct[];
  setProducts: React.Dispatch<React.SetStateAction<MerchantProduct[]>>;
  orders: MerchantOrder[];
  setOrders: React.Dispatch<React.SetStateAction<MerchantOrder[]>>;
  setReviews: React.Dispatch<React.SetStateAction<MerchantReview[]>>;
  userEmail?: string | null;
  socket: any;
  mapMarketplaceOrderToMerchant: (co: any) => MerchantOrder;
}

export function useMerchantRemoteSync({
  store,
  setStore,
  products,
  setProducts,
  orders,
  setOrders,
  setReviews,
  userEmail,
  socket,
  mapMarketplaceOrderToMerchant
}: UseMerchantRemoteSyncProps) {
  // Proactively prune bloated localStorage on hook mount
  useEffect(() => {
    cleanupBloatedOrdersStorage();
  }, []);

  // LocalStorage Persistence Sync with safe QuotaExceededError protection
  useEffect(() => {
    if (store) {
      safeSetStorage("sera_merchant_store", JSON.stringify(store));
    }
  }, [store]);

  useEffect(() => {
    safeSetStorage("sera_merchant_products", JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    if (orders) {
      safeSetStorage("sera_merchant_orders", JSON.stringify(orders));
    }
  }, [orders]);

  // Auto-recover store tied to userEmail when local storage is empty or belongs to another email
  useEffect(() => {
    const cleanEmail = userEmail?.trim().toLowerCase();
    if (!cleanEmail) return;

    const currentOwner = store?.ownerId?.trim().toLowerCase();
    const isMismatch = Boolean(store && currentOwner && currentOwner !== cleanEmail);
    if (store?.id && !isMismatch) return;

    if (isMismatch) {
      setStore(null);
      setProducts([]);
      setOrders([]);
      try {
        localStorage.removeItem("sera_merchant_store");
        localStorage.removeItem("sera_merchant_products");
        localStorage.removeItem("sera_merchant_orders");
      } catch {}
    }

    let cancelled = false;
    const recoverStoreByEmail = async () => {
      try {
        const res = await fetch(
          `${getApiBaseUrl()}/api/market/stores?ownerId=${encodeURIComponent(cleanEmail)}`
        );
        if (!res.ok || cancelled) return;
        const json = await res.json();
        const candidates: any[] = Array.isArray(json?.data) ? json.data : [];
        if (candidates.length === 0 || cancelled) return;

        // Prefer stores that already have products
        const sorted = [...candidates].sort(
          (a, b) => Number(b?.totalProducts || 0) - Number(a?.totalProducts || 0)
        );
        const picked = sorted[0];
        if (!picked?.id || cancelled) return;

        const liveStatus = isStoreCurrentlyOpen(picked);
        const recovered: MerchantStore = {
          ...picked,
          ownerId: picked.ownerId || cleanEmail,
          type: normalizeStoreType(picked.type),
          isOpen: liveStatus.isOpen
        };
        setStore(recovered);
        safeSetStorage("sera_merchant_store", JSON.stringify(recovered));
        window.dispatchEvent(new Event("sera_merchant_store_updated"));
      } catch {}
    };

    recoverStoreByEmail();
    return () => {
      cancelled = true;
    };
  }, [userEmail, store?.id, store?.ownerId, setStore, setProducts, setOrders]);

  // Initial & Periodic Sync from Backend API (Live Orders, Products & Reviews)
  const fetchRemoteReviews = useCallback(async () => {
    if (!store?.id) return;
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/market/reviews?storeId=${store.id}`);
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.data)) {
          setReviews(json.data);
        }
      }
    } catch {}
  }, [store?.id, setReviews]);

  useEffect(() => {
    if (!store?.id) return;
    const fetchRemoteData = async () => {
      try {
        const [ordersRes, posTxRes, productsRes, reviewsRes, storeRes] = await Promise.all([
          fetch(`${getApiBaseUrl()}/api/market/orders?storeId=${store.id}`),
          fetch(`${getApiBaseUrl()}/api/market/pos/transactions?storeId=${store.id}`),
          fetch(`${getApiBaseUrl()}/api/market/products?storeId=${store.id}&includeDrafts=true`),
          fetch(`${getApiBaseUrl()}/api/market/reviews?storeId=${store.id}`),
          fetch(`${getApiBaseUrl()}/api/market/stores/${store.id}`)
        ]);

        let remoteStoreCustomCategories: string[] | undefined;
        let remoteStoreIsOpen: boolean | undefined;
        let remoteStoreManualOverrideClosed: boolean | undefined;
        let remoteStoreManualOverrideOpen: boolean | undefined;
        let remoteStoreIsOpenManualOverride: boolean | null | undefined;
        if (storeRes.ok) {
          try {
            const storeJson = await storeRes.json();
            const remoteStore = storeJson?.data?.store;
            if (remoteStore) {
              if (Array.isArray(remoteStore.customCategories)) {
                remoteStoreCustomCategories = remoteStore.customCategories;
              }
              if (typeof remoteStore.isOpen === "boolean") {
                remoteStoreIsOpen = remoteStore.isOpen;
              }
              remoteStoreManualOverrideClosed = remoteStore.manualOverrideClosed;
              remoteStoreManualOverrideOpen = remoteStore.manualOverrideOpen;
              remoteStoreIsOpenManualOverride = remoteStore.isOpenManualOverride;
            }
          } catch {}
        }

        let mappedPosOrders: MerchantOrder[] = [];
        if (posTxRes.ok) {
          try {
            const posJson = await posTxRes.json();
            if (Array.isArray(posJson.data)) {
              mappedPosOrders = posJson.data.map((tx: any) => mapPosTransactionToMerchantOrder(tx));
            }
          } catch {}
        }

        if (ordersRes.ok) {
          const json = await ordersRes.json();
          if (Array.isArray(json.data)) {
            const mappedOnline: MerchantOrder[] = json.data.map((mo: any) => ({
              ...mapMarketplaceOrderToMerchant(mo),
              orderSource: "ONLINE" as const
            }));
            const mapped: MerchantOrder[] = [...mappedOnline, ...mappedPosOrders];
            const LEGACY_DUMMY_IDS = new Set([
              "ORD-98214",
              "ORD-98230",
              "ORD-98240",
              "ORD-98188"
            ]);

            const STATUS_WEIGHT: Record<string, number> = {
              PENDING: 1,
              CONFIRMED: 1,
              PROCESSING: 2,
              SHIPPED: 3,
              DELIVERED: 4,
              COMPLETED: 5,
              CANCELLED: 6
            };

            setOrders((prev) => {
              const prevMap = new Map(prev.map((o) => [o.id, o]));
              const customerOrderMap = new Map<string, any>();

              try {
                const rawCo = localStorage.getItem("sera_customer_orders");
                if (rawCo) {
                  const coList = JSON.parse(rawCo);
                  if (Array.isArray(coList)) {
                    coList.forEach((co: any) => {
                      customerOrderMap.set(co.id, co);
                      const mappedCo = mapMarketplaceOrderToMerchant(co);
                      const existing = prevMap.get(co.id);
                      if (existing) {
                        if (!existing.paymentProofUrl && mappedCo.paymentProofUrl) {
                          existing.paymentProofUrl = mappedCo.paymentProofUrl;
                        }
                      } else if (!co.storeId || co.storeId === store.id) {
                        prevMap.set(co.id, mappedCo);
                      }
                    });
                  }
                }
              } catch {}

              const remoteIds = new Set<string>();
              mapped.forEach((m) => {
                remoteIds.add(m.id);
                if (m.posTransactionId) remoteIds.add(m.posTransactionId);
                if (m.posReceiptNumber) remoteIds.add(m.posReceiptNumber);
              });
              const merged = [
                ...mapped.map((m) => {
                  const existing =
                    prevMap.get(m.id) ||
                    (m.posTransactionId ? prevMap.get(m.posTransactionId) : undefined);
                  const customerOrder = customerOrderMap.get(m.id);
                  const existingWeight = STATUS_WEIGHT[existing?.status || ""] || 0;
                  const remoteWeight = STATUS_WEIGHT[m.status || ""] || 0;
                  const finalStatus =
                    m.orderSource === "POS"
                      ? m.status
                      : existingWeight > remoteWeight
                        ? existing!.status
                        : m.status;
                  const resolvedPaymentProof =
                    m.paymentProofUrl ||
                    existing?.paymentProofUrl ||
                    customerOrder?.paymentProofUrl ||
                    customerOrder?.payment_proof_url;

                  return {
                    ...m,
                    status: finalStatus,
                    paymentProofUrl: resolvedPaymentProof,
                    customerName:
                      m.customerName &&
                      m.customerName !== "Marketplace Buyer" &&
                      m.customerName !== "Pelanggan Marketplace"
                        ? m.customerName
                        : existing?.customerName || m.customerName,
                    customerPhone:
                      m.customerPhone && m.customerPhone !== "-"
                        ? m.customerPhone
                        : existing?.customerPhone || m.customerPhone,
                    shippingAddress:
                      m.shippingAddress && m.shippingAddress !== "-"
                        ? m.shippingAddress
                        : existing?.shippingAddress || m.shippingAddress,
                    shippingMethod:
                      m.shippingMethod && m.shippingMethod !== "REGULAR"
                        ? m.shippingMethod
                        : existing?.shippingMethod || m.shippingMethod,
                    itemsSummary:
                      m.itemsSummary && m.itemsSummary !== "Order" && m.itemsSummary !== "Pesanan"
                        ? m.itemsSummary
                        : existing?.itemsSummary || m.itemsSummary,
                    customerNote: m.customerNote || existing?.customerNote,
                    courierStatus: m.courierStatus || existing?.courierStatus,
                    courierName: m.courierName || existing?.courierName,
                    courierPhone: m.courierPhone || existing?.courierPhone,
                    destCoords: m.destCoords || existing?.destCoords
                  };
                }),
                ...Array.from(prevMap.values()).filter(
                  (p) =>
                    !remoteIds.has(p.id) &&
                    !(p.posReceiptNumber && remoteIds.has(p.posReceiptNumber)) &&
                    !LEGACY_DUMMY_IDS.has(p.id)
                )
              ];
              safeSetStorage("sera_merchant_orders", JSON.stringify(merged));
              return merged;
            });

            // Asynchronously check courier dispatch in background
            Promise.all(
              mapped
                .filter(
                  (o) =>
                    o.status !== "COMPLETED" &&
                    o.status !== "CANCELLED" &&
                    o.shippingMethod !== "PICKUP"
                )
                .map(async (o) => {
                  try {
                    const rideRes = await fetch(
                      `${getApiBaseUrl()}/api/market/rides/order/${o.id}`
                    );
                    if (rideRes.ok) {
                      const rJson = await rideRes.json();
                      const ride = rJson.data;
                      if (ride) {
                        setOrders((current) =>
                          current.map((item) => {
                            if (item.id === o.id) {
                              const nextStatus =
                                ride.status === "ON_THE_WAY" &&
                                (STATUS_WEIGHT[item.status] || 0) < 3
                                  ? "SHIPPED"
                                  : ride.status === "COMPLETED" &&
                                      (STATUS_WEIGHT[item.status] || 0) < 4
                                    ? "DELIVERED"
                                    : item.status;
                              return {
                                ...item,
                                status: nextStatus,
                                courierName: ride.driver?.name || item.courierName,
                                courierPhone: ride.driver?.phone || item.courierPhone,
                                courierStatus:
                                  ride.status === "SEARCHING"
                                    ? "SEARCHING"
                                    : ride.status === "ACCEPTED"
                                      ? "ACCEPTED"
                                      : ride.status === "PICKING_UP"
                                        ? "PICKING_UP"
                                        : ride.status === "ON_THE_WAY"
                                          ? "ON_THE_WAY"
                                          : ride.status === "COMPLETED"
                                            ? "DELIVERED"
                                            : item.courierStatus
                              };
                            }
                            return item;
                          })
                        );
                      }
                    }
                  } catch {}
                })
            ).catch(() => {});
          }
        }

        if (productsRes.ok) {
          const json = await productsRes.json();
          if (Array.isArray(json.data)) {
            const remoteMapped: MerchantProduct[] = json.data.map((p: any) => ({
              id: p.id,
              storeId: p.storeId || store.id,
              name: p.name,
              description: p.description || "",
              price: Number(p.price || 0),
              originalPrice: p.originalPrice
                ? Number(p.originalPrice)
                : Number(p.price || 0),
              normalPrice: p.originalPrice
                ? Number(p.originalPrice)
                : Number(p.price || 0),
              discountType: p.discountType || "%",
              discountValue: p.discountValue || 0,
              finalPrice: Number(p.price || 0),
              currency: p.currency || "IDR",
              stock: p.stock ?? 20,
              weight: p.weight !== undefined && p.weight !== null ? Number(p.weight) : undefined,
              weightUnit: p.weightUnit === "ml" ? "ml" : "g",
              type: p.type || "GOODS",
              category: p.category || "General",
              images: Array.isArray(p.images) ? p.images : [],
              status: p.status === "DRAFT" ? "DRAFT" : "ACTIVE",
              barcode: p.barcode || "",
              variants: Array.isArray(p.variants) ? p.variants : [],
              createdAt: p.createdAt || Date.now()
            }));

            setProducts((prev) => {
              if (remoteMapped.length === 0 && prev.length > 0) {
                // Keep local products if remote temporarily returns empty array
                return prev;
              }
              const remoteIds = new Set(remoteMapped.map((p) => p.id));
              // Preserve any newly created products within last 2 minutes not yet in remote response
              const localPending = (prev || []).filter(
                (p) => !remoteIds.has(p.id) && Date.now() - (p.createdAt || 0) < 120000
              );
              return [...remoteMapped, ...localPending];
            });

            // Reconstruct missing customCategories from existing remote products (survives app reinstall)
            const derivedCats: string[] = [];
            for (const p of remoteMapped) {
              const c = (p.category || "").trim();
              const lower = c.toLowerCase();
              if (c && lower !== "umum" && lower !== "general") {
                derivedCats.push(c);
              }
            }
            if (derivedCats.length > 0 || remoteStoreCustomCategories !== undefined || remoteStoreIsOpen !== undefined) {
              setStore((prevStore) => {
                if (!prevStore) return prevStore;
                const baseCategories =
                  remoteStoreCustomCategories !== undefined
                    ? remoteStoreCustomCategories
                    : prevStore.customCategories || [];
                const seen = new Set(baseCategories.map((c) => c.trim().toLowerCase()));
                const additions = derivedCats.filter((c) => {
                  const lower = c.toLowerCase();
                  if (seen.has(lower)) return false;
                  seen.add(lower);
                  return true;
                });
                const mergedCategories = [...baseCategories, ...additions];
                const categoriesChanged =
                  JSON.stringify(prevStore.customCategories || []) !== JSON.stringify(mergedCategories);
                const openChanged =
                  remoteStoreIsOpen !== undefined && remoteStoreIsOpen !== prevStore.isOpen;

                if (!categoriesChanged && !openChanged) return prevStore;

                if (additions.length > 0) {
                  void fetch(`${getApiBaseUrl()}/api/market/stores/${prevStore.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ customCategories: mergedCategories })
                  }).catch(() => {});
                }
                return {
                  ...prevStore,
                  customCategories: mergedCategories,
                  ...(remoteStoreIsOpen !== undefined ? { isOpen: remoteStoreIsOpen } : {}),
                  ...(remoteStoreManualOverrideClosed !== undefined
                    ? { manualOverrideClosed: remoteStoreManualOverrideClosed }
                    : {}),
                  ...(remoteStoreManualOverrideOpen !== undefined
                    ? { manualOverrideOpen: remoteStoreManualOverrideOpen }
                    : {}),
                  ...(remoteStoreIsOpenManualOverride !== undefined
                    ? { isOpenManualOverride: remoteStoreIsOpenManualOverride }
                    : {})
                };
              });
            }
          }
        } else if (remoteStoreCustomCategories !== undefined || remoteStoreIsOpen !== undefined) {
          setStore((prevStore) => {
            if (!prevStore) return prevStore;
            const nextCategories =
              remoteStoreCustomCategories !== undefined
                ? remoteStoreCustomCategories
                : prevStore.customCategories;
            const categoriesChanged =
              remoteStoreCustomCategories !== undefined &&
              JSON.stringify(prevStore.customCategories || []) !== JSON.stringify(nextCategories || []);
            const openChanged =
              remoteStoreIsOpen !== undefined && remoteStoreIsOpen !== prevStore.isOpen;
            if (!categoriesChanged && !openChanged) return prevStore;
            return {
              ...prevStore,
              ...(nextCategories !== undefined ? { customCategories: nextCategories } : {}),
              ...(remoteStoreIsOpen !== undefined ? { isOpen: remoteStoreIsOpen } : {}),
              ...(remoteStoreManualOverrideClosed !== undefined
                ? { manualOverrideClosed: remoteStoreManualOverrideClosed }
                : {}),
              ...(remoteStoreManualOverrideOpen !== undefined
                ? { manualOverrideOpen: remoteStoreManualOverrideOpen }
                : {}),
              ...(remoteStoreIsOpenManualOverride !== undefined
                ? { isOpenManualOverride: remoteStoreIsOpenManualOverride }
                : {})
            };
          });
        }

        if (reviewsRes.ok) {
          const json = await reviewsRes.json();
          if (Array.isArray(json.data)) {
            setReviews(json.data);
          }
        }
      } catch (err) {
        console.warn("Could not sync remote merchant data:", err);
      }
    };

    fetchRemoteData();
    const interval = setInterval(fetchRemoteData, 3000);
    window.addEventListener("focus", fetchRemoteData);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", fetchRemoteData);
    };
  }, [store?.id, setOrders, setProducts, setReviews, mapMarketplaceOrderToMerchant]);

  // Real-time Listeners: Socket.IO, Storage & Window Events
  useEffect(() => {
    // 1. Cross-tab storage synchronization
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "sera_merchant_orders" && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setOrders(parsed);
          }
        } catch {}
      } else if (e.key === "sera_customer_orders" && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setOrders((prev) => {
              const prevMap = new Map(prev.map((o) => [o.id, o]));
              let hasNew = false;
              parsed.forEach((co: any) => {
                if (!prevMap.has(co.id) && (!co.storeId || co.storeId === store?.id)) {
                  hasNew = true;
                  prevMap.set(co.id, mapMarketplaceOrderToMerchant(co));
                }
              });
              if (hasNew) {
                const nextList = Array.from(prevMap.values());
                safeSetStorage("sera_merchant_orders", JSON.stringify(nextList));
                return nextList;
              }
              return prev;
            });
          }
        } catch {}
      }
    };
    window.addEventListener("storage", handleStorage);

    // 2. Custom window event for instant in-tab notifications
    const handleNewOrderEvent = (e: Event) => {
      const customEvent = e as CustomEvent<any>;
      const newOrder = customEvent.detail;
      if (newOrder && (!newOrder.storeId || newOrder.storeId === store?.id)) {
        setOrders((prev) => {
          const mapped = mapMarketplaceOrderToMerchant(newOrder);
          const existingIdx = prev.findIndex((o) => o.id === newOrder.id);
          let next: MerchantOrder[];
          if (existingIdx !== -1) {
            next = [...prev];
            next[existingIdx] = {
              ...next[existingIdx],
              ...mapped,
              paymentProofUrl: mapped.paymentProofUrl || next[existingIdx].paymentProofUrl
            };
          } else {
            next = [mapped, ...prev];
          }
          safeSetStorage("sera_merchant_orders", JSON.stringify(next));
          return next;
        });
      }
    };
    window.addEventListener("sera:new-merchant-order", handleNewOrderEvent);
    window.addEventListener("sera:new-market-order", handleNewOrderEvent);

    // 3. Socket real-time events from backend server
    const handleSocketNewOrder = (orderData: any) => {
      if (orderData && (!orderData.storeId || orderData.storeId === store?.id)) {
        setOrders((prev) => {
          const mapped = mapMarketplaceOrderToMerchant(orderData);
          const existingIdx = prev.findIndex((o) => o.id === orderData.id);
          let next: MerchantOrder[];
          if (existingIdx !== -1) {
            next = [...prev];
            next[existingIdx] = {
              ...next[existingIdx],
              ...mapped,
              paymentProofUrl: mapped.paymentProofUrl || next[existingIdx].paymentProofUrl
            };
          } else {
            next = [mapped, ...prev];
          }
          safeSetStorage("sera_merchant_orders", JSON.stringify(next));
          return next;
        });
      }
    };

    const handleSocketStatusUpdate = (updateData: any) => {
      if (updateData && updateData.id) {
        setOrders((prev) => {
          let changed = false;
          const next = prev.map((o) => {
            if (o.id === updateData.id) {
              changed = true;
              let s: MerchantOrder["status"] = o.status;
              if (
                updateData.orderStatus === "PREPARING" ||
                updateData.orderStatus === "PROCESSING"
              )
                s = "PROCESSING";
              else if (updateData.orderStatus === "SHIPPED") s = "SHIPPED";
              else if (updateData.orderStatus === "DELIVERED") s = "DELIVERED";
              else if (updateData.orderStatus === "COMPLETED") s = "COMPLETED";
              else if (updateData.orderStatus === "CANCELLED") s = "CANCELLED";
              return { ...o, status: s };
            }
            return o;
          });
          if (changed) {
            safeSetStorage("sera_merchant_orders", JSON.stringify(next));
            return next;
          }
          return prev;
        });
      }
    };

    const handlePosTransactionCreated = (tx: any) => {
      if (!tx || (store?.id && tx.storeId !== store.id)) return;
      const mapped = mapPosTransactionToMerchantOrder(tx);
      setOrders((prev) => {
        const filtered = prev.filter(
          (o) =>
            o.id !== mapped.id &&
            (!mapped.posTransactionId || o.posTransactionId !== mapped.posTransactionId)
        );
        const next = [mapped, ...filtered];
        safeSetStorage("sera_merchant_orders", JSON.stringify(next));
        return next;
      });
    };

    const handlePosTransactionVoided = (tx: any) => {
      if (!tx || (store?.id && tx.storeId !== store.id)) return;
      setOrders((prev) => {
        let changed = false;
        const next = prev.map((o) => {
          if (o.posTransactionId === tx.id || o.id === tx.receiptNumber || o.id === tx.id) {
            changed = true;
            return { ...o, status: "CANCELLED" as const, posVoided: true };
          }
          return o;
        });
        if (changed) {
          safeSetStorage("sera_merchant_orders", JSON.stringify(next));
          return next;
        }
        return prev;
      });
    };

    const handleLocalPosVoid = (e: Event) => {
      const detail = (e as CustomEvent)?.detail;
      if (detail) handlePosTransactionVoided(detail);
    };

    window.addEventListener("sera:pos-transaction-voided", handleLocalPosVoid);

    if (socket) {
      socket.on("market:new_order", handleSocketNewOrder);
      socket.on("market:order_status_updated", handleSocketStatusUpdate);
      socket.on("pos:transaction_created", handlePosTransactionCreated);
      socket.on("pos:transaction_voided", handlePosTransactionVoided);
    }

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("sera:new-merchant-order", handleNewOrderEvent);
      window.removeEventListener("sera:new-market-order", handleNewOrderEvent);
      window.removeEventListener("sera:pos-transaction-voided", handleLocalPosVoid);
      if (socket) {
        socket.off("market:new_order", handleSocketNewOrder);
        socket.off("market:order_status_updated", handleSocketStatusUpdate);
        socket.off("pos:transaction_created", handlePosTransactionCreated);
        socket.off("pos:transaction_voided", handlePosTransactionVoided);
      }
    };
  }, [socket, store?.id, setOrders, mapMarketplaceOrderToMerchant]);

  // Real-time synchronization of courier status (Online / Offline)
  useEffect(() => {
    const handleStatusChanged = (e: any) => {
      const { courierId, status } = e.detail || {};
      if (!courierId) return;
      setStore((prev) => {
        if (!prev || !prev.linkedCouriers) return prev;
        return {
          ...prev,
          linkedCouriers: prev.linkedCouriers.map((c) =>
            c.id === courierId ? { ...c, status } : c
          )
        };
      });
    };
    window.addEventListener("sera:courier-status-changed", handleStatusChanged);
    return () => {
      window.removeEventListener("sera:courier-status-changed", handleStatusChanged);
    };
  }, [setStore]);

  return {
    fetchRemoteReviews
  };
}

