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
        return { label: "Menunggu Konfirmasi", bg: "#FEF3C7", text: "#B45309", border: "#FDE68A" };
      case "PROCESSING":
        return { label: "Sedang Diproses", bg: "#DBEAFE", text: "#1D4ED8", border: "#BFDBFE" };
      case "SHIPPED":
        return { label: "Dalam Pengiriman", bg: "#E0E7FF", text: "#4338CA", border: "#C7D2FE" };
      case "DELIVERED":
        return { label: "Paket Tiba", bg: "#D1FAE5", text: "#065F46", border: "#A7F3D0" };
      case "COMPLETED":
        return { label: "Selesai", bg: "#ECFDF5", text: "#047857", border: "#6EE7B7" };
      case "CANCELLED":
        return { label: "Dibatalkan", bg: "#FEE2E2", text: "#B91C1C", border: "#FECACA" };
      default:
        return { label: currentStatus, bg: theme.surface2, text: theme.ink, border: theme.border };
    }
  };

  const statusBadge = getStatusBadge();

  const handleWhatsApp = () => {
    if (!order.customerPhone || String(order.customerPhone) === "-") return;
    const cleanPhone = String(order.customerPhone).replace(/^0/, "62").replace(/[^0-9]/g, "");
    const text = encodeURIComponent(
      `Halo Kak ${order.customerName}, kami dari ${store?.name || "Toko"} mengenai pesanan ${order.id}.`
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
        aria-label="Detail Pesanan"
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
              title="Kembali"
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
              Detail Pesanan
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
                  {isOfflinePos ? "Status Pembayaran Kasir" : "Bukti Pembayaran"}
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
                <span>Pembayaran diterima langsung di kasir</span>
                <strong style={{ color: "#10B981" }}>LUNAS</strong>
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
                    alt="Bukti Transfer Pembeli"
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
                    <span>Perbesar</span>
                  </div>
                </div>
                <div style={{ fontSize: 11.5, color: theme.inkSoft, lineHeight: 1.4 }}>
                  ✓ Struk/screenshot telah dilampirkan oleh pembeli saat checkout.
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
                Pesanan tanpa bukti transfer digital (Tunai / Bayar saat ambil).
              </div>
            )}
          </div>

          {/* 3. DAFTAR BARANG BELANJA */}
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
                {isFoodStore ? "Rincian Menu Pesanan" : "Rincian Barang Belanja"}
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
                  <strong style={{ color: theme.ink }}>Catatan Khusus Pembeli:</strong>
                  <div style={{ marginTop: 2, color: theme.inkSoft }}>&ldquo;{order.customerNote}&rdquo;</div>
                </div>
              </div>
            )}
          </div>

          {/* 4. DATA PEMBELI & PENGIRIMAN */}
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
                    ? "Layanan & Pelanggan"
                    : isPickupOnline
                      ? `Ambil di ${entity} & Pelanggan`
                      : "Pengiriman & Pelanggan"}
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
                      ? "Takeaway (Kasir)"
                      : `Dine-In • ${order.tableOrQueueNumber}`
                    : "Transaksi Kasir"
                  : isPickupOnline
                    ? `Ambil di ${entity}`
                    : order.shippingMethod === "STORE_DELIVERY"
                      ? `Kurir ${entity}`
                      : order.shippingMethod === "REGULAR"
                        ? "Ekspedisi"
                        : "Kurir SERA"}
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
                    Kasir: {order.cashierName || "Store Owner"}
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
                  Alamat Tujuan Pengiriman:
                </div>
                <div>{order.shippingAddress}</div>
              </div>
            )}
          </div>

          {/* 5. RINCIAN BIAYA & TOTAL PEMBAYARAN */}
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
                Ringkasan Pembayaran
              </span>
            </div>

            {isOfflinePos ? (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: theme.inkSoft }}>
                <span>Metode Pembayaran</span>
                <span style={{ color: theme.ink, fontWeight: 600 }}>
                  {order.paymentMethod}
                </span>
              </div>
            ) : isPickupOnline ? (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: theme.inkSoft }}>
                <span>Pengambilan</span>
                <span style={{ color: theme.ink, fontWeight: 600 }}>
                  Ambil di {entity} (Rp 0)
                </span>
              </div>
            ) : (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: theme.inkSoft }}>
                <span>Ongkos Kirim {entity}</span>
                <span style={{ color: theme.ink, fontWeight: 600 }}>
                  {order.shippingCost && order.shippingCost > 0
                    ? `Rp ${order.shippingCost.toLocaleString("id-ID")}`
                    : "Gratis Ongkir"}
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
              <span style={{ color: theme.ink }}>Total Tagihan</span>
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
