import { useState, useMemo } from "react";
import { Check } from "lucide-react";
import type { ThemeType } from "../../theme";
import type { DriverProfile, DeliveryStop } from "./types";

interface StoreCourierSettlementViewProps {
  theme: ThemeType;
  driver: DriverProfile;
  isMobileView?: boolean;
  onClose?: () => void;
}

export function StoreCourierSettlementView({
  theme,
  driver,
  isMobileView,
  onClose: _onClose
}: StoreCourierSettlementViewProps) {
  const [isSettled, setIsSettled] = useState(false);

  // Load delivery queue history
  const queueStorageKey = `sera_driver_queue_${driver.id || "me"}`;
  const [deliveryQueue] = useState<DeliveryStop[]>(() => {
    try {
      const saved = localStorage.getItem(queueStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const DUMMY_STOPS = new Set(["STP-01", "STP-02", "STP-03", "ORD-9912", "ORD-9915", "ORD-9920"]);
          return parsed.filter(s => !DUMMY_STOPS.has(s.id) && !DUMMY_STOPS.has(s.orderId));
        }
      }
    } catch {}
    return [];
  });

  // Calculate COD cash in hand from completed stops
  const completedStops = useMemo(() => {
    return deliveryQueue.filter(s => s.status === "COMPLETED");
  }, [deliveryQueue]);

  const codStops = useMemo(() => {
    return completedStops.filter(s => s.isCod);
  }, [completedStops]);

  const totalCodInHand = useMemo(() => {
    if (isSettled) return 0;
    return codStops.reduce((sum, s) => sum + (s.codAmount || 0), 0);
  }, [codStops, isSettled]);

  const handleConfirmSetoran = () => {
    setIsSettled(true);
    const storageKey = `sera_driver_settled_${driver.id || "me"}`;
    localStorage.setItem(storageKey, Date.now().toString());
  };

  const handleOpenStoreChat = () => {
    const storePhone = driver.linkedStorePhone || "08123456789";
    const cleanPhone = storePhone.replace(/^0/, "62").replace(/[^0-9]/g, "");
    const text = encodeURIComponent(
      `Halo Kasir ${driver.linkedStoreName || "Toko"}, saya ${driver.name} (Kurir Toko). Saya ingin koordinasi terkait setoran tunai COD hari ini.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, "_blank");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* 1. HERO CARD: TOTAL KAS COD & SETORAN */}
      <div
        style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: 14,
          padding: isMobileView ? "18px 16px" : "22px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
          boxShadow: "0 1px 3px rgba(0,0,0,0.03)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span
            style={{
              fontSize: 11.5,
              fontWeight: 700,
              color: theme.inkSoft,
              textTransform: "uppercase",
              letterSpacing: 0.5
            }}
          >
            Kas COD Wajib Disetor
          </span>
          <span
            style={{
              padding: "3px 9px",
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 600,
              background: totalCodInHand > 0
                ? (theme.isDark ? "rgba(245, 158, 11, 0.12)" : "#FEF3C7")
                : (theme.isDark ? "rgba(16, 185, 129, 0.12)" : "#ECFDF5"),
              color: totalCodInHand > 0
                ? (theme.isDark ? "#FBBF24" : "#B45309")
                : (theme.isDark ? "#34D399" : "#059669"),
              border: `1px solid ${totalCodInHand > 0
                ? (theme.isDark ? "rgba(245, 158, 11, 0.25)" : "#FDE68A")
                : (theme.isDark ? "rgba(16, 185, 129, 0.25)" : "#A7F3D0")}`
            }}
          >
            {totalCodInHand > 0 ? "Belum Disetor" : "Semua Beres"}
          </span>
        </div>

        <div
          style={{
            fontSize: isMobileView ? 28 : 34,
            fontWeight: 800,
            color: theme.ink,
            lineHeight: 1.1
          }}
        >
          Rp {totalCodInHand.toLocaleString("id-ID")}
        </div>

        <div style={{ fontSize: 12, color: theme.inkSoft }}>
          {totalCodInHand > 0
            ? `Terkumpul dari ${codStops.length} pesanan COD. Silakan serahkan uang tunai ke kasir toko.`
            : "Tidak ada setoran kas yang tertunda. Semua pembayaran telah diselesaikan."}
        </div>

        {totalCodInHand > 0 ? (
          <button
            type="button"
            onClick={handleConfirmSetoran}
            style={{
              marginTop: 4,
              padding: "12px 18px",
              borderRadius: 10,
              border: "none",
              background: "#10B981",
              color: "#FFFFFF",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.12)",
              transition: "filter 0.15s ease"
            }}
          >
            <Check size={16} />
            <span>Tandai Sudah Disetor ke Kasir</span>
          </button>
        ) : (
          <div
            style={{
              marginTop: 4,
              padding: "10px 14px",
              borderRadius: 8,
              background: theme.surface2,
              fontSize: 12,
              color: theme.inkSoft,
              display: "flex",
              alignItems: "center",
              gap: 8
            }}
          >
            <Check size={14} color="#10B981" />
            <span>Setoran kas hari ini sudah tercatat diserahkan ke kasir.</span>
          </div>
        )}
      </div>

      {/* 2. STORE CASHIER COORDINATION ROW */}
      <div
        style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: 12,
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: theme.ink }}>
            {driver.linkedStoreName || "Toko Mitra SERA"}
          </div>
          <div style={{ fontSize: 11.5, color: theme.inkSoft, marginTop: 1 }}>
            Kasir Toko • {driver.linkedStorePhone || "0812-3456-7890"}
          </div>
        </div>
        <button
          type="button"
          onClick={handleOpenStoreChat}
          style={{
            padding: "7px 12px",
            borderRadius: 8,
            border: `1px solid ${theme.border}`,
            background: theme.surface2,
            color: theme.ink,
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            flexShrink: 0
          }}
        >
          Chat Kasir
        </button>
      </div>

      {/* 3. COMPLETED STOPS HISTORY LIST */}
      <div
        style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: 14,
          padding: isMobileView ? "16px 14px" : "18px 18px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          boxShadow: "0 1px 3px rgba(0,0,0,0.03)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 6 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: theme.ink }}>
            Rincian Antaran Selesai
          </div>
          <span style={{ fontSize: 11.5, color: theme.inkSoft }}>
            {completedStops.length} Pesanan
          </span>
        </div>

        {completedStops.length === 0 ? (
          <div
            style={{
              padding: "20px 14px",
              textAlign: "center",
              background: theme.surface2,
              borderRadius: 8,
              color: theme.inkSoft,
              fontSize: 12
            }}
          >
            Belum ada antaran yang selesai diserahkan hari ini.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {completedStops.map(stop => (
              <div
                key={stop.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 12px",
                  borderRadius: 8,
                  background: theme.surface2,
                  border: `1px solid ${theme.border}`,
                  gap: 10
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      fontSize: 12.5,
                      fontWeight: 700,
                      color: theme.ink,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap"
                    }}
                  >
                    {stop.orderId} • {stop.customerName}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: theme.inkSoft,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      marginTop: 1
                    }}
                  >
                    {stop.destAddress}
                  </div>
                </div>

                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: theme.ink }}>
                    {stop.isCod ? `Rp ${stop.codAmount.toLocaleString("id-ID")}` : "Non-COD"}
                  </div>
                  <div style={{ fontSize: 10.5, color: theme.inkSoft, marginTop: 1 }}>
                    {stop.completedAt || (stop.isCod ? "Tunai" : "Lunas")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
