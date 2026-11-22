import React from "react";
import { MapPin, Store } from "lucide-react";
import type { ThemeType } from "../../../../../theme";
import { type MerchantOrder, formatOrderDateTime } from "../../../types";
import { OrderItemsList } from "./OrderItemsList";
import { isPosOrder } from "../../../utils/posOrderMapper";

interface OrderCompletedCardProps {
  order: MerchantOrder;
  theme: ThemeType;
  isMobileView?: boolean;
  onOpenDetail?: (order: MerchantOrder) => void;
}

export const OrderCompletedCard: React.FC<OrderCompletedCardProps> = ({
  order,
  theme,
  isMobileView,
  onOpenDetail
}) => {
  const isOfflinePos = isPosOrder(order);

  return (
    <div
      onClick={() => onOpenDetail && onOpenDetail(order)}
      style={{
        background: theme.surface,
        border: `1px solid ${theme.border}`,
        borderRadius: 14,
        padding: isMobileView ? "12px 14px" : "14px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
        cursor: onOpenDetail ? "pointer" : "default",
        transition: "transform 0.1s ease, border-color 0.15s ease"
      }}
    >
      {/* Baris Atas: Nama Pembeli + Sumber (Kiri) & Metode Bayar + Nominal (Kanan) */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: isMobileView ? "flex-start" : "center",
          gap: 10
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: isMobileView ? "column" : "row",
            alignItems: isMobileView ? "flex-start" : "center",
            gap: isMobileView ? 4 : 6,
            minWidth: 0,
            flex: 1,
            flexWrap: isMobileView ? "nowrap" : "wrap"
          }}
        >
          <span style={{ fontWeight: 700, fontSize: 13.5, color: theme.ink }}>
            {order.customerName}
          </span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              padding: "2px 6px",
              borderRadius: 999,
              background: isOfflinePos ? "rgba(245, 158, 11, 0.14)" : `${theme.accent}14`,
              color: isOfflinePos ? "#D97706" : theme.accent,
              border: `1px solid ${isOfflinePos ? "rgba(245, 158, 11, 0.3)" : `${theme.accent}28`}`,
              whiteSpace: "nowrap"
            }}
          >
            {isOfflinePos
              ? order.tableOrQueueNumber
                ? `POS • ${order.tableOrQueueNumber}`
                : "Offline POS"
              : "Online"}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: isMobileView ? "column" : "row",
            alignItems: isMobileView ? "flex-end" : "center",
            gap: isMobileView ? 4 : 8,
            flexShrink: 0
          }}
        >
          <span
            style={{
              fontSize: 10.5,
              fontWeight: 700,
              padding: "2px 7px",
              borderRadius: 4,
              background: theme.surface2,
              border: `1px solid ${theme.border}`,
              color: theme.ink,
              whiteSpace: "nowrap"
            }}
          >
            {order.paymentMethod}
          </span>
          <span
            style={{
              fontWeight: 800,
              fontSize: 14.5,
              color: theme.accent,
              whiteSpace: "nowrap"
            }}
          >
            Rp {(order.totalAmount || 0).toLocaleString("id-ID")}
          </span>
        </div>
      </div>

      {/* Baris Tengah: Rincian Produk */}
      <div style={{ marginTop: 4 }}>
        <OrderItemsList
          itemsSummary={order.itemsSummary}
          fontSize={12.5}
          inkColor={theme.ink}
          inkSoftColor={theme.inkSoft}
        />
      </div>

      {/* Baris Bawah: ID Pesanan, Waktu & Alamat Pengantaran */}
      <div
        style={{
          paddingTop: 8,
          marginTop: 4,
          borderTop: `1px dashed ${theme.border}`,
          display: "flex",
          flexDirection: "column",
          gap: 1.5
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: theme.inkSoft,
            display: "flex",
            alignItems: "center",
            gap: 6
          }}
        >
          <span style={{ fontFamily: "monospace", fontWeight: 600 }}>
            {order.id}
          </span>
          <span>•</span>
          <span style={{ fontSize: 10.5 }}>
            {formatOrderDateTime(order.createdAt)}
          </span>
          {isOfflinePos && order.cashierName && (
            <>
              <span>•</span>
              <span style={{ fontSize: 10.5, display: "inline-flex", alignItems: "center", gap: 3 }}>
                <Store size={10} />
                {order.cashierName}
              </span>
            </>
          )}
        </div>
        {order.shippingAddress && order.shippingAddress !== "-" && (
          <div
            style={{
              fontSize: 10.5,
              color: theme.inkSoft,
              display: "flex",
              alignItems: "center",
              gap: 3.5,
              marginTop: 1
            }}
          >
            <MapPin size={10.5} color={theme.inkSoft} style={{ flexShrink: 0 }} />
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
    </div>
  );
};

