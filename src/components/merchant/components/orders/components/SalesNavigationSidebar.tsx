import React, { useState } from "react";
import { CheckCircle2, ShoppingBag, Star, Truck } from "lucide-react";
import type { ThemeType } from "../../../../../theme";
import type { OrderFilterType } from "../hooks/useMerchantOrderReconciliation";

interface SalesNavigationSidebarProps {
  theme: ThemeType;
  activeFilter: OrderFilterType | "";
  onSelectFilter: (f: OrderFilterType) => void;
  activeCount: number;
  shippedCount: number;
  completedCount: number;
  reviewsCount: number;
  totalRevenue: number;
  onlineCount: number;
  posCount: number;
  revenueLabel?: string;
  revenueSubtext?: string;
}

export const SalesNavigationSidebar: React.FC<SalesNavigationSidebarProps> = ({
  theme,
  activeFilter,
  onSelectFilter,
  activeCount,
  shippedCount,
  completedCount,
  reviewsCount,
  totalRevenue,
  onlineCount,
  posCount,
  revenueLabel,
  revenueSubtext
}) => {
  const [hoveredId, setHoveredId] = useState<OrderFilterType | null>(null);
  const activeBg = theme.isDark ? theme.surface2 : theme.bg;
  const resolvedRevenueLabel = revenueLabel || "Completed Revenue";
  const resolvedRevenueSubtext = revenueSubtext || `Online: ${onlineCount} / POS: ${posCount}`;

  const navItems: Array<{
    id: OrderFilterType;
    label: string;
    Icon: typeof ShoppingBag;
    count: number;
    useAlertBadge?: boolean;
  }> = [
    {
      id: "ACTIVE",
      label: "Orders",
      Icon: ShoppingBag,
      count: activeCount,
      useAlertBadge: true
    },
    {
      id: "COURIER",
      label: "Shipped",
      Icon: Truck,
      count: shippedCount
    },
    {
      id: "COMPLETED",
      label: "Completed",
      Icon: CheckCircle2,
      count: completedCount
    },
    {
      id: "REVIEWS",
      label: "Reviews",
      Icon: Star,
      count: reviewsCount
    }
  ];

  return (
    <div
      style={{
        background: theme.surface,
        border: `1px solid ${theme.border}`,
        borderRadius: 18,
        padding: 12,
        display: "flex",
        flexDirection: "column",
        gap: 4,
        flexShrink: 0
      }}
    >
      <div
        style={{
          padding: "4px 10px 8px",
          fontSize: 13,
          fontWeight: 700,
          color: theme.inkSoft
        }}
      >
        Sales
      </div>

      {navItems.map(({ id, label, Icon, count, useAlertBadge }) => {
        const isActive = activeFilter === id;
        const isHovered = hoveredId === id;

        return (
          <button
            key={id}
            type="button"
            onClick={() => onSelectFilter(id)}
            aria-current={isActive ? "page" : undefined}
            onMouseEnter={() => setHoveredId(id)}
            onMouseLeave={() => setHoveredId((prev) => (prev === id ? null : prev))}
            style={{
              width: "100%",
              textAlign: "left",
              background: isActive ? activeBg : isHovered ? theme.surface2 : "transparent",
              border: `1px solid ${isActive ? theme.border : "transparent"}`,
              borderRadius: 10,
              padding: "10px 12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
              cursor: "pointer",
              transition: "background 0.15s ease, color 0.15s ease, border-color 0.15s ease"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
              <div
                style={{
                  color: isActive || isHovered ? theme.ink : theme.inkSoft,
                  display: "flex",
                  alignItems: "center",
                  flexShrink: 0,
                  transition: "color 0.15s ease"
                }}
              >
                <Icon size={16} />
              </div>
              <span
                style={{
                  fontSize: 13.5,
                  fontWeight: isActive ? 600 : 500,
                  color: isActive || isHovered ? theme.ink : theme.inkSoft,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  transition: "color 0.15s ease"
                }}
              >
                {label}
              </span>
            </div>

            {useAlertBadge && count > 0 ? (
              <span
                style={{
                  minWidth: 19,
                  height: 19,
                  borderRadius: 999,
                  background: "#EF4444",
                  color: "#FFFFFF",
                  fontSize: 10.5,
                  fontWeight: 700,
                  padding: "0 6px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  lineHeight: 1,
                  boxSizing: "border-box",
                  flexShrink: 0
                }}
              >
                {count}
              </span>
            ) : (
              <span
                style={{
                  fontSize: 12,
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? theme.ink : theme.inkFaint,
                  flexShrink: 0
                }}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}

      {/* Compact Revenue Summary inside the same panel */}
      <div
        style={{
          marginTop: 8,
          padding: "12px 10px 4px",
          borderTop: `1px solid ${theme.border}`,
          display: "flex",
          flexDirection: "column"
        }}
      >
        <div style={{ fontSize: 11.5, fontWeight: 600, color: theme.inkSoft }}>
          {resolvedRevenueLabel}
        </div>
        <div
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: theme.accent,
            marginTop: 4,
            letterSpacing: "-0.3px"
          }}
        >
          Rp {totalRevenue.toLocaleString("id-ID")}
        </div>
        <div style={{ marginTop: 6, fontSize: 12, color: theme.inkSoft }}>
          {resolvedRevenueSubtext}
        </div>
      </div>
    </div>
  );
};
