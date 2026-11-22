import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import type { DriverProfile, DeliveryStop } from "../../types";
import { SAMPLE_DELIVERY_QUEUE } from "../../types";
import { getApiBaseUrl } from "../../../../config/marketplaceConfig";
import {
  computeStopCoordinates,
  geocodeCustomerAddress,
  calculateRoadDistanceKm,
  isRealCustomerAddress
} from "../utils/deliveryMapUtils";
import {
  DUMMY_STOPS,
  syncEligibleStopsFromSources,
  areStopQueuesEquivalent,
  broadcastStopDeliveredLocally
} from "../utils/deliveryOrderSync";

interface UseDeliveryQueueStateOptions {
  driver: DriverProfile;
  isOnline?: boolean;
  onPendingCountChange?: (count: number) => void;
  onUpdateDriver?: (updated: Partial<DriverProfile>) => void;
  onSwitchToMap?: (stop?: DeliveryStop) => void;
  driverCoords?: { lat: number; lng: number };
  fitBoundsToRoute?: (coords: { lat: number; lng: number }) => void;
  resetFittedStopKey?: () => void;
}

export function useDeliveryQueueState({
  driver,
  isOnline = true,
  onPendingCountChange,
  onUpdateDriver,
  onSwitchToMap,
  driverCoords = { lat: -7.5693, lng: 110.8249 },
  fitBoundsToRoute,
  resetFittedStopKey
}: UseDeliveryQueueStateOptions) {
  // 1. Delivery Queue State
  const [deliveryQueue, setDeliveryQueue] = useState<DeliveryStop[]>(() => {
    const storageKey = `sera_driver_queue_${driver.id || "me"}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter((s) => !DUMMY_STOPS.has(s.id) && !DUMMY_STOPS.has(s.orderId));
        }
      } catch {}
    }
    return [];
  });

  // UI States
  const [liveGpsCoords, setLiveGpsCoords] = useState<{ lat: number; lng: number }>(driverCoords);
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const [stopToComplete, setStopToComplete] = useState<DeliveryStop | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [queueTab, setQueueTab] = useState<"ACTIVE" | "COMPLETED" | "PROFILE">("ACTIVE");

  // Track COD settlement status to store
  const [isCodSettled, setIsCodSettled] = useState<boolean>(() => {
    const storageKey = `sera_driver_settled_${driver.id || "me"}`;
    return !!localStorage.getItem(storageKey);
  });

  // Sync queue to localStorage
  useEffect(() => {
    const storageKey = `sera_driver_queue_${driver.id || "me"}`;
    localStorage.setItem(storageKey, JSON.stringify(deliveryQueue));
  }, [deliveryQueue, driver.id]);

  const deliveryQueueRef = useRef(deliveryQueue);
  deliveryQueueRef.current = deliveryQueue;

  // Sync live orders from store & local cache (continuous polling when driver is Online)
  useEffect(() => {
    if (!isOnline) return;

    const fetchStoreOrders = async () => {
      try {
        const referenceCoords = liveGpsCoords || driverCoords;
        const mappedStops = await syncEligibleStopsFromSources(
          driver.linkedStoreId,
          deliveryQueueRef.current,
          referenceCoords
        );
        setDeliveryQueue((latestPrev) =>
          areStopQueuesEquivalent(latestPrev, mappedStops) ? latestPrev : mappedStops
        );
      } catch (err) {
        console.warn("Could not sync live store orders to delivery queue:", err);
      }
    };

    fetchStoreOrders();
    const interval = setInterval(fetchStoreOrders, 10000);
    window.addEventListener("focus", fetchStoreOrders);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", fetchStoreOrders);
    };
  }, [driver.linkedStoreId, isOnline]);

  // Sorted Queue: non-completed stops ordered by nearest distance or manual selection, completed at the end
  const sortedQueue = useMemo(() => {
    const currentCourierLoc = liveGpsCoords || driverCoords;

    const completed = deliveryQueue
      .filter((s) => s.status === "COMPLETED")
      .map((s) => ({ ...s }));

    const pending = deliveryQueue
      .filter((s) => s.status !== "COMPLETED")
      .map((s) => {
        const liveDist = s.destCoords
          ? calculateRoadDistanceKm(currentCourierLoc, s.destCoords)
          : s.distanceKm;
        const liveMinutes = Math.max(3, Math.round(liveDist * 3.5));
        return {
          ...s,
          distanceKm: liveDist,
          estimatedMinutes: liveMinutes
        };
      });

    pending.sort((a, b) => a.distanceKm - b.distanceKm);

    if (selectedStopId) {
      const selectedIndex = pending.findIndex((s) => s.id === selectedStopId);
      if (selectedIndex > 0) {
        const [manualTarget] = pending.splice(selectedIndex, 1);
        pending.unshift(manualTarget);
      }
    }

    return [...pending, ...completed];
  }, [deliveryQueue, liveGpsCoords, driverCoords, selectedStopId]);

  const activeStop = useMemo(() => {
    if (selectedStopId) {
      const selected = sortedQueue.find((s) => s.id === selectedStopId && s.status !== "COMPLETED");
      if (selected) return selected;
    }
    return sortedQueue.find((s) => s.status !== "COMPLETED") || null;
  }, [sortedQueue, selectedStopId]);

  const pendingStops = useMemo(() => {
    return sortedQueue.filter((s) => s.status !== "COMPLETED");
  }, [sortedQueue]);

  useEffect(() => {
    if (onPendingCountChange) {
      onPendingCountChange(pendingStops.length);
    }
  }, [pendingStops.length, onPendingCountChange]);

  const completedStops = useMemo(() => {
    return sortedQueue.filter((s) => s.status === "COMPLETED");
  }, [sortedQueue]);

  const totalCodCollected = useMemo(() => {
    if (isCodSettled) return 0;
    return deliveryQueue
      .filter((s) => s.status === "COMPLETED" && s.isCod)
      .reduce((sum, s) => sum + (s.codAmount || 0), 0);
  }, [deliveryQueue, isCodSettled]);

  // Listen for settlement confirmation from store
  useEffect(() => {
    const handleSettlementConfirmed = () => {
      const settledKey = `sera_driver_settled_${driver.id || "me"}`;
      localStorage.setItem(settledKey, "true");
      setIsCodSettled(true);
      setNotification("Setoran kas COD diterima toko");
      setTimeout(() => setNotification(null), 3500);
    };
    window.addEventListener("sera:driver-settlement-confirmed", handleSettlementConfirmed);
    return () => {
      window.removeEventListener("sera:driver-settlement-confirmed", handleSettlementConfirmed);
    };
  }, []);

  // Listen for live dispatch event from merchant view
  useEffect(() => {
    const handleNewDeliveryOrder = (e: any) => {
      if (!isOnline) return;
      const order = e.detail;
      if (!order) return;

      const savedCustomerAddress =
        typeof window !== "undefined" ? localStorage.getItem("sera_customer_address") || "" : "";
      const candidates = [
        order.shippingAddress,
        order.destAddress,
        order.customer?.address,
        savedCustomerAddress
      ];
      const resolvedAddress =
        candidates.find((c) => isRealCustomerAddress(c)) ||
        order.shippingAddress ||
        order.destAddress ||
        "Alamat Pengantaran Toko";

      const resolvedCoords =
        order.destCoords ||
        order.customer?.destCoords ||
        (typeof window !== "undefined" &&
        localStorage.getItem("sera_customer_lat") &&
        localStorage.getItem("sera_customer_lng") &&
        !isNaN(parseFloat(localStorage.getItem("sera_customer_lat")!)) &&
        !isNaN(parseFloat(localStorage.getItem("sera_customer_lng")!))
          ? {
              lat: parseFloat(localStorage.getItem("sera_customer_lat")!),
              lng: parseFloat(localStorage.getItem("sera_customer_lng")!)
            }
          : undefined);

      const usedActiveNumbers = new Set(
        deliveryQueue.filter((s) => s.status !== "COMPLETED").map((s) => s.stopNumber)
      );
      let nextNum = 1;
      while (usedActiveNumbers.has(nextNum)) {
        nextNum++;
      }

      const newStop: DeliveryStop = {
        id: `STP-${order.id || Date.now().toString().slice(-4)}`,
        orderId: order.id || `ORD-${Date.now().toString().slice(-4)}`,
        stopNumber: nextNum,
        customerName: order.customerName || "Pelanggan Toko",
        customerPhone: order.customerPhone || "08123456789",
        destAddress: resolvedAddress,
        destCoords: resolvedCoords,
        distanceKm: resolvedCoords
          ? calculateRoadDistanceKm(liveGpsCoords || driverCoords, resolvedCoords)
          : Number((1.5 + Math.random() * 2).toFixed(1)),
        estimatedMinutes: Math.round(5 + Math.random() * 8),
        itemsSummary: order.itemsSummary || "Pesanan Toko",
        totalAmount: order.totalAmount || 50000,
        paymentMethod: order.paymentMethod === "COD" ? "COD" : "QRIS",
        isCod: order.paymentMethod === "COD",
        codAmount: order.paymentMethod === "COD" ? order.totalAmount || 50000 : 0,
        status: "ACTIVE",
        note: order.note || "Pesanan baru ditugaskan dari kasir toko"
      };

      setDeliveryQueue((prev) => {
        const withoutSameOrder = prev.filter((s) => s.orderId !== newStop.orderId && s.id !== newStop.id);
        return [newStop, ...withoutSameOrder];
      });
      setSelectedStopId(null);
      if (resetFittedStopKey) resetFittedStopKey();
      setQueueTab("ACTIVE");
      setNotification(`Pesanan baru ${newStop.orderId}`);
      setTimeout(() => setNotification(null), 3500);
    };

    window.addEventListener("sera:new-delivery-order", handleNewDeliveryOrder);
    return () => {
      window.removeEventListener("sera:new-delivery-order", handleNewDeliveryOrder);
    };
  }, [deliveryQueue.length, isOnline, resetFittedStopKey, driverCoords]);

  const geocodingInFlightRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (typeof navigator !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLiveGpsCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {},
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  }, []);

  useEffect(() => {
    const locKey = `${liveGpsCoords.lat.toFixed(2)},${liveGpsCoords.lng.toFixed(2)}`;
    const stopsNeedingGeocode = deliveryQueue.filter(
      (s) =>
        isRealCustomerAddress(s.destAddress) &&
        !geocodingInFlightRef.current.has(`${s.id}:${s.destAddress}@${locKey}`)
    );

    if (stopsNeedingGeocode.length === 0) return;

    let isCancelled = false;

    stopsNeedingGeocode.forEach((stop) => {
      const key = `${stop.id}:${stop.destAddress}@${locKey}`;
      geocodingInFlightRef.current.add(key);

      geocodeCustomerAddress(stop.destAddress, liveGpsCoords)
        .then((coords) => {
          if (isCancelled || !coords) return;
          setDeliveryQueue((prev) => {
            let changed = false;
            const next = prev.map((item) => {
              if (item.id !== stop.id) return item;
              const realDistKm = calculateRoadDistanceKm(liveGpsCoords, coords);
              const realMinutes = Math.max(3, Math.round(realDistKm * 3.5));
              if (
                item.destCoords &&
                Math.abs(item.destCoords.lat - coords.lat) < 0.00001 &&
                Math.abs(item.destCoords.lng - coords.lng) < 0.00001 &&
                item.distanceKm === realDistKm
              ) {
                return item;
              }
              changed = true;
              return {
                ...item,
                destCoords: coords,
                distanceKm: realDistKm,
                estimatedMinutes: realMinutes
              };
            });
            return changed ? next : prev;
          });
          if (resetFittedStopKey) resetFittedStopKey();
        })
        .catch(() => {});
    });

    return () => {
      isCancelled = true;
    };
  }, [deliveryQueue, liveGpsCoords, resetFittedStopKey]);

  const handleSimulateNewOrder = useCallback(() => {
    const sampleRecipients = [
      {
        name: "Dewi Lestari",
        phone: "0812-2334-4556",
        address: "Jl. Brigjen Slamet Riyadi No. 182, Solo (Radius 1.8 km)",
        items: "1x Beras Pandan Wangi 5kg, 1x Telur Ayam Negeri 1kg",
        total: 95000,
        isCod: true
      },
      {
        name: "Eko Prasetyo",
        phone: "0813-9988-1122",
        address: "Perum Solo Baru Sektor 3 Blok D-5 (Radius 2.4 km)",
        items: "2x Minyak Goreng 2L, 3x Gula Pasir 1kg",
        total: 110000,
        isCod: false
      },
      {
        name: "Rina Kusuma",
        phone: "0812-8899-0011",
        address: "Jl. Kapten Mulyadi No. 56, Pasar Kliwon, Solo",
        items: "1x Dus Mie Goreng Spesial, 2x Kecap Manis 550ml",
        total: 135000,
        isCod: true
      }
    ];
    const picked = sampleRecipients[Math.floor(Math.random() * sampleRecipients.length)];
    const usedActiveNumbers = new Set(pendingStops.map((s) => s.stopNumber));
    let nextNum = 1;
    while (usedActiveNumbers.has(nextNum)) {
      nextNum++;
    }

    const newStop: DeliveryStop = {
      id: `STP-${Date.now().toString().slice(-4)}`,
      orderId: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      stopNumber: nextNum,
      customerName: picked.name,
      customerPhone: picked.phone,
      destAddress: picked.address,
      distanceKm: Number((1.2 + Math.random() * 2).toFixed(1)),
      estimatedMinutes: Math.round(5 + Math.random() * 8),
      itemsSummary: picked.items,
      totalAmount: picked.total,
      paymentMethod: picked.isCod ? "COD" : "QRIS",
      isCod: picked.isCod,
      codAmount: picked.isCod ? picked.total : 0,
      status: "ACTIVE",
      note: "Pesanan baru ditugaskan dari kasir toko"
    };

    setDeliveryQueue((prev) => [newStop, ...prev]);
    setSelectedStopId(null);
    if (resetFittedStopKey) resetFittedStopKey();
    setQueueTab("ACTIVE");
    setNotification(`🔔 Pesanan Baru Masuk! ${newStop.orderId} (${newStop.customerName})`);
    setTimeout(() => setNotification(null), 4500);
  }, [pendingStops.length, resetFittedStopKey]);

  const handleResetQueue = useCallback(() => {
    const storageKey = `sera_driver_queue_${driver.id || "me"}`;
    const settledKey = `sera_driver_settled_${driver.id || "me"}`;
    localStorage.removeItem(storageKey);
    localStorage.removeItem(settledKey);
    setDeliveryQueue(SAMPLE_DELIVERY_QUEUE);
    setSelectedStopId(null);
    if (resetFittedStopKey) resetFittedStopKey();
    setIsCodSettled(false);
    setNotification("Daftar antaran di-reset ke data simulasi awal (3 paket).");
    setTimeout(() => setNotification(null), 3000);
  }, [driver.id, resetFittedStopKey]);

  const handleContactStore = useCallback(() => {
    const storePhone = driver.linkedStorePhone || "08123456789";
    const cleanPhone = storePhone.replace(/^0/, "62").replace(/[^0-9]/g, "");
    const text = encodeURIComponent(
      `Halo Kasir / Admin ${driver.linkedStoreName || "Toko"}, saya ${driver.name} (Kurir Resmi Toko). Mohon koordinasi terkait orderan dan operasional antaran, terima kasih!`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, "_blank");
  }, [driver.linkedStorePhone, driver.linkedStoreName, driver.name]);

  const handleOpenWhatsApp = useCallback(
    (phone: string, customerName: string, stopNum: number) => {
      const cleanPhone = phone.replace(/^0/, "62").replace(/[^0-9]/g, "");
      const text = encodeURIComponent(
        `Halo Kak ${customerName}, saya kurir resmi dari ${driver.linkedStoreName || "Toko"}. Saya sedang mengantarkan pesanan Anda (Antaran #${stopNum}). Mohon konfirmasi bila sudah di tempat ya, terima kasih!`
      );
      window.open(`https://wa.me/${cleanPhone}?text=${text}`, "_blank");
    },
    [driver.linkedStoreName]
  );

  const executeCompleteStop = useCallback(async () => {
    if (!stopToComplete) return;
    const stop = stopToComplete;
    const timeStr = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

    setDeliveryQueue((prev) =>
      prev.map((s) => (s.id === stop.id ? { ...s, status: "COMPLETED" as const, completedAt: timeStr } : s))
    );

    if (stop.destCoords) {
      setLiveGpsCoords(stop.destCoords);
    }

    if (selectedStopId === stop.id) {
      setSelectedStopId(null);
    }
    if (resetFittedStopKey) resetFittedStopKey();

    try {
      await fetch(`${getApiBaseUrl()}/api/market/orders/${stop.orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "DELIVERED", orderStatus: "DELIVERED" })
      });
    } catch {}

    broadcastStopDeliveredLocally(stop.orderId);

    if (onUpdateDriver) {
      onUpdateDriver({
        totalTrips: (driver.totalTrips || 0) + 1,
        todayEarnings: (driver.todayEarnings || 0) + 12000
      });
    }

    setStopToComplete(null);
    setNotification(`Antaran #${stop.stopNumber} selesai`);
    setTimeout(() => setNotification(null), 2800);
  }, [stopToComplete, selectedStopId, resetFittedStopKey, onUpdateDriver, driver.totalTrips, driver.todayEarnings]);

  const handleSelectStopForMap = useCallback(
    (stop: DeliveryStop) => {
      setSelectedStopId(stop.id);
      const idx = sortedQueue.findIndex((s) => s.id === stop.id);
      const stopCoords = computeStopCoordinates(driverCoords, stop, idx >= 0 ? idx : 0);

      if (fitBoundsToRoute) {
        fitBoundsToRoute(stopCoords);
      }
      if (onSwitchToMap) {
        onSwitchToMap(stop);
      }
    },
    [sortedQueue, driverCoords, fitBoundsToRoute, onSwitchToMap]
  );

  return {
    deliveryQueue,
    setDeliveryQueue,
    selectedStopId,
    setSelectedStopId,
    stopToComplete,
    setStopToComplete,
    notification,
    setNotification,
    isCodSettled,
    setIsCodSettled,
    queueTab,
    setQueueTab,
    sortedQueue,
    activeStop,
    pendingStops,
    completedStops,
    totalCodCollected,
    handleSimulateNewOrder,
    handleResetQueue,
    handleContactStore,
    handleOpenWhatsApp,
    executeCompleteStop,
    handleSelectStopForMap
  };
}
