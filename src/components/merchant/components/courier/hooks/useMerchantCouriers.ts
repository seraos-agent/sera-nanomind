import { useState, useEffect, useCallback } from "react";
import type { MerchantStore, StoreCourierConfig, StoreLinkedCourier } from "../../../types";
import { getApiBaseUrl } from "../../../../../config/marketplaceConfig";

interface UseMerchantCouriersOptions {
  store: MerchantStore | null;
  onRefreshStore?: () => Promise<void>;
}

export function useMerchantCouriers({ store, onRefreshStore }: UseMerchantCouriersOptions) {
  const [config, setConfig] = useState<StoreCourierConfig>({
    enabled: true,
    pairingCode: "",
    pricingType: "FLAT",
    flatRate: 5000,
    perKmRate: 2000,
    freeDeliveryThreshold: 50000,
    maxDistanceKm: 5,
    estimatedMinutes: "30-45 Menit",
    notes: "Pengantaran langsung oleh armada resmi toko untuk area sekitar."
  });

  const [linkedCouriers, setLinkedCouriers] = useState<StoreLinkedCourier[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Add Courier Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCourierName, setNewCourierName] = useState("");
  const [newCourierPhone, setNewCourierPhone] = useState("");
  const [newCourierVehicle, setNewCourierVehicle] = useState<"MOTOR" | "MOBIL" | "PICKUP">("MOTOR");
  const [newCourierPlate, setNewCourierPlate] = useState("");
  const [newCourierPin, setNewCourierPin] = useState("");
  const [isAddingCourier, setIsAddingCourier] = useState(false);
  const [copiedCourierCode, setCopiedCourierCode] = useState<string | null>(null);

  // In-app Delete, Set PIN & Reset Confirmation Modals and Toast
  const [courierToDelete, setCourierToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeletingCourier, setIsDeletingCourier] = useState(false);
  const [courierToReset, setCourierToReset] = useState<{ id: string; name: string } | null>(null);
  const [isResettingCode, setIsResettingCode] = useState(false);
  const [courierToSetPin, setCourierToSetPin] = useState<{ id: string; name: string; hasPin?: boolean } | null>(null);
  const [isUpdatingPin, setIsUpdatingPin] = useState(false);
  const [actionToast, setActionToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    setActionToast({ message, type });
    setTimeout(() => setActionToast(null), 3500);
  }, []);

  // Load latest config from store or backend
  useEffect(() => {
    if (!store?.id) return;

    if (store.courierConfig) {
      setConfig({
        ...store.courierConfig,
        flatRate: store.courierConfig.flatRate || 5000,
        perKmRate: store.courierConfig.perKmRate || 2000,
        maxDistanceKm: store.courierConfig.maxDistanceKm || 5,
        estimatedMinutes: store.courierConfig.estimatedMinutes || "30-45 Menit"
      });
    }

    if (Array.isArray(store.linkedCouriers)) {
      setLinkedCouriers(store.linkedCouriers);
    }

    // Also fetch fresh from API (send x-owner-email so store owner sees activation codes)
    fetch(`${getApiBaseUrl()}/api/market/stores/${store.id}/courier-config`, {
      headers: store.ownerId ? { "x-owner-email": store.ownerId } : undefined
    })
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data) {
          if (json.data.courierConfig) {
            setConfig(json.data.courierConfig);
          }
          if (Array.isArray(json.data.linkedCouriers)) {
            setLinkedCouriers(json.data.linkedCouriers);
          }
        }
      })
      .catch(() => {});

    // Listen for live status change from driver app
    const handleStatusChanged = (e: any) => {
      const { courierId, status } = e.detail || {};
      if (!courierId) return;
      setLinkedCouriers(prev =>
        prev.map(c => (c.id === courierId ? { ...c, status } : c))
      );
    };
    window.addEventListener("sera:courier-status-changed", handleStatusChanged);
    return () => {
      window.removeEventListener("sera:courier-status-changed", handleStatusChanged);
    };
  }, [store?.id, store?.ownerId]);

  const handleSaveConfig = useCallback(async () => {
    if (!store?.id) return;
    setIsSaving(true);
    setSaveSuccess(false);
    setErrorMessage("");

    try {
      const res = await fetch(`${getApiBaseUrl()}/api/market/stores/${store.id}/courier-config`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config)
      });
      const json = await res.json();
      if (json.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        if (onRefreshStore) await onRefreshStore();
      } else {
        setErrorMessage(json.error || "Gagal menyimpan pengaturan.");
      }
    } catch {
      setErrorMessage("Koneksi terganggu. Silakan periksa jaringan.");
    } finally {
      setIsSaving(false);
    }
  }, [store?.id, config, onRefreshStore]);

  const executeUnlinkCourier = useCallback(async () => {
    if (!store?.id || !courierToDelete) return;
    const { id: courierId, name: courierName } = courierToDelete;
    setIsDeletingCourier(true);

    try {
      const res = await fetch(`${getApiBaseUrl()}/api/market/stores/${store.id}/courier/unlink`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courierId })
      });
      const json = await res.json();
      if (json.success) {
        setLinkedCouriers(prev => prev.filter(c => c.id !== courierId));

        // Immediately reset local driver profile if it's the unlinked courier in the same browser
        try {
          const rawDriver = localStorage.getItem("sera_driver_profile");
          if (rawDriver) {
            const parsed = JSON.parse(rawDriver);
            if (parsed.id === courierId || (parsed.linkedStoreId === store.id && (!courierId || parsed.name === courierName))) {
              localStorage.removeItem("sera_driver_profile");
              window.dispatchEvent(new CustomEvent("sera:courier-unlinked", { detail: { courierId } }));
            }
          }
        } catch {}

        if (onRefreshStore) await onRefreshStore();
        setCourierToDelete(null);
        showToast(`Kurir "${courierName}" berhasil dikeluarkan dari toko.`);
      } else {
        showToast(json.error || "Gagal mengeluarkan kurir.", "error");
      }
    } catch {
      showToast("Koneksi terganggu saat mengeluarkan kurir.", "error");
    } finally {
      setIsDeletingCourier(false);
    }
  }, [store?.id, courierToDelete, onRefreshStore, showToast]);

  const handleAddCourier = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store?.id) return;
    if (!newCourierName.trim()) {
      showToast("Silakan masukkan nama kurir.", "error");
      return;
    }
    const cleanPin = newCourierPin.trim();
    if (!/^\d{4,6}$/.test(cleanPin)) {
      showToast("PIN Kurir wajib diisi (4–6 digit angka).", "error");
      return;
    }

    setIsAddingCourier(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/market/stores/${store.id}/courier/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCourierName.trim(),
          phone: newCourierPhone.trim(),
          vehicleType: newCourierVehicle,
          plateNumber: newCourierPlate.trim(),
          pinCode: cleanPin
        })
      });

      const json = await res.json();
      if (json.success && json.data) {
        setLinkedCouriers(prev => [json.data, ...prev]);
        setShowAddModal(false);
        setNewCourierName("");
        setNewCourierPhone("");
        setNewCourierPlate("");
        setNewCourierVehicle("MOTOR");
        setNewCourierPin("");
        if (onRefreshStore) await onRefreshStore();
        showToast(`Kurir "${json.data.name}" berhasil didaftarkan.`);
      } else {
        showToast(json.error || "Gagal mendaftarkan kurir.", "error");
      }
    } catch {
      showToast("Koneksi bermasalah saat mendaftarkan kurir.", "error");
    } finally {
      setIsAddingCourier(false);
    }
  }, [store?.id, newCourierName, newCourierPhone, newCourierVehicle, newCourierPlate, newCourierPin, onRefreshStore, showToast]);

  const executeResetCourierCode = useCallback(async () => {
    if (!store?.id || !courierToReset) return;
    const { id: courierId, name: courierName } = courierToReset;
    setIsResettingCode(true);

    try {
      const res = await fetch(`${getApiBaseUrl()}/api/market/stores/${store.id}/courier/${courierId}/reset-code`, {
        method: "POST"
      });
      const json = await res.json();
      if (json.success && json.data?.activationCode) {
        setLinkedCouriers(prev =>
          prev.map(c => (c.id === courierId ? { ...c, activationCode: json.data.activationCode, isActivated: false } : c))
        );
        if (onRefreshStore) await onRefreshStore();
        setCourierToReset(null);
        showToast(`Kode baru untuk "${courierName}" berhasil dibuat.`);
      } else {
        showToast(json.error || "Gagal mereset kode aktivasi.", "error");
      }
    } catch {
      showToast("Koneksi bermasalah saat mereset kode kurir.", "error");
    } finally {
      setIsResettingCode(false);
    }
  }, [store?.id, courierToReset, onRefreshStore, showToast]);

  const executeUpdateCourierPin = useCallback(async (pin: string) => {
    if (!store?.id || !courierToSetPin) return;
    const cleanPin = pin.trim();
    if (!/^\d{4,6}$/.test(cleanPin)) {
      showToast("PIN wajib 4–6 digit angka.", "error");
      return;
    }

    const { id: courierId, name: courierName } = courierToSetPin;
    setIsUpdatingPin(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/market/stores/${store.id}/courier/${courierId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pinCode: cleanPin })
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setLinkedCouriers(prev =>
          prev.map(c => (c.id === courierId ? { ...c, hasPin: true } : c))
        );
        if (onRefreshStore) await onRefreshStore();
        setCourierToSetPin(null);
        showToast(`PIN untuk kurir "${courierName}" berhasil disimpan.`);
      } else {
        showToast(json.error || "Gagal menyimpan PIN kurir.", "error");
      }
    } catch {
      showToast("Koneksi bermasalah saat menyimpan PIN kurir.", "error");
    } finally {
      setIsUpdatingPin(false);
    }
  }, [store?.id, courierToSetPin, onRefreshStore, showToast]);

  const handleShareCourierWhatsApp = useCallback((courier: StoreLinkedCourier) => {
    const code = courier.activationCode || config.pairingCode;
    const msg = `Halo ${courier.name}! Ini Kode Aktivasi Mitra Driver untuk *${store?.name || "Toko"}*:

👉 *Kode Aktivasi: ${code}*
🛵 *Armada Ditugaskan:* ${courier.vehicleType === "PICKUP" ? "Pickup" : courier.vehicleType === "MOBIL" ? "Mobil" : "Motor"}

Silakan buka aplikasi SERA -> Mitra Driver, masukkan Kode Aktivasi di atas dan *PIN pribadi (4–6 digit)* yang diberikan pemilik toko secara terpisah. Terima kasih!`;

    let cleanPhone = courier.phone ? courier.phone.replace(/[^0-9]/g, "") : "";
    if (cleanPhone.startsWith("0")) {
      cleanPhone = "62" + cleanPhone.slice(1);
    } else if (cleanPhone && !cleanPhone.startsWith("62")) {
      cleanPhone = "62" + cleanPhone;
    }

    const url = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  }, [config.pairingCode, store?.name]);

  const handleCopyCourierCode = useCallback((code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCourierCode(code);
    setTimeout(() => setCopiedCourierCode(null), 2500);
  }, []);

  return {
    config,
    setConfig,
    linkedCouriers,
    isSaving,
    saveSuccess,
    errorMessage,
    showAddModal,
    setShowAddModal,
    newCourierName,
    setNewCourierName,
    newCourierPhone,
    setNewCourierPhone,
    newCourierVehicle,
    setNewCourierVehicle,
    newCourierPlate,
    setNewCourierPlate,
    newCourierPin,
    setNewCourierPin,
    isAddingCourier,
    copiedCourierCode,
    courierToDelete,
    setCourierToDelete,
    isDeletingCourier,
    courierToReset,
    setCourierToReset,
    isResettingCode,
    courierToSetPin,
    setCourierToSetPin,
    isUpdatingPin,
    actionToast,
    showToast,
    handleSaveConfig,
    handleAddCourier,
    executeUnlinkCourier,
    executeResetCourierCode,
    executeUpdateCourierPin,
    handleShareCourierWhatsApp,
    handleCopyCourierCode
  };
}
