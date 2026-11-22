import React from "react";
import { Bike, Car, Check, CheckCircle2, Clock } from "lucide-react";
import type { ThemeType } from "../../../../../theme";
import type { MerchantOrder, StoreLinkedCourier } from "../../../types";
import { OrderItemsList } from "./OrderItemsList";

interface OrderCourierManifestProps {
  theme: ThemeType;
  couriersList: StoreLinkedCourier[];
  shippedOrders: MerchantOrder[];
  isMobileView?: boolean;
  settlementSuccessMsg: string | null;
  onReconcileCourier: (
    courierId: string,
    courierName: string,
    codAmount: number,
    ordersToSettle: MerchantOrder[]
  ) => void;
}

export const OrderCourierManifest: React.FC<OrderCourierManifestProps> = ({
  theme,
  couriersList,
  shippedOrders,
  isMobileView,
  settlementSuccessMsg,
  onReconcileCourier
}) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Banner Notifikasi Konfirmasi Sukses */}
      {settlementSuccessMsg && (
        <div
          style={{
            background: theme.isDark ? "rgba(16, 185, 129, 0.12)" : "#ECFDF5",
            border: `1px solid ${theme.isDark ? "rgba(16, 185, 129, 0.28)" : "#A7F3D0"}`,
            color: theme.isDark ? "#34D399" : "#065F46",
            padding: "10px 14px",
            borderRadius: 10,
            fontSize: 12.5,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 8
          }}
        >
          <CheckCircle2 size={16} color={theme.isDark ? "#34D399" : "#10B981"} />
          <span>{settlementSuccessMsg}</span>
        </div>
      )}

      {/* DAFTAR KURIR DENGAN DATA MANIFEST PESANAN & REKONSILIASI KAS */}
      {shippedOrders.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "36px 16px",
            background: theme.surface,
            borderRadius: 14,
            border: `1px solid ${theme.border}`,
            color: theme.inkSoft,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8
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
              color: theme.accent
            }}
          >
            <Bike size={22} />
          </div>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: theme.ink }}>
            Tidak Ada Pengantaran Aktif
          </div>
          <div style={{ fontSize: 12, maxWidth: 360, lineHeight: 1.4 }}>
            Pesanan yang sedang dikirim via kurir akan tampil di sini menunggu kurir menyelesaikan pengantaran.
          </div>
        </div>
      ) : couriersList.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {shippedOrders.map((order) => {
            const isDelivered = order.status === "DELIVERED";
            return (
              <div
                key={order.id}
                style={{
                  background: theme.surface,
                  border: `1px solid ${theme.border}`,
                  borderRadius: 14,
                  padding: isMobileView ? "14px" : "16px",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5, color: theme.ink }}>
                    {order.customerName}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span
                      style={{
                        fontSize: 10.5,
                        fontWeight: 700,
                        padding: "2px 7px",
                        borderRadius: 6,
                        background: isDelivered
                          ? theme.isDark ? "#064E3B" : "#ECFDF5"
                          : theme.isDark ? "#1E3A8A" : "#EFF6FF",
                        color: isDelivered ? "#10B981" : "#3B82F6"
                      }}
                    >
                      {isDelivered ? "Paket Tiba di Tujuan" : "Sedang Diantar Kurir"}
                    </span>
                    <span
                      style={{
                        fontSize: 10.5,
                        fontWeight: 700,
                        padding: "2px 7px",
                        borderRadius: 6,
                        background: theme.surface2,
                        border: `1px solid ${theme.border}`,
                        color: theme.ink
                      }}
                    >
                      {order.paymentMethod}
                    </span>
                  </div>
                </div>

                <OrderItemsList
                  itemsSummary={order.itemsSummary}
                  fontSize={12}
                  inkColor={theme.ink}
                  inkSoftColor={theme.inkSoft}
                />

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingTop: 8,
                    borderTop: `1px dashed ${theme.border}`
                  }}
                >
                  <div>
                    <div style={{ fontSize: 11, fontFamily: "monospace", color: theme.inkSoft }}>
                      {order.id}
                    </div>
                    <div style={{ fontWeight: 800, fontSize: 14, color: theme.accent }}>
                      Rp {(order.totalAmount || 0).toLocaleString("id-ID")}
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={!isDelivered}
                    onClick={() => {
                      if (!isDelivered) return;
                      onReconcileCourier("mitra", "Mitra Kurir", 0, [order]);
                    }}
                    style={{
                      padding: "7px 14px",
                      borderRadius: 8,
                      background: isDelivered ? "#059669" : theme.surface2,
                      color: isDelivered ? "#FFFFFF" : theme.inkSoft,
                      border: isDelivered ? "none" : `1px solid ${theme.border}`,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: isDelivered ? "pointer" : "not-allowed",
                      opacity: isDelivered ? 1 : 0.7,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      boxShadow: isDelivered ? "0 1px 3px rgba(0,0,0,0.1)" : "none"
                    }}
                  >
                    {isDelivered ? (
                      <>
                        <Check size={13} strokeWidth={2.5} color="#FFFFFF" />
                        <span>Selesaikan Pesanan</span>
                      </>
                    ) : (
                      <>
                        <Clock size={13} />
                        <span>Menunggu Kurir Selesai...</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {couriersList.map((courier: StoreLinkedCourier, idx: number) => {
            const courierId = courier.id || `courier-${idx}`;

            // Cari seluruh pesanan yang sedang diantar kurir ini dan belum direkonsiliasi toko
            const courierOrdersList =
              couriersList.length === 1
                ? shippedOrders
                : shippedOrders.filter(
                    (o) =>
                      !o.courierName ||
                      o.courierName.toLowerCase() === courier.name.toLowerCase() ||
                      o.courierPhone === courier.phone
                  );

            const codOrders = courierOrdersList.filter((o) => o.paymentMethod === "COD");
            const codTotal = codOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
            const isAllDelivered =
              courierOrdersList.length > 0 &&
              courierOrdersList.every((o) => o.status === "DELIVERED");

            return (
              <div
                key={courierId}
                style={{
                  background: theme.surface,
                  border: `1px solid ${theme.border}`,
                  borderRadius: 14,
                  padding: isMobileView ? "14px" : "16px",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12
                }}
              >
                {/* Header Kurir Minimalis */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        background: theme.surface2,
                        border: `1px solid ${theme.border}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: theme.accent
                      }}
                    >
                      {courier.vehicleType === "MOBIL" || courier.vehicleType === "PICKUP" ? (
                        <Car size={18} />
                      ) : (
                        <Bike size={18} />
                      )}
                    </div>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: theme.ink }}>
                        {courier.name}
                      </div>
                      <div style={{ fontSize: 11, color: theme.inkSoft, marginTop: 1 }}>
                        {courierOrdersList.length} pesanan dikirim
                      </div>
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: 10.5,
                      background: theme.isDark
                        ? (courierOrdersList.length > 0 ? "rgba(59, 130, 246, 0.18)" : "rgba(16, 185, 129, 0.18)")
                        : (courierOrdersList.length > 0 ? "#EFF6FF" : "#ECFDF5"),
                      color: theme.isDark
                        ? (courierOrdersList.length > 0 ? "#60A5FA" : "#34D399")
                        : (courierOrdersList.length > 0 ? "#1E40AF" : "#065F46"),
                      border: theme.isDark
                        ? `1px solid ${courierOrdersList.length > 0 ? "rgba(59, 130, 246, 0.3)" : "rgba(16, 185, 129, 0.3)"}`
                        : "none",
                      padding: "3px 8px",
                      borderRadius: 6,
                      fontWeight: 700
                    }}
                  >
                    {courierOrdersList.length > 0 ? "Dikirim" : "Siap"}
                  </span>
                </div>

                {/* Rincian Pesanan Dibawa */}
                {courierOrdersList.length === 0 ? (
                  <div
                    style={{
                      padding: "14px",
                      background: theme.surface2,
                      borderRadius: 8,
                      border: `1px solid ${theme.border}`,
                      textAlign: "center",
                      fontSize: 12,
                      color: theme.inkSoft
                    }}
                  >
                    Tidak ada pengantaran aktif.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {courierOrdersList.map((order) => (
                      <div
                        key={order.id}
                        style={{
                          padding: "10px 12px",
                          background: theme.surface2,
                          borderRadius: 8,
                          border: `1px solid ${theme.border}`,
                          display: "flex",
                          flexDirection: "column",
                          gap: 6
                        }}
                      >
                        {/* Baris Atas: Nama Pembeli (Kiri) & Label Metode Bayar (Kanan) */}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                          }}
                        >
                          <div style={{ fontWeight: 700, fontSize: 13, color: theme.ink }}>
                            {order.customerName}
                          </div>
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              padding: "2px 7px",
                              borderRadius: 4,
                              background: theme.surface2,
                              border: `1px solid ${theme.border}`,
                              color: theme.ink
                            }}
                          >
                            {order.paymentMethod}
                          </span>
                        </div>

                        {/* Baris Tengah: Rincian Produk */}
                        <OrderItemsList
                          itemsSummary={order.itemsSummary}
                          fontSize={12}
                          inkColor={theme.ink}
                          inkSoftColor={theme.inkSoft}
                        />

                        {/* Baris Bawah: ID Pesanan (Kiri) & Nominal (Kanan) */}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            paddingTop: 4,
                            borderTop: `1px dashed ${theme.border}`
                          }}
                        >
                          <div
                            style={{
                              fontSize: 11,
                              fontFamily: "monospace",
                              color: theme.inkSoft,
                              fontWeight: 600
                            }}
                          >
                            {order.id}
                          </div>
                          <div
                            style={{
                              fontWeight: 800,
                              fontSize: 14,
                              color: theme.accent
                            }}
                          >
                            Rp {(order.totalAmount || 0).toLocaleString("id-ID")}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Section Rekonsiliasi & Setoran Kas COD */}
                {courierOrdersList.length > 0 && (
                  <div
                    style={{
                      background: theme.surface,
                      borderRadius: 8,
                      padding: "10px 12px",
                      border: `1px solid ${theme.border}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: 10
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 10.5,
                          color: theme.inkSoft,
                          fontWeight: 600
                        }}
                      >
                        Kas COD
                      </div>
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 800,
                          color: codTotal > 0 ? theme.accent : theme.ink
                        }}
                      >
                        Rp {codTotal.toLocaleString("id-ID")}
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={!isAllDelivered}
                      onClick={() => {
                        if (!isAllDelivered) return;
                        onReconcileCourier(
                          courierId,
                          courier.name,
                          codTotal,
                          courierOrdersList
                        );
                      }}
                      style={{
                        padding: "8px 14px",
                        borderRadius: 8,
                        background: isAllDelivered ? "#059669" : theme.surface2,
                        color: isAllDelivered ? "#FFFFFF" : theme.inkSoft,
                        border: isAllDelivered ? "none" : `1.5px solid ${theme.border}`,
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: isAllDelivered ? "pointer" : "not-allowed",
                        opacity: isAllDelivered ? 1 : 0.7,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        boxShadow: isAllDelivered ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                        transition: "all 0.15s ease"
                      }}
                      onMouseEnter={(e) => {
                        if (isAllDelivered) {
                          (e.currentTarget as HTMLElement).style.opacity = "0.9";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (isAllDelivered) {
                          (e.currentTarget as HTMLElement).style.opacity = "1";
                        }
                      }}
                    >
                      {isAllDelivered ? (
                        <>
                          <Check size={14} strokeWidth={2.5} color="#FFFFFF" />
                          <span>
                            {codTotal > 0 ? "Terima Kas & Selesaikan" : "Selesaikan Pesanan"}
                          </span>
                        </>
                      ) : (
                        <>
                          <Clock size={14} />
                          <span>Menunggu Kurir Selesai...</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

