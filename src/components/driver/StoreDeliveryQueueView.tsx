import { useEffect, useRef, useCallback } from "react";
import { CheckCircle2 } from "lucide-react";
import type { DeliveryStop, StoreDeliveryQueueViewProps } from "./queue/types";
import { WhatsAppIcon, SolidMapPinIcon } from "./queue/utils/deliveryIcons";
import { computeStopCoordinates } from "./queue/utils/deliveryMapUtils";
import { DeliveryOrderItemsList } from "./queue/components/DeliveryOrderItemsList";
import { DeliveryOfflineState } from "./queue/components/DeliveryOfflineState";
import { DeliveryCompleteModal } from "./queue/components/DeliveryCompleteModal";
import { DeliveryProfileTab } from "./queue/components/DeliveryProfileTab";
import { DeliveryFloatingMapCard } from "./queue/components/DeliveryFloatingMapCard";
import { DeliveryPendingCard } from "./queue/components/DeliveryPendingCard";
import { DeliveryCompletedTab } from "./queue/components/DeliveryCompletedTab";
import { DeliveryMapOverlays } from "./queue/components/DeliveryMapOverlays";
import { DeliveryQueueTabBar } from "./queue/components/DeliveryQueueTabBar";
import { useDeliveryMap } from "./queue/hooks/useDeliveryMap";
import { useDeliveryQueueState } from "./queue/hooks/useDeliveryQueueState";
import { registerBackHandler } from "../../utils/backButton";

const QUEUE_TABS: Array<"ACTIVE" | "COMPLETED" | "PROFILE"> = ["ACTIVE", "COMPLETED", "PROFILE"];

export { WhatsAppIcon, SolidMapPinIcon, DeliveryOrderItemsList };
export type { StoreDeliveryQueueViewProps };

export function StoreDeliveryQueueView({
  theme,
  driver,
  isOnline = true,
  onToggleOnline,
  onPendingCountChange,
  isMobileView,
  activeTab = "orders",
  onSwitchToMap,
  onSwitchToList,
  onOpenSettlement,
  onOpenProfile,
  onUpdateDriver,
  onUnlinkStore
}: StoreDeliveryQueueViewProps) {
  // 1. Delivery State Management Hook
  const queue = useDeliveryQueueState({
    driver,
    isOnline,
    onPendingCountChange,
    onUpdateDriver,
    onSwitchToMap
  });

  // 2. Google Maps Canvas & Real-time Routing Hook
  const map = useDeliveryMap({
    driver,
    sortedQueue: queue.sortedQueue,
    activeStop: queue.activeStop,
    setSelectedStopId: queue.setSelectedStopId,
    isMobileView,
    activeTab,
    theme
  });

  // Handle back button for DeliveryCompleteModal
  useEffect(() => {
    if (queue.stopToComplete) {
      return registerBackHandler("driver_stop_complete_modal", 85, () => {
        queue.setStopToComplete(null);
        return true;
      });
    }
  }, [queue.stopToComplete]);

  // Handle focus on specific stop & route framing
  const handleSelectStopForMap = (stop: DeliveryStop) => {
    queue.setSelectedStopId(stop.id);
    const idx = queue.sortedQueue.findIndex((s) => s.id === stop.id);
    const stopCoords = computeStopCoordinates(map.driverCoords, stop, idx >= 0 ? idx : 0);
    const driverKey = `${map.driverCoords.lat.toFixed(4)},${map.driverCoords.lng.toFixed(4)}`;
    map.lastFittedStopKeyRef.current = `${driverKey}|${stop.id}:${stopCoords.lat.toFixed(4)},${stopCoords.lng.toFixed(4)}`;
    map.fitBoundsToRoute(stopCoords);
    if (onSwitchToMap) {
      onSwitchToMap(stop);
    }
  };

  // Native CSS Scroll-Snap ViewPager Controller
  const pagerRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScrollRef = useRef(false);
  const scrollTimeoutRef = useRef<any>(null);
  const prevActiveTabRef = useRef<string>(activeTab);

  const handlePagerScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      if (isProgrammaticScrollRef.current) return;
      const container = e.currentTarget;
      const width = container.clientWidth;
      if (!width) return;
      const pageIndex = Math.round(container.scrollLeft / width);
      const newTab = QUEUE_TABS[pageIndex];
      if (newTab && newTab !== queue.queueTab) {
        queue.setQueueTab(newTab);
      }
    },
    [queue.queueTab, queue.setQueueTab]
  );

  const handleTabChange = useCallback(
    (t: "ACTIVE" | "COMPLETED" | "PROFILE") => {
      queue.setQueueTab(t);
      const targetIdx = QUEUE_TABS.indexOf(t);
      if (targetIdx !== -1 && pagerRef.current) {
        isProgrammaticScrollRef.current = true;
        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
        pagerRef.current.scrollTo({
          left: targetIdx * pagerRef.current.clientWidth,
          behavior: "smooth"
        });
        scrollTimeoutRef.current = setTimeout(() => {
          isProgrammaticScrollRef.current = false;
        }, 400);
      }
    },
    [queue.setQueueTab]
  );

  useEffect(() => {
    const handleSetTab = (e: Event) => {
      const customEvent = e as CustomEvent<{ tab: "ACTIVE" | "COMPLETED" | "PROFILE"; stopId?: string }>;
      const target = customEvent.detail?.tab;
      if (target && QUEUE_TABS.includes(target)) {
        handleTabChange(target);
      }
      if (customEvent.detail?.stopId) {
        queue.setSelectedStopId(customEvent.detail.stopId);
      }
    };
    window.addEventListener("sera:driver-set-tab", handleSetTab);
    return () => window.removeEventListener("sera:driver-set-tab", handleSetTab);
  }, [handleTabChange, queue.setSelectedStopId]);

  useEffect(() => {
    const targetIdx = QUEUE_TABS.indexOf(queue.queueTab);
    if (targetIdx > 0 && pagerRef.current) {
      pagerRef.current.scrollLeft = targetIdx * pagerRef.current.clientWidth;
    }
  }, []);

  useEffect(() => {
    if (activeTab === "orders" && prevActiveTabRef.current !== "orders" && pagerRef.current) {
      const targetIdx = QUEUE_TABS.indexOf(queue.queueTab);
      if (targetIdx !== -1) {
        pagerRef.current.scrollLeft = targetIdx * pagerRef.current.clientWidth;
      }
    }
    prevActiveTabRef.current = activeTab;
  }, [activeTab, queue.queueTab]);

  useEffect(() => {
    if (activeTab !== "orders") return;
    const handleResize = () => {
      const targetIdx = QUEUE_TABS.indexOf(queue.queueTab);
      if (targetIdx !== -1 && pagerRef.current) {
        pagerRef.current.scrollLeft = targetIdx * pagerRef.current.clientWidth;
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [activeTab, queue.queueTab]);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        background: theme.bg
      }}
    >
      {/* 1. GOOGLE MAPS CANVAS */}
      <div
        ref={map.mapContainerRef}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          background: theme.surface2,
          display: activeTab === "map" ? "block" : "none",
          pointerEvents: activeTab === "map" ? "auto" : "none"
        }}
      />

      {activeTab === "map" && (
        <DeliveryMapOverlays
          theme={theme}
          isMobileView={isMobileView}
          isMapLoaded={map.isMapLoaded}
          gpsError={map.gpsError}
          mapError={map.mapError}
          driverCoords={map.driverCoords}
          isLocatingGps={map.isLocatingGps}
          activeStop={queue.activeStop}
          hasAnyStops={queue.sortedQueue.length > 0}
          onRetryGps={map.retryGps}
          onRecenterDriver={map.handleRecenterDriver}
        />
      )}

      {/* Floating Notification Toast */}
      {queue.notification && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 100,
            background: theme.isDark ? "#334155" : "#E2E8F0",
            color: theme.isDark ? "#F8FAFC" : "#1E293B",
            border: `1px solid ${theme.isDark ? "#475569" : "#CBD5E1"}`,
            padding: "10px 16px",
            borderRadius: 12,
            fontSize: 12.5,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
            boxShadow: "0 8px 24px rgba(15, 23, 42, 0.14)",
            maxWidth: "calc(100% - 36px)",
            textAlign: "center",
            lineHeight: 1.35,
            pointerEvents: "none"
          }}
        >
          <CheckCircle2 size={15} color={theme.isDark ? "#F8FAFC" : "#334155"} style={{ flexShrink: 0 }} />
          <span>{queue.notification}</span>
        </div>
      )}

      {/* 2. DEDICATED DAFTAR PAKET VIEW */}
      {activeTab === "orders" && (
        <div
          style={{
            position: "relative",
            zIndex: 10,
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            background: theme.bg,
            overflow: "hidden"
          }}
        >
          <DeliveryQueueTabBar
            theme={theme}
            isMobileView={isMobileView}
            queueTab={queue.queueTab}
            pendingCount={queue.pendingStops.length}
            completedCount={queue.completedStops.length}
            onSelectTab={handleTabChange}
          />

          {/* 120 FPS Native CSS Scroll-Snap ViewPager Container */}
          <div
            ref={pagerRef}
            onScroll={handlePagerScroll}
            className="viewpager-container no-scrollbar"
            style={{
              flex: 1,
              width: "100%",
              display: "flex",
              flexDirection: "row",
              overflowX: "auto",
              overflowY: "hidden",
              scrollSnapType: "x mandatory",
              WebkitOverflowScrolling: "touch",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              overscrollBehaviorX: "contain",
              contain: "layout style paint",
              willChange: "scroll-position"
            }}
          >
            {/* PANE 1: Perlu Diantar (ACTIVE) */}
            <div
              className="viewpager-pane"
              style={{
                flex: "0 0 100%",
                width: "100%",
                minWidth: "100%",
                maxWidth: "100%",
                height: "100%",
                overflowY: "auto",
                overflowX: "hidden",
                scrollSnapAlign: "start",
                scrollSnapStop: "always",
                boxSizing: "border-box",
                padding: isMobileView ? "16px 12px 48px" : "20px 20px 48px",
                contain: "content",
                willChange: "transform"
              }}
            >
              <div style={{ maxWidth: 760, margin: "0 auto", width: "100%" }}>
                {!isOnline ? (
                  <DeliveryOfflineState theme={theme} onToggleOnline={onToggleOnline} />
                ) : queue.pendingStops.length === 0 ? (
                  <div
                    style={{
                      padding: 36,
                      textAlign: "center",
                      background: theme.surface,
                      borderRadius: 14,
                      border: `1px solid ${theme.border}`,
                      color: theme.inkSoft,
                      boxShadow: "0 1px 2px rgba(0,0,0,0.02)"
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: "50%",
                        background: theme.surface2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 12px",
                        color: theme.inkSoft
                      }}
                    >
                      <CheckCircle2 size={24} />
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: theme.ink, marginBottom: 4 }}>
                      Semua Antaran Telah Selesai
                    </div>
                    <div style={{ fontSize: 12, color: theme.inkSoft, maxWidth: 360, margin: "0 auto", lineHeight: 1.5 }}>
                      Tidak ada paket yang menunggu pengantaran saat ini. Anda dapat memeriksa rekap setoran kas COD di tab Rekap Kas.
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {queue.pendingStops.map((stop) => (
                      <DeliveryPendingCard
                        key={stop.id}
                        stop={stop}
                        theme={theme}
                        isMobileView={isMobileView}
                        onSelectForMap={handleSelectStopForMap}
                        onOpenWhatsApp={queue.handleOpenWhatsApp}
                        onRequestComplete={queue.setStopToComplete}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* PANE 2: Selesai (COMPLETED) */}
            <div
              className="viewpager-pane"
              style={{
                flex: "0 0 100%",
                width: "100%",
                minWidth: "100%",
                maxWidth: "100%",
                height: "100%",
                overflowY: "auto",
                overflowX: "hidden",
                scrollSnapAlign: "start",
                scrollSnapStop: "always",
                boxSizing: "border-box",
                padding: isMobileView ? "16px 12px 48px" : "20px 20px 48px",
                contain: "content",
                willChange: "transform"
              }}
            >
              <div style={{ maxWidth: 760, margin: "0 auto", width: "100%" }}>
                <DeliveryCompletedTab
                  completedStops={queue.completedStops}
                  totalCodCollected={queue.totalCodCollected}
                  isCodSettled={queue.isCodSettled}
                  theme={theme}
                  isMobileView={isMobileView}
                  onContactStore={queue.handleContactStore}
                  onOpenSettlement={onOpenSettlement}
                />
              </div>
            </div>

            {/* PANE 3: Profil (PROFILE) */}
            <div
              className="viewpager-pane"
              style={{
                flex: "0 0 100%",
                width: "100%",
                minWidth: "100%",
                maxWidth: "100%",
                height: "100%",
                overflowY: "auto",
                overflowX: "hidden",
                scrollSnapAlign: "start",
                scrollSnapStop: "always",
                boxSizing: "border-box",
                padding: isMobileView ? "16px 12px 48px" : "20px 20px 48px",
                contain: "content",
                willChange: "transform"
              }}
            >
              <div style={{ maxWidth: 760, margin: "0 auto", width: "100%" }}>
                <DeliveryProfileTab
                  driver={driver}
                  theme={theme}
                  isMobileView={isMobileView}
                  onContactStore={queue.handleContactStore}
                  onOpenProfile={onOpenProfile}
                  onUnlinkStore={onUnlinkStore}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. COMPACT FLOATING ACTIVE STOP CARD ON MAP */}
      {activeTab === "map" && (
        <DeliveryFloatingMapCard
          activeStop={queue.activeStop}
          hasQueue={queue.sortedQueue.length > 0}
          isMobileView={isMobileView}
          theme={theme}
          onOpenWhatsApp={queue.handleOpenWhatsApp}
          onOpenCompleteModal={queue.setStopToComplete}
          onSwitchToList={onSwitchToList}
          onSelectCompletedTab={() => handleTabChange("COMPLETED")}
        />
      )}

      {/* 4. IN-APP CONFIRMATION MODAL */}
      <DeliveryCompleteModal
        stop={queue.stopToComplete}
        onClose={() => queue.setStopToComplete(null)}
        onConfirm={queue.executeCompleteStop}
        theme={theme}
      />
    </div>
  );
}

export default StoreDeliveryQueueView;
