import { Briefcase, Calculator, ChevronLeft as CloseIcon, Package, ShoppingBag, Store, UtensilsCrossed } from "lucide-react";
import type { ThemeType } from "../../../theme";
import { type MerchantStore, type MerchantViewType, getStoreEntityLabel, isStoreCurrentlyOpen } from "../types";

interface MerchantHeaderProps {
  theme: ThemeType;
  onBack: () => void;
  store: MerchantStore | null;
  onToggleOpenStatus: () => void;
  isMobileView?: boolean;
  currentView: MerchantViewType;
  setCurrentView: (v: MerchantViewType) => void;
  orderCount: number;
  onOpenProfileEditor: () => void;
}

export function MerchantHeader({
  theme,
  onBack,
  store,
  onToggleOpenStatus,
  isMobileView,
  currentView,
  setCurrentView,
  orderCount,
  onOpenProfileEditor
}: MerchantHeaderProps) {
  return (
    <div style={{
      background: theme.surface,
      borderBottom: "none",
      position: "sticky",
      top: 0,
      zIndex: 10,
      display: "flex",
      flexDirection: "column"
    }}>
      {/* Top Header Row */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: isMobileView ? "10px 14px 8px" : "12px 18px 8px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <button
            onClick={onBack}
            title="Kembali ke Dashboard Utama"
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: theme.inkSoft,
              padding: 4,
              display: "flex",
              borderRadius: 6
            }}
          >
            <CloseIcon size={20} />
          </button>
          <span style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 700,
            fontSize: isMobileView ? 15 : 16,
            color: theme.ink,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
          }}>
            {store?.name || "Mitra Store"}
          </span>
        </div>

        {store && (() => {
          const status = isStoreCurrentlyOpen(store);
          const isOpen = status.isOpen;
          const isManual = status.isManualOverride;

          const dotColor = isOpen
            ? (theme.status || "#10B981")
            : isManual
              ? "#F59E0B"
              : theme.inkFaint;

          const tooltip = isOpen
            ? `${status.statusDescription}. Klik untuk tutup sementara.`
            : isManual
              ? `${status.statusDescription}. Klik untuk kembali buka sesuai jadwal.`
              : `${status.statusDescription}. Klik untuk buka sementara.`;

          const displayLabel = isManual
            ? (isOpen ? "Buka (Manual)" : "Tutup Sementara")
            : (isOpen ? "Buka" : "Tutup");

          return (
            <button
              type="button"
              onClick={onToggleOpenStatus}
              title={tooltip}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 10px",
                borderRadius: 20,
                background: theme.surface2,
                color: isOpen ? theme.ink : theme.inkSoft,
                border: `1px solid ${theme.border}`,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                flexShrink: 0,
                transition: "all 0.15s ease"
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = theme.inkSoft;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = theme.border;
              }}
            >
              <span style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: dotColor,
                transition: "background 0.15s ease"
              }} />
              <span style={{
                color: isOpen ? theme.ink : theme.inkSoft,
                fontWeight: isOpen ? 700 : 500
              }}>
                {displayLabel}
              </span>
            </button>
          );
        })()}
      </div>

      {/* 5 Circular Category Navigation Icons */}
      <div style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 4,
        padding: isMobileView ? "12px 8px 12px" : "16px 20px 16px",
        background: theme.surface,
        borderTop: `1px solid ${theme.border}`,
        width: "100%",
        boxSizing: "border-box"
      }}>
        {/* 1. INFO TOKO */}
        <button
          type="button"
          onClick={() => {
            onOpenProfileEditor();
            setCurrentView("profile");
          }}
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 5,
            padding: 0,
            minWidth: 0,
            transition: "transform 0.15s ease"
          }}
        >
          <div style={{
            position: "relative",
            width: isMobileView ? 44 : 50,
            height: isMobileView ? 44 : 50,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: theme.surface2,
            border: `1px solid ${theme.border}`,
            color: currentView === "profile" ? theme.ink : theme.inkSoft,
            boxShadow: "none",
            transition: "all 0.15s ease"
          }}>
            <Store size={isMobileView ? 21 : 23} />
          </div>
          <span style={{
            fontSize: isMobileView ? 12 : 13,
            fontWeight: currentView === "profile" ? 700 : 500,
            color: currentView === "profile" ? theme.ink : theme.inkSoft,
            textAlign: "center",
            lineHeight: 1.2,
            whiteSpace: "nowrap",
            transition: "color 0.15s ease"
          }}>
            Info {getStoreEntityLabel(store?.type)}
          </span>
        </button>

        {/* 2. PRODUK */}
        <button
          type="button"
          onClick={() => setCurrentView("products")}
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 5,
            padding: 0,
            minWidth: 0,
            transition: "transform 0.15s ease"
          }}
        >
          <div style={{
            position: "relative",
            width: isMobileView ? 44 : 50,
            height: isMobileView ? 44 : 50,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: theme.surface2,
            border: `1px solid ${theme.border}`,
            color: currentView === "products" ? theme.ink : theme.inkSoft,
            boxShadow: "none",
            transition: "all 0.15s ease"
          }}>
            {store?.type === "FOOD" ? (
              <UtensilsCrossed size={isMobileView ? 21 : 23} />
            ) : store?.type === "JASA" ? (
              <Briefcase size={isMobileView ? 21 : 23} />
            ) : (
              <Package size={isMobileView ? 21 : 23} />
            )}
          </div>
          <span style={{
            fontSize: isMobileView ? 12 : 13,
            fontWeight: currentView === "products" ? 700 : 500,
            color: currentView === "products" ? theme.ink : theme.inkSoft,
            textAlign: "center",
            lineHeight: 1.2,
            whiteSpace: "nowrap",
            transition: "color 0.15s ease"
          }}>
            {store?.type === "FOOD" ? "Menu" : store?.type === "JASA" ? "Layanan" : "Produk"}
          </span>
        </button>

        {/* 3. KASIR (POS) */}
        <button
          type="button"
          onClick={() => setCurrentView("pos")}
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 5,
            padding: 0,
            minWidth: 0,
            transition: "transform 0.15s ease"
          }}
        >
          <div style={{
            position: "relative",
            width: isMobileView ? 44 : 50,
            height: isMobileView ? 44 : 50,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: theme.surface2,
            border: `1px solid ${theme.border}`,
            color: currentView === "pos" ? theme.ink : theme.inkSoft,
            boxShadow: "none",
            transition: "all 0.15s ease"
          }}>
            <Calculator size={isMobileView ? 21 : 23} />
          </div>
          <span style={{
            fontSize: isMobileView ? 12 : 13,
            fontWeight: currentView === "pos" ? 700 : 500,
            color: currentView === "pos" ? theme.ink : theme.inkSoft,
            textAlign: "center",
            lineHeight: 1.2,
            whiteSpace: "nowrap",
            transition: "color 0.15s ease"
          }}>
            Kasir
          </span>
        </button>

        {/* 4. PENJUALAN */}
        <button
          type="button"
          onClick={() => setCurrentView("orders")}
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 5,
            padding: 0,
            minWidth: 0,
            transition: "transform 0.15s ease"
          }}
        >
          <div style={{
            position: "relative",
            width: isMobileView ? 44 : 50,
            height: isMobileView ? 44 : 50,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: theme.surface2,
            border: `1px solid ${theme.border}`,
            color: currentView === "orders" ? theme.ink : theme.inkSoft,
            boxShadow: "none",
            transition: "all 0.15s ease"
          }}>
            <ShoppingBag size={isMobileView ? 21 : 23} />
            {orderCount > 0 && (
              <span style={{
                position: "absolute",
                top: -2,
                right: -2,
                minWidth: 17,
                height: 17,
                borderRadius: 9,
                background: "#EF4444",
                color: "#FFFFFF",
                fontSize: 9.5,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 3px",
                boxSizing: "border-box"
              }}>
                {orderCount}
              </span>
            )}
          </div>
          <span style={{
            fontSize: isMobileView ? 12 : 13,
            fontWeight: currentView === "orders" ? 700 : 500,
            color: currentView === "orders" ? theme.ink : theme.inkSoft,
            textAlign: "center",
            lineHeight: 1.2,
            whiteSpace: "nowrap",
            transition: "color 0.15s ease"
          }}>
            Penjualan
          </span>
        </button>
      </div>
    </div>
  );
}
