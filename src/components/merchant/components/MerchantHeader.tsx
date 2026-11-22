import { useState } from "react";
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
  const [hoveredNav, setHoveredNav] = useState<MerchantViewType | null>(null);
  const [isBackHovered, setIsBackHovered] = useState(false);
  const [isStatusHovered, setIsStatusHovered] = useState(false);

  const ProductIcon = store?.type === "FOOD"
    ? UtensilsCrossed
    : store?.type === "JASA"
      ? Briefcase
      : Package;

  const productLabel = store?.type === "FOOD"
    ? "Menu"
    : store?.type === "JASA"
      ? "Services"
      : "Products";

  const navItems: Array<{
    id: MerchantViewType;
    label: string;
    Icon: typeof Store;
    onClick: () => void;
    badgeCount?: number;
  }> = [
    {
      id: "profile",
      label: `${getStoreEntityLabel(store?.type)} Info`,
      Icon: Store,
      onClick: () => {
        onOpenProfileEditor();
        setCurrentView("profile");
      }
    },
    {
      id: "products",
      label: productLabel,
      Icon: ProductIcon,
      onClick: () => setCurrentView("products")
    },
    {
      id: "pos",
      label: "POS",
      Icon: Calculator,
      onClick: () => setCurrentView("pos")
    },
    {
      id: "orders",
      label: "Sales",
      Icon: ShoppingBag,
      onClick: () => setCurrentView("orders"),
      badgeCount: orderCount
    }
  ];

  const renderStatusPill = () => {
    if (!store) return null;
    const status = isStoreCurrentlyOpen(store);
    const isOpen = status.isOpen;
    const isManual = status.isManualOverride;

    const dotColor = isOpen
      ? (theme.status || "#10B981")
      : isManual
        ? "#F59E0B"
        : theme.inkFaint;

    const tooltip = isOpen
      ? `${status.statusDescription}. Click to temporarily close.`
      : isManual
        ? `${status.statusDescription}. Click to resume scheduled hours.`
        : `${status.statusDescription}. Click to open temporarily.`;

    const displayLabel = isManual
      ? (isOpen ? "Open (Manual)" : "Temporarily Closed")
      : (isOpen ? "Open" : "Closed");

    return (
      <button
        type="button"
        onClick={onToggleOpenStatus}
        title={tooltip}
        onMouseEnter={() => setIsStatusHovered(true)}
        onMouseLeave={() => setIsStatusHovered(false)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "4px 10px",
          borderRadius: 20,
          background: theme.surface2,
          color: isOpen ? theme.ink : theme.inkSoft,
          border: `1px solid ${isStatusHovered ? theme.inkSoft : theme.border}`,
          fontSize: 12,
          fontWeight: 600,
          cursor: "pointer",
          flexShrink: 0,
          whiteSpace: "nowrap",
          transition: "all 0.15s ease"
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
  };

  // Desktop single-row header: Back (left), centered nav tabs, Open/Closed status (right)
  if (!isMobileView) {
    return (
      <div style={{
        background: theme.surface,
        borderBottom: `1px solid ${theme.border}`,
        position: "sticky",
        top: 0,
        zIndex: 10,
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 18px",
        width: "100%",
        boxSizing: "border-box",
        flexShrink: 0
      }}>
        <div style={{
          flex: "1 1 0",
          minWidth: "fit-content",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start"
        }}>
          <button
            type="button"
            onClick={onBack}
            title="Back to Main Dashboard"
            aria-label="Back to Main Dashboard"
            onMouseEnter={() => setIsBackHovered(true)}
            onMouseLeave={() => setIsBackHovered(false)}
            style={{
              background: isBackHovered ? theme.surface2 : "transparent",
              border: "none",
              cursor: "pointer",
              color: isBackHovered ? theme.ink : theme.inkSoft,
              width: 34,
              height: 34,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 8,
              flexShrink: 0,
              transition: "all 0.15s ease"
            }}
          >
            <CloseIcon size={20} />
          </button>
        </div>

        <nav
          aria-label="Merchant navigation"
          className="no-scrollbar"
          style={{
            flex: "0 1 auto",
            minWidth: 0,
            maxWidth: "100%",
            display: "flex",
            alignItems: "center",
            gap: 6,
            overflowX: "auto",
            scrollbarWidth: "none",
            msOverflowStyle: "none"
          }}
        >
          {navItems.map(({ id, label, Icon, onClick, badgeCount }) => {
            const isActive = currentView === id;
            const isHovered = hoveredNav === id;
            const activeBg = theme.isDark ? theme.surface2 : theme.bg;
            const hoverBg = theme.isDark ? theme.surface2 : theme.surface2;

            return (
              <button
                key={id}
                type="button"
                onClick={onClick}
                aria-current={isActive ? "page" : undefined}
                onMouseEnter={() => setHoveredNav(id)}
                onMouseLeave={() => setHoveredNav(prev => (prev === id ? null : prev))}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "7px 14px",
                  borderRadius: 10,
                  background: isActive ? activeBg : isHovered ? hoverBg : "transparent",
                  border: `1px solid ${isActive ? theme.border : "transparent"}`,
                  color: isActive || isHovered ? theme.ink : theme.inkSoft,
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 500,
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  cursor: "pointer",
                  transition: "all 0.15s ease"
                }}
              >
                <Icon size={15} style={{ flexShrink: 0 }} />
                <span>{label}</span>
                {typeof badgeCount === "number" && badgeCount > 0 && (
                  <span style={{
                    minWidth: 18,
                    height: 18,
                    borderRadius: 9,
                    background: "#EF4444",
                    color: "#FFFFFF",
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "0 5px",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    lineHeight: 1,
                    boxSizing: "border-box"
                  }}>
                    {badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div style={{
          flex: "1 1 0",
          minWidth: "fit-content",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end"
        }}>
          {renderStatusPill()}
        </div>
      </div>
    );
  }

  // Mobile 2-row header: Back + Store Name + Status Pill, followed by circular icon nav
  return (
    <div style={{
      background: theme.surface,
      borderBottom: "none",
      position: "sticky",
      top: 0,
      zIndex: 10,
      display: "flex",
      flexDirection: "column",
      flexShrink: 0
    }}>
      {/* Top Header Row */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 14px 8px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <button
            type="button"
            onClick={onBack}
            title="Back to Main Dashboard"
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
            fontSize: 15,
            color: theme.ink,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
          }}>
            {store?.name || "Merchant Store"}
          </span>
        </div>

        {renderStatusPill()}
      </div>

      {/* Circular Category Navigation Icons */}
      <div style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 4,
        padding: "12px 8px 12px",
        background: theme.surface,
        borderTop: `1px solid ${theme.border}`,
        width: "100%",
        boxSizing: "border-box"
      }}>
        {navItems.map(({ id, label, Icon, onClick, badgeCount }) => {
          const isActive = currentView === id;
          return (
            <button
              key={id}
              type="button"
              onClick={onClick}
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
                width: 44,
                height: 44,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: theme.surface2,
                border: `1px solid ${theme.border}`,
                color: isActive ? theme.ink : theme.inkSoft,
                boxShadow: "none",
                transition: "all 0.15s ease"
              }}>
                <Icon size={21} />
                {typeof badgeCount === "number" && badgeCount > 0 && (
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
                    {badgeCount}
                  </span>
                )}
              </div>
              <span style={{
                fontSize: 12,
                fontWeight: isActive ? 700 : 500,
                color: isActive ? theme.ink : theme.inkSoft,
                textAlign: "center",
                lineHeight: 1.2,
                whiteSpace: "nowrap",
                transition: "color 0.15s ease"
              }}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
