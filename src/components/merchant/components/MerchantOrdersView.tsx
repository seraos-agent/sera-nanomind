import { useState, useEffect } from "react";
import { ShoppingBag } from "lucide-react";
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
  const posCompletedOrders = completedOrders.filter((o) => isPosOrder(o));
  const onlineCompletedOrders = completedOrders.filter((o) => !isPosOrder(o));
  const displayedCompletedOrders = (
    completedSourceFilter === "POS"
      ? posCompletedOrders
      : completedSourceFilter === "ONLINE"
        ? onlineCompletedOrders
        : completedOrders
  )
    .slice()
    .sort((a, b) => getOrderSortTimestamp(b) - getOrderSortTimestamp(a));
  const displayedCompletedRevenue = displayedCompletedOrders.reduce(
    (sum, o) => sum + (o.totalAmount || 0),
    0
  );
  const filteredOrders = filter === "ACTIVE" ? activeOrders : displayedCompletedOrders;
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

  return (
    <div
      style={{
        padding: isMobileView ? "16px 12px 48px" : "20px 20px 48px",
        maxWidth: 760,
        margin: "0 auto",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 16
      }}
    >
      {/* 1. Tab Filter Penjualan & Ulasan */}
      <OrderFilterTabs
        theme={theme}
        filter={filter}
        setFilter={setFilter}
        activeCount={activeOrders.length}
        shippedCount={shippedOrders.length}
        isMobileView={isMobileView}
      />

      {/* 2. View Content based on active tab */}
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
          {/* Revenue Summary & Source Filter in Completed Tab */}
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

          {/* Orders List / Empty State */}
          {filteredOrders.length === 0 ? (
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
                <ShoppingBag size={24} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: theme.ink }}>
                {filter === "ACTIVE"
                  ? "No orders awaiting processing"
                  : filter === "COMPLETED"
                    ? "No completed orders yet"
                    : "No incoming orders yet"}
              </div>
              <div style={{ fontSize: 12 }}>
                {filter === "COMPLETED"
                  ? "Completed orders will appear here."
                  : "Orders from buyers will appear here automatically."}
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {filteredOrders.map((order) =>
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
                    onRequestCourier={async (o) => {
                      if (onRequestCourier) await onRequestCourier(o);
                      setFilter("COURIER");
                    }}
                    onOpenDetail={(o) => setSelectedOrder(o)}
                  />
                )
              )}
            </div>
          )}
        </>
      )}

      {/* Full-Screen Order Detail Modal */}
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
          onRequestCourier={async (o) => {
            if (onRequestCourier) await onRequestCourier(o);
            setSelectedOrder(null);
            setFilter("COURIER");
          }}
        />
      )}
    </div>
  );
}
