import { useState, useEffect, useCallback, useRef } from "react";
import type { ThemeType } from "../../theme";
import type { DriverProfile } from "./types";
import {
  buildDriverProfileFromServer,
  getDriverFleet,
  getVehicleBrandLabel,
  isLegacyDummyDriverProfile
} from "./types";
import { StoreCourierPairingGate } from "./StoreCourierPairingGate";
import { StoreDeliveryQueueView } from "./StoreDeliveryQueueView";
import { getApiBaseUrl } from "../../config/marketplaceConfig";
import { registerBackHandler, dispatchBackButton } from "../../utils/backButton";
import { DriverOfflineWarningToast } from "./components/DriverOfflineWarningToast";
import { DriverBottomNavBar } from "./components/DriverBottomNavBar";
import { DriverModalOverlay } from "./components/DriverModalOverlay";

export type { DriverProfile, ActiveRideOrder } from "./types";

export type DriverViewMode = "orders" | "map";

const ArrowLeftIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.3"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: "block" }}
  >
    <path d="m15 18-6-6 6-6" />
  </svg>
);

interface DriverPageProps {
  theme: ThemeType;
  onBack: () => void;
  isMobileView?: boolean;
  userEmail?: string | null;
}

export function DriverPage({ theme, onBack, isMobileView, userEmail }: DriverPageProps) {
  const [driver, setDriver] = useState<DriverProfile | null>(() => {
    const saved = localStorage.getItem("sera_driver_profile");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!isLegacyDummyDriverProfile(parsed)) {
          return parsed as DriverProfile;
        }
      } catch {}
      try {
        localStorage.removeItem("sera_driver_profile");
      } catch {}
    }
    return null;
  });

  const resolvedUserEmail = (
    userEmail ||
    (typeof window !== "undefined" ? localStorage.getItem("sera_user_email") : "") ||
    ""
  )
    .trim()
    .toLowerCase();
  const skipAutoRecoverRef = useRef(false);
  const [isRecovering, setIsRecovering] = useState<boolean>(() =>
    Boolean(!(driver && driver.isStoreCourier && driver.linkedStoreId) && resolvedUserEmail)
  );

  const [sessionNotice, setSessionNotice] = useState<string | null>(null);
  // Drivers always start OFFLINE when entering Mitra Driver until explicitly toggled Online
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<DriverViewMode>("orders");
  const [activeModal, setActiveModal] = useState<"settlement" | "profile" | null>(null);

  // Deep-link notification listener to switch to orders queue view and dismiss any modals
  useEffect(() => {
    const handleSetTab = () => {
      setCurrentView("orders");
      setActiveModal(null);
    };
    window.addEventListener("sera:driver-set-tab", handleSetTab);
    return () => window.removeEventListener("sera:driver-set-tab", handleSetTab);
  }, []);

  // Sequential Native Back Button Navigation for Courier/Driver Page
  useEffect(() => {
    const unregs: (() => void)[] = [];

    if (activeModal) {
      unregs.push(
        registerBackHandler("driver_modal", 70, () => {
          setActiveModal(null);
          return true;
        })
      );
    }

    if (currentView === "map") {
      unregs.push(
        registerBackHandler("driver_map_tab", 30, () => {
          setCurrentView("orders");
          return true;
        })
      );
    }

    return () => {
      unregs.forEach((u) => u());
    };
  }, [activeModal, currentView]);

  const handleDriverBack = () => {
    if (dispatchBackButton()) return;
    if (activeModal) {
      setActiveModal(null);
      return;
    }
    if (currentView === "map") {
      setCurrentView("orders");
      return;
    }
    if (onBack) {
      onBack();
    }
  };

  const [pendingStopsCount, setPendingStopsCount] = useState<number>(() => {
    try {
      const storageKey = `sera_driver_queue_${driver?.id || "me"}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((s: any) => s.status !== "COMPLETED").length;
        }
      }
    } catch {}
    return 0;
  });
  const [offlineWarningNotice, setOfflineWarningNotice] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (driver && !isLegacyDummyDriverProfile(driver)) {
        localStorage.setItem("sera_driver_profile", JSON.stringify({ ...driver, isOnline }));
      } else {
        localStorage.removeItem("sera_driver_profile");
      }
    } catch {}
  }, [driver, isOnline]);

  const unpairDriver = useCallback((reason: string | null = null, targetDriverId?: string) => {
    const storageKey = `sera_driver_queue_${targetDriverId || "me"}`;
    const settledKey = `sera_driver_settled_${targetDriverId || "me"}`;
    try {
      localStorage.removeItem(storageKey);
      localStorage.removeItem(settledKey);
      localStorage.removeItem("sera_driver_profile");
    } catch {}
    setActiveModal(null);
    setSessionNotice(reason);
    setDriver(null);
  }, []);

  // Synchronize courier online/offline status with store
  useEffect(() => {
    if (driver?.linkedStoreId && driver?.id) {
      const courierStatus = isOnline ? "ONLINE" : "OFFLINE";
      fetch(`${getApiBaseUrl()}/api/market/stores/${driver.linkedStoreId}/courier/${driver.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: courierStatus })
      }).catch(() => {});

      window.dispatchEvent(
        new CustomEvent("sera:courier-status-changed", {
          detail: { courierId: driver.id, status: courierStatus }
        })
      );

      try {
        const rawStore = localStorage.getItem("sera_merchant_store");
        if (rawStore) {
          const st = JSON.parse(rawStore);
          if (st && st.id === driver.linkedStoreId && st.linkedCouriers && Array.isArray(st.linkedCouriers)) {
            const updatedCouriers = st.linkedCouriers.map((c: any) =>
              c.id === driver.id ? { ...c, status: courierStatus } : c
            );
            localStorage.setItem("sera_merchant_store", JSON.stringify({ ...st, linkedCouriers: updatedCouriers }));
          }
        }
      } catch {}
    }
  }, [driver?.linkedStoreId, driver?.id, isOnline]);

  // Synchronize store-assigned courier & store metadata with backend; auto-unpair on reset/remove/takeover
  useEffect(() => {
    if (!driver?.isStoreCourier || !driver?.linkedStoreId || !driver?.id) return;

    let isMounted = true;
    const activeDriverId = driver.id;
    const activeStoreId = driver.linkedStoreId;
    const activeSession = driver.activeSessionId;

    const mapVerifyErrorToNotice = (reasonCode?: string): string => {
      switch (reasonCode) {
        case "STORE_NOT_FOUND":
          return "Toko tidak ditemukan di server. Silakan masukkan kode aktivasi kurir baru.";
        case "REMOVED":
          return "Akses kurir Anda telah dikeluarkan oleh pihak toko.";
        case "RESET":
          return "Aktivasi kurir telah di-reset oleh toko. Silakan aktifkan ulang dengan PIN dan kode Anda.";
        case "SESSION_TAKEN_OVER":
          return "Akun kurir ini sedang diaktifkan di perangkat lain. Sesi di perangkat ini ditutup otomatis.";
        default:
          return "Sesi kurir Anda tidak valid. Silakan aktivasi ulang.";
      }
    };

    const checkStoreLink = async () => {
      try {
        const res = await fetch(`${getApiBaseUrl()}/api/market/stores/courier/session/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            storeId: activeStoreId,
            courierId: activeDriverId,
            sessionId: activeSession,
            userEmail: resolvedUserEmail || undefined
          })
        });
        if (!isMounted || !res.ok) return;
        const json = await res.json();
        if (!json.success || !json.data || !isMounted) return;

        if (json.data.valid === false) {
          if (json.data.reasonCode !== "STORE_NOT_FOUND") {
            unpairDriver(mapVerifyErrorToNotice(json.data.reasonCode), activeDriverId);
          }
          return;
        }

        const currentCourier = json.data.courier;
        const serverStore = json.data.store;
        if (!currentCourier) return;

        const nextVehicleType = getDriverFleet(currentCourier);
        const nextVehicleBrand = getVehicleBrandLabel(nextVehicleType);

        setDriver((prev) => {
          if (!prev) return null;
          const nextProfile: DriverProfile = {
            ...prev,
            name: currentCourier.name || prev.name,
            phone: currentCourier.phone ?? prev.phone,
            plateNumber: currentCourier.plateNumber || prev.plateNumber || "-",
            vehicleType: nextVehicleType,
            serviceType: nextVehicleType,
            vehicleBrand: nextVehicleBrand,
            linkedStoreCode: "",
            linkedStoreName: serverStore?.name || prev.linkedStoreName,
            linkedStoreAddress: serverStore?.address ?? prev.linkedStoreAddress,
            linkedStorePhone: serverStore?.whatsapp ?? prev.linkedStorePhone,
            city: serverStore?.city ?? prev.city
          };

          const hasChanged =
            nextProfile.name !== prev.name ||
            nextProfile.phone !== prev.phone ||
            nextProfile.plateNumber !== prev.plateNumber ||
            nextProfile.vehicleType !== prev.vehicleType ||
            nextProfile.linkedStoreCode !== prev.linkedStoreCode ||
            nextProfile.linkedStoreName !== prev.linkedStoreName ||
            nextProfile.linkedStoreAddress !== prev.linkedStoreAddress ||
            nextProfile.linkedStorePhone !== prev.linkedStorePhone ||
            nextProfile.city !== prev.city;

          return hasChanged ? nextProfile : prev;
        });
      } catch {}
    };

    void checkStoreLink();

    const handleLocalUnlink = (e: any) => {
      const unlinkedCourierId = e?.detail?.courierId;
      if (unlinkedCourierId && unlinkedCourierId !== activeDriverId) {
        return;
      }
      unpairDriver("Akses kurir Anda telah dikeluarkan oleh pihak toko.", activeDriverId);
    };
    window.addEventListener("sera:courier-unlinked", handleLocalUnlink);
    window.addEventListener("focus", checkStoreLink);

    const interval = setInterval(checkStoreLink, 10000);
    return () => {
      isMounted = false;
      window.removeEventListener("sera:courier-unlinked", handleLocalUnlink);
      window.removeEventListener("focus", checkStoreLink);
      clearInterval(interval);
    };
  }, [
    driver?.isStoreCourier,
    driver?.linkedStoreId,
    driver?.id,
    driver?.activeSessionId,
    resolvedUserEmail,
    unpairDriver
  ]);

  const handleToggleOnline = async () => {
    if (isOnline && pendingStopsCount > 0) {
      setOfflineWarningNotice(
        `Masih ada ${pendingStopsCount} pesanan yang sedang diantar. Selesaikan semua antaran terlebih dahulu.`
      );
      setTimeout(() => setOfflineWarningNotice(null), 4500);
      return;
    }

    const nextOnline = !isOnline;
    setIsOnline(nextOnline);

    if (driver?.linkedStoreId && driver?.id) {
      try {
        await fetch(`${getApiBaseUrl()}/api/market/stores/${driver.linkedStoreId}/courier/${driver.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: nextOnline ? "ONLINE" : "OFFLINE" })
        });
        window.dispatchEvent(
          new CustomEvent("sera:courier-status-changed", {
            detail: { courierId: driver.id, status: nextOnline ? "ONLINE" : "OFFLINE" }
          })
        );
      } catch (err) {
        console.warn("Could not sync courier online status to store:", err);
      }
    }
  };

  const handleUpdateDriver = (updated: Partial<DriverProfile>) => {
    setDriver((prev) => {
      if (!prev) return null;
      const merged: DriverProfile = {
        ...prev,
        ...updated,
        isStoreCourier: updated.isStoreCourier !== undefined ? updated.isStoreCourier : prev.isStoreCourier,
        linkedStoreId: updated.linkedStoreId !== undefined ? updated.linkedStoreId : prev.linkedStoreId,
        linkedStoreName: updated.linkedStoreName !== undefined ? updated.linkedStoreName : prev.linkedStoreName,
        linkedStoreCode: updated.linkedStoreCode !== undefined ? updated.linkedStoreCode : prev.linkedStoreCode
      };
      try {
        localStorage.setItem("sera_driver_profile", JSON.stringify({ ...merged, isOnline }));
      } catch {}
      return merged;
    });
  };

  // Auto-sync store name if merchant edited store name in local store
  useEffect(() => {
    try {
      const rawStore = localStorage.getItem("sera_merchant_store");
      if (rawStore && driver?.linkedStoreId) {
        const ms = JSON.parse(rawStore);
        if (ms && ms.name && ms.id === driver.linkedStoreId && ms.name !== driver.linkedStoreName) {
          setDriver((prev) =>
            prev
              ? {
                  ...prev,
                  linkedStoreName: ms.name,
                  linkedStoreAddress: ms.address || prev.linkedStoreAddress,
                  linkedStorePhone: ms.whatsapp || prev.linkedStorePhone
                }
              : null
          );
        }
      }
    } catch {}
  }, [driver?.linkedStoreId, driver?.linkedStoreName]);

  const handleUnlinkStore = () => {
    if (!driver) return;
    const storeName = driver.linkedStoreName || "toko ini";
    const confirmUnlink = window.confirm(
      `Apakah Anda yakin ingin keluar dari kemitraan toko "${storeName}"? Setelah keluar, Anda dapat memasukkan kode aktivasi kurir baru.`
    );
    if (!confirmUnlink) return;

    skipAutoRecoverRef.current = true;
    if (driver.linkedStoreId && driver.id) {
      fetch(`${getApiBaseUrl()}/api/market/stores/courier/session/disconnect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify({
          storeId: driver.linkedStoreId,
          courierId: driver.id
        })
      }).catch(() => {});
    }

    unpairDriver(null, driver.id);
  };

  const isLinkedToStore = Boolean(driver && driver.isStoreCourier && driver.linkedStoreId);

  useEffect(() => {
    if (isLinkedToStore || !resolvedUserEmail || skipAutoRecoverRef.current) {
      setIsRecovering(false);
      return;
    }

    let cancelled = false;
    setIsRecovering(true);

    fetch(
      `${getApiBaseUrl()}/api/market/stores/courier/session/recover?email=${encodeURIComponent(resolvedUserEmail)}`
    )
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (cancelled) return;
        const recovered = json?.data;
        if (json?.success && recovered?.store && recovered?.courier) {
          setSessionNotice(null);
          const nextProfile = buildDriverProfileFromServer(
            recovered.store,
            recovered.courier,
            recovered.sessionId
          );
          setIsOnline(false);
          setDriver(nextProfile);
          try {
            localStorage.setItem("sera_driver_profile", JSON.stringify(nextProfile));
          } catch {}
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) {
          setIsRecovering(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isLinkedToStore, resolvedUserEmail]);

  if (!isLinkedToStore || !driver) {
    if (isRecovering) {
      return (
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: theme.bg,
            color: theme.inkSoft,
            fontSize: 13
          }}
        >
          Memulihkan sesi kurir...
        </div>
      );
    }
    return (
      <StoreCourierPairingGate
        theme={theme}
        onBack={handleDriverBack}
        userEmail={userEmail}
        isMobileView={isMobileView}
        notice={sessionNotice}
        onPairSuccess={({ store: pairedStore, courier: pairedCourier, sessionId }) => {
          skipAutoRecoverRef.current = false;
          setSessionNotice(null);
          const nextProfile = buildDriverProfileFromServer(pairedStore, pairedCourier, sessionId);
          setIsOnline(false);
          setDriver(nextProfile);
          try {
            localStorage.setItem("sera_driver_profile", JSON.stringify(nextProfile));
          } catch {}
        }}
      />
    );
  }

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        background: theme.bg,
        position: "relative",
        minWidth: 0,
        minHeight: 0
      }}
    >
      {/* 1. TOP HEADER */}
      <div
        style={{
          background: theme.surface,
          borderBottom: `1px solid ${theme.border}`,
          position: "sticky",
          top: 0,
          zIndex: 40,
          display: "flex",
          flexDirection: "column"
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            height: 52,
            padding: isMobileView ? "0 12px" : "0 16px",
            boxSizing: "border-box"
          }}
        >
          {/* Back Button & Title */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, flex: 1 }}>
            <button
              type="button"
              onClick={handleDriverBack}
              title="Kembali ke Dashboard Utama"
              aria-label="Kembali"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: "transparent",
                border: "none",
                color: theme.ink,
                cursor: "pointer",
                flexShrink: 0,
                transition: "background 0.15s ease"
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = theme.surface2;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
            >
              <ArrowLeftIcon size={21} />
            </button>

            <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
              <div
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 800,
                  fontSize: isMobileView ? "0.95rem" : "1.02rem",
                  color: theme.ink,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  lineHeight: 1.2
                }}
              >
                {driver.linkedStoreName ? driver.linkedStoreName : driver?.name || "Mitra Kurir"}
              </div>
              <div
                style={{
                  fontSize: "0.72rem",
                  color: theme.inkSoft,
                  fontWeight: 500,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  lineHeight: 1.1,
                  marginTop: 1
                }}
              >
                {driver.linkedStoreName ? "Mitra Kurir Toko" : driver?.phone ? `Kurir • ${driver.phone}` : "Kurir SERA"}
              </div>
            </div>
          </div>

          {/* Status Online/Offline Toggle Pill */}
          <button
            type="button"
            onClick={handleToggleOnline}
            title={isOnline ? "Status: Online (Klik untuk istirahat)" : "Status: Offline (Klik untuk online)"}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 10px",
              borderRadius: 20,
              background: theme.surface2,
              color: isOnline ? theme.ink : theme.inkSoft,
              border: `1px solid ${theme.border}`,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              flexShrink: 0,
              transition: "all 0.15s ease"
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = theme.inkSoft;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = theme.border;
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: isOnline ? theme.status || "#10B981" : theme.inkFaint,
                transition: "background 0.15s ease"
              }}
            />
            <span
              style={{
                color: isOnline ? theme.ink : theme.inkSoft,
                fontWeight: isOnline ? 700 : 500
              }}
            >
              {isOnline ? "Online" : "Offline"}
            </span>
          </button>
        </div>
      </div>

      {/* 2. VIEW CONTENT */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          position: "relative",
          overflow: "hidden"
        }}
      >
        <StoreDeliveryQueueView
          theme={theme}
          driver={driver}
          isOnline={isOnline}
          onToggleOnline={handleToggleOnline}
          onPendingCountChange={setPendingStopsCount}
          isMobileView={isMobileView}
          activeTab={currentView === "map" ? "map" : "orders"}
          onSwitchToMap={() => setCurrentView("map")}
          onSwitchToList={() => setCurrentView("orders")}
          onOpenSettlement={() => setActiveModal("settlement")}
          onOpenProfile={() => setActiveModal("profile")}
          onUpdateDriver={handleUpdateDriver}
          onUnlinkStore={handleUnlinkStore}
        />
      </div>

      {/* Floating Toast Warning when trying to go Offline while holding stops */}
      <DriverOfflineWarningToast
        message={offlineWarningNotice}
        isMobileView={isMobileView}
        onDismiss={() => setOfflineWarningNotice(null)}
      />

      {/* 3. BOTTOM NAVIGATION BAR */}
      <DriverBottomNavBar
        theme={theme}
        isMobileView={isMobileView}
        currentView={currentView}
        onChangeView={setCurrentView}
      />

      {/* 4. IN-APP MODAL: SETTLEMENT OR COURIER PROFILE */}
      <DriverModalOverlay
        activeModal={activeModal}
        onClose={() => setActiveModal(null)}
        theme={theme}
        driver={driver}
        isMobileView={isMobileView}
        onUpdateDriver={handleUpdateDriver}
        onUnlinkStore={handleUnlinkStore}
      />
    </div>
  );
}
