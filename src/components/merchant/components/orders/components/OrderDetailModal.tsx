import { useState, useEffect } from "react";
import {
  ArrowLeft,
  MapPin,
  ShoppingBag,
  Receipt,
  ShieldCheck,
  Eye,
  FileText
} from "lucide-react";
import type { ThemeType } from "../../../../../theme";
import { getStoreEntityLabel, formatOrderDateTime, type MerchantOrder, type MerchantStore } from "../../../types";
import { parseOrderItems } from "../utils/orderItemParser";
import { isPosOrder } from "../../../utils/posOrderMapper";
import { WhatsAppIcon } from "../../../../driver/queue/utils/deliveryIcons";
import { OrderDetailActionBar } from "./OrderDetailActionBar";
import { OrderProofLightboxModal } from "./OrderProofLightboxModal";

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: MerchantOrder;
  theme: ThemeType;
  store: MerchantStore | null;
  isMobileView?: boolean;
  onUpdateOrderStatus?: (orderId: string, nextStatus: MerchantOrder["status"]) => void;
  onRequestCourier?: (order: MerchantOrder) => void;
}

export function OrderDetailModal({
  isOpen,
  onClose,
  order,
  theme,
  store,
  isMobileView,
  onUpdateOrderStatus,
  onRequestCourier
}: OrderDetailModalProps) {
  const [isProofZoomed, setIsProofZoomed] = useState(false);
  const [isActionPending, setIsActionPending] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<MerchantOrder["status"]>(order.status);

  useEffect(() => {
    setCurrentStatus(order.status);
  }, [order.id, order.status]);

  useEffect(() => {
    if (!isOpen || isMobileView) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isProofZoomed) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isMobileView, isProofZoomed, onClose]);

  if (!isOpen) return null;

  const proofUrl = order.paymentProofUrl || (order as any).payment_proof_url || (order as any).proofUrl;
  const parsedItems = parseOrderItems(order.itemsSummary);
  const isOfflinePos = isPosOrder(order);
  const isPickupOnline = !isOfflinePos && order.shippingMethod === "PICKUP";
  const isFoodStore = store?.type === "FOOD";
  const entity = getStoreEntityLabel(store?.type);

  const getStatusBadge = () => {
    switch (currentStatus) {
      case "PENDING":
      case "CONFIRMED":
        return { label: "Awaiting Confirmation", bg: "#FEF3C7", text: "#B45309", border: "#FDE68A" };
      case "PROCESSING":
        return { label: "Processing", bg: "#DBEAFE", text: "#1D4ED8", border: "#BFDBFE" };
      case "SHIPPED":
        return { label: "In Transit", bg: "#E0E7FF", text: "#4338CA", border: "#C7D2FE" };
      case "DELIVERED":
        return { label: "Delivered", bg: "#D1FAE5", text: "#065F46", border: "#A7F3D0" };
      case "COMPLETED":
        return { label: "Completed", bg: "#ECFDF5", text: "#047857", border: "#6EE7B7" };
      case "CANCELLED":
        return { label: "Cancelled", bg: "#FEE2E2", text: "#B91C1C", border: "#FECACA" };
      default:
        return { label: currentStatus, bg: theme.surface2, text: theme.ink, border: theme.border };
    }
  };

  const statusBadge = getStatusBadge();

  const handleWhatsApp = () => {
    if (!order.customerPhone || String(order.customerPhone) === "-") return;
    const cleanPhone = String(order.customerPhone).replace(/^0/, "62").replace(/[^0-9]/g, "");
    const text = encodeURIComponent(
      `Hi ${order.customerName}, we are reaching out from ${store?.name || "the store"} regarding order ${order.id}.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, "_blank");
  };

  return (
    <div
      onClick={(e) => {
        if (!isMobileView && e.target === e.currentTarget) {
          onClose();
        }
      }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        background: isMobileView ? theme.bg : "rgba(9, 12, 18, 0.56)",
        display: "flex",
        alignItems: isMobileView ? "stretch" : "center",
        justifyContent: "center",
        padding: isMobileView ? 0 : 20,
        backdropFilter: isMobileView ? "none" : "blur(6px)",
        WebkitBackdropFilter: isMobileView ? "none" : "blur(6px)"
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Order Details"
        style={{
          background: theme.surface,
          width: "100%",
          maxWidth: isMobileView ? "100%" : 600,
          height: isMobileView ? "100%" : "auto",
          maxHeight: isMobileView ? "100%" : "90vh",
          borderRadius: isMobileView ? 0 : 18,
          border: isMobileView ? "none" : `1px solid ${theme.border}`,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: isMobileView ? "none" : "0 24px 64px rgba(0,0,0,0.34)"
        }}
      >
        <div
          style={{
            padding: isMobileView ? "12px 14px" : "14px 18px",
            background: theme.surface,
            borderBottom: `1px solid ${theme.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            flexShrink: 0
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              type="button"
              onClick={onClose}
              title="Back"
              style={{
                background: "transparent",
                border: "none",
                borderRadius: 8,
                padding: "4px 6px",
                color: theme.ink,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <ArrowLeft size={19} />
            </button>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: theme.ink }}>
              Order Details
            </h3>
          </div>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: isMobileView ? "14px 12px 24px" : "16px 18px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 12
          }}
        >
          {/* 1. ORDER IDENTIFIER & LIVE STATUS PILL */}
          <div
            style={{
              background: theme.surface2,
              borderRadius: 12,
              padding: "11px 14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              border: `1px solid ${theme.border}`
            }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: theme.ink, fontFamily: "monospace" }}>
                {order.id}
              </div>
              <div style={{ fontSize: 11, color: theme.inkSoft, marginTop: 2 }}>
                {formatOrderDateTime(order.createdAt)}
              </div>
            </div>

            <span
              style={{
                padding: "4px 10px",
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 700,
                background: statusBadge.bg,
                color: statusBadge.text,
                border: `1px solid ${statusBadge.border}`
              }}
            >
              {statusBadge.label}
            </span>
          </div>

          {/* 2. SEKSI BUKTI PEMBAYARAN */}
          <div
            style={{
              background: theme.surface2,
              borderRadius: 14,
              border: `1px solid ${theme.border}`,
              padding: "14px 16px",
              display: "flex",
              flexDirection: "column",
              gap: 12
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <ShieldCheck size={16} color={theme.status} />
                <span style={{ fontSize: 13, fontWeight: 700, color: theme.ink }}>
                  {isOfflinePos ? "POS Payment Status" : "Payment Proof"}
                </span>
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: 6,
                  background: theme.surface,
                  border: `1px solid ${theme.border}`,
                  color: theme.ink
                }}
              >
                {order.paymentMethod}
              </span>
            </div>

            {isOfflinePos ? (
              <div
                style={{
                  padding: "10px 12px",
                  borderRadius: 8,
                  background: theme.surface,
                  border: `1px solid ${theme.border}`,
                  fontSize: 12,
                  color: theme.inkSoft,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <span>Payment received at POS register</span>
                <strong style={{ color: "#10B981" }}>PAID</strong>
              </div>
            ) : proofUrl ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div
                  onClick={() => setIsProofZoomed(true)}
                  style={{
                    position: "relative",
                    background: "#000000",
                    borderRadius: 10,
                    overflow: "hidden",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: `1px solid ${theme.border}`,
                    maxHeight: 220
                  }}
                >
                  <img
                    src={proofUrl}
                    alt="Buyer Payment Proof"
                    style={{ width: "100%", maxHeight: 220, objectFit: "contain" }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: 8,
                      right: 8,
                      background: "rgba(0,0,0,0.75)",
                      color: "#FFFFFF",
                      padding: "4px 8px",
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: 4
                    }}
                  >
                    <Eye size={12} />
                    <span>Zoom</span>
                  </div>
                </div>
                <div style={{ fontSize: 11.5, color: theme.inkSoft, lineHeight: 1.4 }}>
                  Receipt/screenshot was attached by the buyer at checkout.
                </div>
              </div>
            ) : (
              <div
                style={{
                  padding: "12px",
                  borderRadius: 8,
                  background: theme.surface,
                  border: `1px dashed ${theme.border}`,
                  fontSize: 12,
                  color: theme.inkSoft,
                  textAlign: "center"
                }}
              >
                No digital transfer proof uploaded (Cash / Pay on Pickup).
              </div>
            )}
          </div>

          {/* 3. ORDER ITEMS LIST */}
          <div
            style={{
              background: theme.surface2,
              borderRadius: 14,
              border: `1px solid ${theme.border}`,
              padding: "14px 16px",
              display: "flex",
              flexDirection: "column",
              gap: 10
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <ShoppingBag size={16} color={theme.accent} />
              <span style={{ fontSize: 13, fontWeight: 700, color: theme.ink }}>
                {isFoodStore ? "Ordered Menu Items" : "Ordered Items"}
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {parsedItems.map((itemStr, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 8,
                    background: theme.surface,
                    border: `1px solid ${theme.border}`,
                    borderRadius: 10,
                    padding: "10px 12px"
                  }}
                >
                  <span
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      background: theme.surface2,
                      border: `1px solid ${theme.border}`,
                      fontSize: 10.5,
                      fontWeight: 700,
                      color: theme.ink,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginTop: 1
                    }}
                  >
                    {idx + 1}
                  </span>
                  <div style={{ flex: 1, fontSize: 13, color: theme.ink, fontWeight: 600, lineHeight: 1.4 }}>
                    {itemStr}
                  </div>
                </div>
              ))}
            </div>

            {order.customerNote && (
              <div
                style={{
                  background: theme.surface,
                  border: `1px solid ${theme.border}`,
                  borderRadius: 10,
                  padding: "10px 12px",
                  fontSize: 12,
                  color: theme.ink,
                  display: "flex",
                  gap: 8,
                  lineHeight: 1.45
                }}
              >
                <FileText size={15} color={theme.accent} style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <strong style={{ color: theme.ink }}>Buyer Special Note:</strong>
                  <div style={{ marginTop: 2, color: theme.inkSoft }}>&ldquo;{order.customerNote}&rdquo;</div>
                </div>
              </div>
            )}
          </div>

          {/* 4. BUYER & SHIPPING DETAILS */}
          <div
            style={{
              background: theme.surface2,
              borderRadius: 14,
              border: `1px solid ${theme.border}`,
              padding: "14px 16px",
              display: "flex",
              flexDirection: "column",
              gap: 12
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <MapPin size={16} color={theme.accent} />
                <span style={{ fontSize: 13, fontWeight: 700, color: theme.ink }}>
                  {isOfflinePos
                    ? "Service & Customer"
                    : isPickupOnline
                      ? `${entity} Pickup & Customer`
                      : "Shipping & Customer"}
                </span>
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: 6,
                  background: theme.surface,
                  border: `1px solid ${theme.border}`,
                  color: theme.ink,
                  whiteSpace: "nowrap"
                }}
              >
                {isOfflinePos
                  ? order.tableOrQueueNumber
                    ? order.tableOrQueueNumber === "Takeaway"
                      ? "Takeaway (POS)"
                      : `Dine-In • ${order.tableOrQueueNumber}`
                    : "POS Transaction"
                  : isPickupOnline
                    ? `${entity} Pickup`
                    : order.shippingMethod === "STORE_DELIVERY"
                      ? `${entity} Courier`
                      : order.shippingMethod === "REGULAR"
                        ? "Standard Shipping"
                        : "SERA Courier"}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: theme.surface,
                border: `1px solid ${theme.border}`,
                borderRadius: 10,
                padding: "10px 12px",
                flexWrap: "wrap",
                gap: 8
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: theme.ink }}>
                  {order.customerName}
                </div>
                {isOfflinePos ? (
                  <div style={{ fontSize: 11.5, color: theme.inkSoft }}>
                    Cashier: {order.cashierName || "Store Owner"}
                  </div>
                ) : order.customerPhone && String(order.customerPhone) !== "-" ? (
                  <div style={{ fontSize: 11.5, color: theme.inkSoft }}>
                    {order.customerPhone}
                  </div>
                ) : null}
              </div>

              {order.customerPhone && String(order.customerPhone) !== "-" && (
                <button
                  type="button"
                  onClick={handleWhatsApp}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 12px",
                    borderRadius: 8,
                    background: "#25D366",
                    color: "#FFFFFF",
                    border: "none",
                    fontSize: 11.5,
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  <WhatsAppIcon size={14} color="#FFFFFF" />
                  <span>Chat WhatsApp</span>
                </button>
              )}
            </div>

            {!isOfflinePos && !isPickupOnline && order.shippingAddress && order.shippingAddress !== "-" && (
              <div
                style={{
                  background: theme.surface,
                  border: `1px solid ${theme.border}`,
                  borderRadius: 10,
                  padding: "10px 12px",
                  fontSize: 12,
                  color: theme.ink,
                  lineHeight: 1.45
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 600, color: theme.inkSoft, marginBottom: 3 }}>
                  Delivery Destination Address:
                </div>
                <div>{order.shippingAddress}</div>
              </div>
            )}
          </div>

          {/* 5. FEE BREAKDOWN & PAYMENT TOTAL */}
          <div
            style={{
              background: theme.surface2,
              borderRadius: 14,
              border: `1px solid ${theme.border}`,
              padding: "14px 16px",
              display: "flex",
              flexDirection: "column",
              gap: 8
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 2 }}>
              <Receipt size={16} color={theme.accent} />
              <span style={{ fontSize: 13, fontWeight: 700, color: theme.ink }}>
                Payment Summary
              </span>
            </div>

            {isOfflinePos ? (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: theme.inkSoft }}>
                <span>Payment Method</span>
                <span style={{ color: theme.ink, fontWeight: 600 }}>
                  {order.paymentMethod}
                </span>
              </div>
            ) : isPickupOnline ? (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: theme.inkSoft }}>
                <span>Fulfillment</span>
                <span style={{ color: theme.ink, fontWeight: 600 }}>
                  {entity} Pickup (Rp 0)
                </span>
              </div>
            ) : (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: theme.inkSoft }}>
                <span>{entity} Shipping Fee</span>
                <span style={{ color: theme.ink, fontWeight: 600 }}>
                  {order.shippingCost && order.shippingCost > 0
                    ? `Rp ${order.shippingCost.toLocaleString("id-ID")}`
                    : "Free Shipping"}
                </span>
              </div>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingTop: 8,
                marginTop: 4,
                borderTop: `1px dashed ${theme.border}`,
                fontSize: 14,
                fontWeight: 700
              }}
            >
              <span style={{ color: theme.ink }}>Total Amount</span>
              <span style={{ fontSize: 17, fontWeight: 800, color: theme.accent }}>
                Rp {(order.totalAmount || 0).toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        </div>

        <OrderDetailActionBar
          order={order}
          currentStatus={currentStatus}
          isActionPending={isActionPending}
          setIsActionPending={setIsActionPending}
          theme={theme}
          onClose={onClose}
          onUpdateOrderStatus={onUpdateOrderStatus}
          onRequestCourier={onRequestCourier}
        />
      </div>

      {isProofZoomed && proofUrl && (
        <OrderProofLightboxModal
          proofUrl={proofUrl}
          orderId={order.id}
          onClose={() => setIsProofZoomed(false)}
        />
      )}
    </div>
  );
}
