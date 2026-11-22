import React, { useState } from "react";
import {
  Clock,
  Bike,
  Store,
  MapPin,
  Truck,
  CheckCircle2,
  X,
  Eye
} from "lucide-react";
import type { ThemeType } from "../../../../../theme";
import { type MerchantOrder, type MerchantStore, formatOrderDateTime } from "../../../types";
import { OrderItemsList } from "./OrderItemsList";
import { WhatsAppIcon } from "../../../../driver/queue/utils/deliveryIcons";

interface OrderActiveCardProps {
  order: MerchantOrder;
  theme: ThemeType;
  store: MerchantStore | null;
  isMobileView?: boolean;
  onUpdateOrderStatus: (orderId: string, nextStatus: MerchantOrder["status"]) => void;
  onRequestCourier?: (order: MerchantOrder) => void;
  onOpenDetail?: (order: MerchantOrder) => void;
}

export const OrderActiveCard: React.FC<OrderActiveCardProps> = ({
  order,
  theme,
  store,
  isMobileView,
  onUpdateOrderStatus,
  onRequestCourier,
  onOpenDetail
}) => {
  const [showProofModal, setShowProofModal] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);

  return (
    <div
      onClick={() => onOpenDetail && onOpenDetail(order)}
      style={{
        background: theme.surface,
        border: `1px solid ${theme.border}`,
        borderRadius: 14,
        padding: isMobileView ? 14 : 16,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
        cursor: onOpenDetail ? "pointer" : "default"
      }}
    >
      {/* Header Kartu: ID + Waktu (Kiri) & Metode Bayar + Pengiriman (Kanan) */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: `1px solid ${theme.border}`,
          paddingBottom: 10,
          gap: 8,
          flexWrap: "wrap"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              fontFamily: "monospace",
              color: theme.ink,
              letterSpacing: -0.2
            }}
          >
            {order.id}
          </span>
          <span style={{ fontSize: 11, color: theme.inkSoft }}>
            • {formatOrderDateTime(order.createdAt)}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {order.paymentProofUrl && (
            <button
              type="button"
              onClick={() => setShowProofModal(true)}
              title="Lihat Bukti Transfer Pembayaran"
              style={{
                padding: "2px 7px",
                borderRadius: 5,
                background: theme.isDark ? "rgba(16, 185, 129, 0.15)" : "#D1FAE5",
                fontSize: 10.5,
                fontWeight: 600,
                color: "#10B981",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 4
              }}
            >
              <Eye size={11} />
              <span>Bukti Bayar</span>
            </button>
          )}
          <span
            style={{
              padding: "2px 7px",
              borderRadius: 5,
              background: theme.surface2,
              fontSize: 10.5,
              fontWeight: 600,
              color: theme.ink,
              border: `1px solid ${theme.border}`
            }}
          >
            {order.paymentMethod}
          </span>
          <span
            style={{
              padding: "2px 7px",
              borderRadius: 5,
              background: theme.surface2,
              border: `1px solid ${theme.border}`,
              color: theme.inkSoft,
              fontSize: 10.5,
              fontWeight: 600
            }}
          >
            {order.shippingMethod === "PICKUP"
              ? `Ambil di ${store?.type === "FOOD" ? "Resto" : "Toko"}`
              : order.shippingMethod === "STORE_DELIVERY"
                ? `Kurir ${store?.type === "FOOD" ? "Resto" : "Toko"}`
                : order.shippingMethod === "REGULAR"
                  ? "Ekspedisi"
                  : "Kurir SERA"}
          </span>
        </div>
      </div>

      {/* Rincian Produk, Nama Pembeli (+ Icon WA), Alamat & Catatan */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 700, color: theme.ink }}>
            {order.customerName}
          </span>
          {order.customerPhone && String(order.customerPhone) !== "-" && (
            <button
              type="button"
              onClick={() => {
                const cleanPhone = String(order.customerPhone)
                  .replace(/^0/, "62")
                  .replace(/[^0-9]/g, "");
                const text = encodeURIComponent(
                  `Halo Kak ${order.customerName}, kami dari ${store?.name || "Toko"} mengonfirmasi pesanan ${order.id}.`
                );
                window.open(`https://wa.me/${cleanPhone}?text=${text}`, "_blank");
              }}
              title={`Chat WhatsApp ${order.customerName}`}
              style={{
                padding: "4px 6px",
                borderRadius: 6,
                background: theme.surface2,
                border: `1px solid ${theme.border}`,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <WhatsAppIcon size={14} color="#25D366" />
            </button>
          )}
        </div>

        <OrderItemsList
          itemsSummary={order.itemsSummary}
          fontSize={12.5}
          inkColor={theme.ink}
          inkSoftColor={theme.inkSoft}
        />

        {/* Catatan Pembeli (jika ada) */}
        {order.customerNote && (
          <div
            style={{
              marginTop: 2,
              background: theme.surface2,
              border: `1px solid ${theme.border}`,
              borderRadius: 8,
              padding: "6px 10px",
              fontSize: 11.5,
              color: theme.ink,
              lineHeight: 1.4
            }}
          >
            <span style={{ color: theme.inkSoft, fontWeight: 600 }}>Catatan: </span>
            <span>"{order.customerNote}"</span>
          </div>
        )}

        {/* Delivery Address if present */}
        {order.shippingAddress &&
          order.shippingAddress !== "-" &&
          order.shippingMethod !== "PICKUP" && (
            <div
              style={{
                fontSize: 11,
                color: theme.inkSoft,
                marginTop: 2,
                display: "flex",
                alignItems: "center",
                gap: 4
              }}
            >
              <MapPin size={11} color={theme.inkSoft} style={{ flexShrink: 0 }} />
              <span
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}
              >
                {order.shippingAddress}
              </span>
            </div>
          )}
      </div>

      {/* Footer Kartu: Total Harga & Tombol Aksi */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: 10,
          borderTop: `1px dashed ${theme.border}`,
          flexWrap: "wrap",
          gap: 10
        }}
      >
        <div>
          <div style={{ fontSize: 10, color: theme.inkSoft, textTransform: "uppercase" }}>
            Total Pembayaran
          </div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 800,
              color: theme.accent,
              marginTop: 2
            }}
          >
            Rp {(order.totalAmount || 0).toLocaleString("id-ID")}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          {(order.status === "PENDING" || order.status === "CONFIRMED") && (
            <button
              type="button"
              onClick={() => onUpdateOrderStatus(order.id, "PROCESSING")}
              style={{
                padding: "7px 14px",
                borderRadius: 8,
                background: theme.accent,
                color: "#FFFFFF",
                border: "none",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
              }}
            >
              <Clock size={13} />
              <span>Proses Pesanan</span>
            </button>
          )}

          {order.status === "PROCESSING" &&
            (order.shippingMethod === "PICKUP" ? (
              <button
                type="button"
                onClick={() => onUpdateOrderStatus(order.id, "COMPLETED")}
                style={{
                  padding: "7px 14px",
                  borderRadius: 8,
                  background: "#D97706",
                  color: "#FFFFFF",
                  border: "none",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                }}
              >
                <Store size={13} />
                <span>Siap Diambil Pembeli</span>
              </button>
            ) : order.courierStatus === "SEARCHING" ? (
              <div
                style={{
                  padding: "7px 14px",
                  borderRadius: 8,
                  background: "#3B82F615",
                  color: "#2563EB",
                  border: "1px solid #3B82F640",
                  fontSize: 12,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: 6
                }}
              >
                <Bike size={13} />
                <span>
                  {order.shippingMethod === "STORE_DELIVERY"
                    ? "Menugaskan Kurir Toko..."
                    : "Mencari Mitra Kurir..."}
                </span>
              </div>
            ) : order.courierStatus === "ACCEPTED" || order.courierStatus === "PICKING_UP" ? (
              <div
                style={{
                  padding: "7px 14px",
                  borderRadius: 8,
                  background: "#10B98115",
                  color: "#059669",
                  border: "1px solid #10B98140",
                  fontSize: 12,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: 6
                }}
              >
                <CheckCircle2 size={13} />
                <span>
                  Kurir Menuju Toko {order.courierName ? `(${order.courierName})` : ""}
                </span>
              </div>
            ) : order.courierStatus === "ON_THE_WAY" ? (
              <div
                style={{
                  padding: "7px 14px",
                  borderRadius: 8,
                  background: "#6366F115",
                  color: "#4F46E5",
                  border: "1px solid #6366F140",
                  fontSize: 12,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: 6
                }}
              >
                <Truck size={13} />
                <span>Kurir Mengantar ke Pembeli</span>
              </div>
            ) : (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <button
                  type="button"
                  disabled={isDispatching}
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (isDispatching) return;
                    setIsDispatching(true);
                    try {
                      if (onRequestCourier) await onRequestCourier(order);
                      else await onUpdateOrderStatus(order.id, "SHIPPED");
                    } finally {
                      setIsDispatching(false);
                    }
                  }}
                  style={{
                    padding: "7px 14px",
                    borderRadius: 8,
                    background:
                      order.shippingMethod === "STORE_DELIVERY" ? "#059669" : "#10B981",
                    color: "#FFFFFF",
                    border: "none",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: isDispatching ? "not-allowed" : "pointer",
                    opacity: isDispatching ? 0.7 : 1,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                  }}
                >
                  {isDispatching ? (
                    <span>Memanggil Kurir...</span>
                  ) : order.shippingMethod === "STORE_DELIVERY" ? (
                    <>
                      <Truck size={13} />
                      <span>Kirim via Kurir {store?.type === "FOOD" ? "Resto" : "Toko"}</span>
                    </>
                  ) : (
                    <>
                      <Bike size={13} />
                      <span>Panggil Mitra Kurir</span>
                    </>
                  )}
                </button>
                {order.shippingMethod === "STORE_DELIVERY" && (
                  <button
                    type="button"
                    disabled={isDispatching}
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateOrderStatus(order.id, "SHIPPED");
                    }}
                    title="Tandai pesanan sudah dikirim secara manual"
                    style={{
                      padding: "7px 10px",
                      borderRadius: 8,
                      background: theme.surface2,
                      color: theme.inkSoft,
                      border: `1px solid ${theme.border}`,
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: isDispatching ? "not-allowed" : "pointer",
                      opacity: isDispatching ? 0.6 : 1
                    }}
                  >
                    Manual
                  </button>
                )}
              </div>
            ))}
        </div>
      </div>

      {/* Lightbox Modal: Bukti Pembayaran */}
      {showProofModal && order.paymentProofUrl && (
        <div
          onClick={() => setShowProofModal(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.75)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            backdropFilter: "blur(4px)"
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: theme.surface,
              borderRadius: 16,
              border: `1px solid ${theme.border}`,
              maxWidth: 420,
              width: "100%",
              overflow: "hidden",
              boxShadow: "0 20px 40px rgba(0,0,0,0.35)",
              display: "flex",
              flexDirection: "column"
            }}
          >
            <div
              style={{
                padding: "12px 16px",
                borderBottom: `1px solid ${theme.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color: theme.ink }}>
                Bukti Pembayaran • {order.id}
              </div>
              <button
                type="button"
                onClick={() => setShowProofModal(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: theme.inkSoft,
                  padding: 4,
                  display: "flex"
                }}
              >
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: 16, display: "flex", justifyContent: "center", background: theme.surface2 }}>
              <img
                src={order.paymentProofUrl}
                alt={`Bukti Transfer ${order.id}`}
                style={{
                  maxWidth: "100%",
                  maxHeight: "65vh",
                  borderRadius: 10,
                  objectFit: "contain",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
