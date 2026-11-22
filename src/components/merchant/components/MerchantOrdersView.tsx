import { useState, useEffect, useMemo } from "react";
import { Search, ShoppingBag, X } from "lucide-react";
import type { ThemeType } from "../../../theme";
import type { MerchantOrder, MerchantStore, MerchantReview } from "../types";
import { MerchantReviewsView } from "./MerchantReviewsView";
import { parseOrderItems } from "./orders/utils/orderItemParser";
import {
  useMerchantOrderReconciliation,
  type OrderFilterType
} from "./orders/hooks/useMerchantOrderReconciliation";
import { OrderFilterTabs } from "./orders/components/OrderFilterTabs";
import { OrderRevenueSummary } from "./orders/components/OrderRevenueSummary";
import { OrderActiveCard } from "./orders/components/OrderActiveCard";
import { OrderCompletedCard } from "./orders/components/OrderCompletedCard";
import { OrderCourierManifest } from "./orders/components/OrderCourierManifest";
import { OrderDetailModal } from "./orders/components/OrderDetailModal";
import { SalesNavigationSidebar } from "./orders/components/SalesNavigationSidebar";
import { isPosOrder, getOrderSortTimestamp } from "../utils/posOrderMapper";

// Backward compatibility re-exports
export { parseOrderItems };
export type { OrderFilterType };

interface MerchantOrdersViewProps {
  orders: MerchantOrder[];
  theme: ThemeType;
  isMobileView?: boolean;
  onUpdateOrderStatus: (orderId: string, nextStatus: MerchantOrder["status"]) => void;
  onRequestCourier?: (order: MerchantOrder) => void;
  store?: MerchantStore | null;
  reviews?: MerchantReview[];
  onRefreshReviews?: () => Promise<void>;
  initialTab?: OrderFilterType;
}

export function MerchantOrdersView({
  orders,
  theme,
  isMobileView,
  onUpdateOrderStatus,
  onRequestCourier,
  store,
  reviews = [],
  onRefreshReviews = async () => { },
  initialTab = "ACTIVE"
}: MerchantOrdersViewProps) {
  const {
    filter,
    setFilter,
    activeOrders,
    shippedOrders,
    completedOrders,
    totalRevenue,
    handleReconcileCourier,
    settlementSuccessMsg
  } = useMerchantOrderReconciliation({
    orders,
    store,
    initialTab,
    onUpdateOrderStatus
  });

  const couriersList = store?.linkedCouriers || [];
  const [completedSourceFilter, setCompletedSourceFilter] = useState<"ALL" | "ONLINE" | "POS">("ALL");
  const [completedSearchQuery, setCompletedSearchQuery] = useState("");

  const posCompletedOrders = useMemo(
    () => completedOrders.filter((o) => isPosOrder(o)),
    [completedOrders]
  );
  const onlineCompletedOrders = useMemo(
    () => completedOrders.filter((o) => !isPosOrder(o)),
    [completedOrders]
  );

  const displayedCompletedOrders = useMemo(
    () =>
      (completedSourceFilter === "POS"
        ? posCompletedOrders
        : completedSourceFilter === "ONLINE"
          ? onlineCompletedOrders
          : completedOrders
      )
        .slice()
        .sort((a, b) => getOrderSortTimestamp(b) - getOrderSortTimestamp(a)),
    [completedSourceFilter, completedOrders, onlineCompletedOrders, posCompletedOrders]
  );

  const desktopCompletedOrders = useMemo(() => {
    const q = completedSearchQuery.trim().toLowerCase();
    if (!q) return displayedCompletedOrders;
    return displayedCompletedOrders.filter(
      (o) =>
        o.id?.toLowerCase().includes(q) ||
        o.customerName?.toLowerCase().includes(q) ||
        o.itemsSummary?.toLowerCase().includes(q) ||
        o.paymentMethod?.toLowerCase().includes(q) ||
        o.tableOrQueueNumber?.toLowerCase().includes(q)
    );
  }, [displayedCompletedOrders, completedSearchQuery]);

  const displayedCompletedRevenue = displayedCompletedOrders.reduce(
    (sum, o) => sum + (o.totalAmount || 0),
    0
  );
  const mobileFilteredOrders = filter === "ACTIVE" ? activeOrders : displayedCompletedOrders;
  const [selectedOrder, setSelectedOrder] = useState<MerchantOrder | null>(null);

  // Synchronize selectedOrder if orders array updates
  useEffect(() => {
    if (selectedOrder) {
      const live = orders.find((o) => o.id === selectedOrder.id);
      if (
        live &&
        (live.status !== selectedOrder.status ||
          live.courierStatus !== selectedOrder.courierStatus)
      ) {
        setSelectedOrder(live);
      }
    }
  }, [orders, selectedOrder]);

  const handleDispatchCourier = async (order: MerchantOrder) => {
    if (onRequestCourier) await onRequestCourier(order);
    setSelectedOrder(null);
    setFilter("COURIER");
  };

  const renderOrdersListOrEmpty = (
    listToRender: MerchantOrder[],
    hasSearchFilter = false
  ) => {
    if (listToRender.length === 0) {
      return (
        <div
          style={{
            textAlign: "center",
            padding: "48px 20px",
            background: theme.surface,
            borderRadius: 14,
            border: `1px solid ${theme.border}`,
            color: theme.inkSoft,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: theme.surface2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: theme.inkSoft
            }}
          >
            {hasSearchFilter ? <Search size={22} /> : <ShoppingBag size={24} />}
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: theme.ink }}>
            {hasSearchFilter
              ? "No matching transactions found"
              : filter === "ACTIVE"
                ? "No orders awaiting processing"
                : filter === "COMPLETED"
                  ? "No completed orders yet"
                  : "No incoming orders yet"}
          </div>
          <div style={{ fontSize: 12 }}>
            {hasSearchFilter
              ? "Try another keyword or clear your search filter."
              : filter === "COMPLETED"
                ? "Completed orders will appear here."
                : "Orders from buyers will appear here automatically."}
          </div>
          {hasSearchFilter && (
            <button
              type="button"
              onClick={() => setCompletedSearchQuery("")}
              style={{
                marginTop: 4,
                padding: "8px 16px",
                borderRadius: 8,
                background: theme.surface2,
                color: theme.ink,
                border: `1px solid ${theme.border}`,
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer"
              }}
            >
              Clear Search
            </button>
          )}
        </div>
      );
    }

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {listToRender.map((order) =>
          filter === "COMPLETED" ? (
            <OrderCompletedCard
              key={order.id}
              order={order}
              theme={theme}
              isMobileView={isMobileView}
              onOpenDetail={(o) => setSelectedOrder(o)}
            />
          ) : (
            <OrderActiveCard
              key={order.id}
              order={order}
              theme={theme}
              store={store || null}
              isMobileView={isMobileView}
              onUpdateOrderStatus={onUpdateOrderStatus}
              onRequestCourier={handleDispatchCourier}
              onOpenDetail={(o) => setSelectedOrder(o)}
            />
          )
        )}
      </div>
    );
  };

  // Desktop 2-column split workspace matching Restaurant Info, Menu, and POS
  if (!isMobileView) {
    const sectionTitles: Record<OrderFilterType, string> = {
      ACTIVE: "Orders",
      COURIER: "Shipped",
      COMPLETED: "Completed",
      REVIEWS: "Reviews"
    };

    const sourceOptions: Array<{ id: "ALL" | "ONLINE" | "POS"; label: string }> = [
      { id: "ALL", label: `All (${completedOrders.length})` },
      { id: "ONLINE", label: `Online (${onlineCompletedOrders.length})` },
      { id: "POS", label: `Offline POS (${posCompletedOrders.length})` }
    ];

    const sidebarRevenueProps =
      filter === "COMPLETED" && !selectedOrder
        ? completedSourceFilter === "ONLINE"
          ? {
              revenueLabel: "Online Revenue",
              totalRevenue: displayedCompletedRevenue,
              revenueSubtext: `${onlineCompletedOrders.length} online transactions`
            }
          : completedSourceFilter === "POS"
            ? {
                revenueLabel: "Offline POS Revenue",
                totalRevenue: displayedCompletedRevenue,
                revenueSubtext: `${posCompletedOrders.length} offline POS transactions`
              }
            : {
                revenueLabel: "Completed Revenue",
                totalRevenue,
                revenueSubtext: `Online: ${onlineCompletedOrders.length} / POS: ${posCompletedOrders.length}`
              }
        : {
            revenueLabel: "Completed Revenue",
            totalRevenue,
            revenueSubtext: `Online: ${onlineCompletedOrders.length} / POS: ${posCompletedOrders.length}`
          };

    return (
      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "row",
          gap: 16,
          padding: "18px 22px",
          width: "100%",
          minHeight: 0,
          overflow: "hidden",
          alignItems: "stretch",
          boxSizing: "border-box"
        }}
      >
        {/* Left Column: Inline Order Details OR Pinned Bar + Scrollable List */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            gap: 14,
            overflowX: "clip",
            overflowY: "hidden"
          }}
        >
          {selectedOrder ? (
            <div
              className="sales-content-scroll"
              style={{
                flex: 1,
                minHeight: 0,
                overflowY: "auto",
                overflowX: "hidden",
                paddingRight: 4
              }}
            >
              <OrderDetailModal
                inline={true}
                isOpen={true}
                onClose={() => setSelectedOrder(null)}
                order={selectedOrder}
                theme={theme}
                store={store || null}
                isMobileView={false}
                onUpdateOrderStatus={(orderId, nextStatus) => {
                  onUpdateOrderStatus(orderId, nextStatus);
                  setSelectedOrder((prev) =>
                    prev && prev.id === orderId ? { ...prev, status: nextStatus } : prev
                  );
                }}
                onRequestCourier={handleDispatchCourier}
              />
            </div>
          ) : (
            <>
              {/* Pinned Header / Filter Bar */}
              {filter === "COMPLETED" ? (
                <div
                  style={{
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    flexWrap: "wrap"
                  }}
                >
                  <div
                    style={{
                      flex: "1 1 220px",
                      minWidth: 180,
                      height: 38,
                      borderRadius: 10,
                      background: theme.surface,
                      border: `1px solid ${theme.border}`,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "0 12px",
                      boxSizing: "border-box"
                    }}
                  >
                    <Search size={15} color={theme.inkSoft} style={{ flexShrink: 0 }} />
                    <input
                      type="text"
                      value={completedSearchQuery}
                      onChange={(e) => setCompletedSearchQuery(e.target.value)}
                      placeholder="Search order ID, customer, item, or payment..."
                      aria-label="Search completed transactions"
                      style={{
                        flex: 1,
                        minWidth: 0,
                        background: "transparent",
                        border: "none",
                        outline: "none",
                        color: theme.ink,
                        fontSize: 13
                      }}
                    />
                    {completedSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setCompletedSearchQuery("")}
                        aria-label="Clear search"
                        style={{
                          background: "transparent",
                          border: "none",
                          padding: 2,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: theme.inkSoft,
                          cursor: "pointer"
                        }}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                    {sourceOptions.map((chip) => {
                      const active = completedSourceFilter === chip.id;
                      return (
                        <button
                          key={chip.id}
                          type="button"
                          onClick={() => setCompletedSourceFilter(chip.id)}
                          style={{
                            height: 38,
                            padding: "0 13px",
                            borderRadius: 10,
                            border: active ? `1px solid ${theme.ink}` : `1px solid ${theme.border}`,
                            background: active && theme.isDark ? theme.surface2 : theme.surface,
                            color: active ? theme.ink : theme.inkSoft,
                            fontSize: 12.5,
                            fontWeight: active ? 700 : 500,
                            whiteSpace: "nowrap",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center"
                          }}
                        >
                          {chip.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div style={{ flexShrink: 0, fontSize: 17, fontWeight: 700, color: theme.ink }}>
                  {sectionTitles[filter]}
                </div>
              )}

              {/* Independently Scrollable List Area */}
              <div
                className="sales-content-scroll"
                style={{
                  flex: 1,
                  minHeight: 0,
                  overflowY: "auto",
                  overflowX: "hidden",
                  paddingRight: 4
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingBottom: 24 }}>
                  {filter === "REVIEWS" ? (
                    <MerchantReviewsView
                      theme={theme}
                      isMobileView={false}
                      store={store || null}
                      reviews={reviews}
                      onRefreshReviews={onRefreshReviews}
                      embedded={true}
                    />
                  ) : filter === "COURIER" ? (
                    <OrderCourierManifest
                      theme={theme}
                      couriersList={couriersList}
                      shippedOrders={shippedOrders}
                      isMobileView={false}
                      settlementSuccessMsg={settlementSuccessMsg}
                      onReconcileCourier={handleReconcileCourier}
                    />
                  ) : (
                    renderOrdersListOrEmpty(
                      filter === "COMPLETED" ? desktopCompletedOrders : activeOrders,
                      filter === "COMPLETED" && Boolean(completedSearchQuery.trim())
                    )
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right Column: Stationary Sales Navigation & Revenue Summary */}
        <div
          style={{
            width: "clamp(210px, 26vw, 310px)",
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            overflowY: "auto"
          }}
        >
          <SalesNavigationSidebar
            theme={theme}
            activeFilter={selectedOrder ? "" : filter}
            onSelectFilter={(nextFilter) => {
              setSelectedOrder(null);
              setFilter(nextFilter);
            }}
            activeCount={activeOrders.length}
            shippedCount={shippedOrders.length}
            completedCount={completedOrders.length}
            reviewsCount={reviews.length}
            onlineCount={onlineCompletedOrders.length}
            posCount={posCompletedOrders.length}
            revenueLabel={sidebarRevenueProps.revenueLabel}
            totalRevenue={sidebarRevenueProps.totalRevenue}
            revenueSubtext={sidebarRevenueProps.revenueSubtext}
          />
        </div>
      </div>
    );
  }

  // Mobile 1-column view
  return (
    <div
      style={{
        padding: "16px 12px 48px",
        maxWidth: 760,
        margin: "0 auto",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 16
      }}
    >
      <OrderFilterTabs
        theme={theme}
        filter={filter}
        setFilter={setFilter}
        activeCount={activeOrders.length}
        shippedCount={shippedOrders.length}
        isMobileView={isMobileView}
      />

      {filter === "REVIEWS" ? (
        <MerchantReviewsView
          theme={theme}
          isMobileView={isMobileView}
          store={store || null}
          reviews={reviews}
          onRefreshReviews={onRefreshReviews}
          embedded={true}
        />
      ) : filter === "COURIER" ? (
        <OrderCourierManifest
          theme={theme}
          couriersList={couriersList}
          shippedOrders={shippedOrders}
          isMobileView={isMobileView}
          settlementSuccessMsg={settlementSuccessMsg}
          onReconcileCourier={handleReconcileCourier}
        />
      ) : (
        <>
          {filter === "COMPLETED" && (
            <>
              <OrderRevenueSummary
                theme={theme}
                totalRevenue={
                  completedSourceFilter === "ALL" ? totalRevenue : displayedCompletedRevenue
                }
                completedCount={displayedCompletedOrders.length}
                isMobileView={isMobileView}
              />
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                {[
                  { id: "ALL" as const, label: `All (${completedOrders.length})` },
                  { id: "ONLINE" as const, label: `Online (${onlineCompletedOrders.length})` },
                  { id: "POS" as const, label: `Offline POS (${posCompletedOrders.length})` }
                ].map((chip) => {
                  const active = completedSourceFilter === chip.id;
                  return (
                    <button
                      key={chip.id}
                      type="button"
                      onClick={() => setCompletedSourceFilter(chip.id)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 999,
                        border: `1px solid ${active ? theme.accent : theme.border}`,
                        background: active ? `${theme.accent}16` : theme.surface,
                        color: active ? theme.accent : theme.inkSoft,
                        fontSize: 12,
                        fontWeight: active ? 700 : 500,
                        cursor: "pointer"
                      }}
                    >
                      {chip.label}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {renderOrdersListOrEmpty(mobileFilteredOrders)}
        </>
      )}

      {selectedOrder && (
        <OrderDetailModal
          isOpen={Boolean(selectedOrder)}
          onClose={() => setSelectedOrder(null)}
          order={selectedOrder}
          theme={theme}
          store={store || null}
          isMobileView={isMobileView}
          onUpdateOrderStatus={(orderId, nextStatus) => {
            onUpdateOrderStatus(orderId, nextStatus);
            setSelectedOrder(prev => prev && prev.id === orderId ? { ...prev, status: nextStatus } : prev);
          }}
          onRequestCourier={handleDispatchCourier}
        />
      )}
    </div>
  );
}
