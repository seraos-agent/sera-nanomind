import React from "react";
import type { ThemeType } from "../../../../../theme";
import type { OrderFilterType } from "../hooks/useMerchantOrderReconciliation";

interface OrderFilterTabsProps {
  theme: ThemeType;
  filter: OrderFilterType;
  setFilter: (f: OrderFilterType) => void;
  activeCount: number;
  shippedCount: number;
  isMobileView?: boolean;
}

export const OrderFilterTabs: React.FC<OrderFilterTabsProps> = ({
  theme,
  filter,
  setFilter,
  activeCount,
  shippedCount,
  isMobileView
}) => {
  const getTabStyle = (tab: OrderFilterType) => ({
    flex: 1,
    display: "inline-flex" as const,
    alignItems: "center",
    justifyContent: "center",
    padding: isMobileView ? "7px 4px" : "8px 12px",
    borderRadius: 20,
    fontSize: isMobileView ? 11.5 : 12,
    fontWeight: filter === tab ? 700 : 500,
    background: theme.surface,
    color: filter === tab ? theme.ink : theme.inkSoft,
    border: filter === tab ? `1.5px solid ${theme.ink}` : `1px solid ${theme.border}`,
    boxShadow:
      filter === tab ? "0 1px 3px rgba(0,0,0,0.06)" : "0 1px 2px rgba(0,0,0,0.02)",
    cursor: "pointer",
    whiteSpace: "nowrap" as const,
    transition: "all 0.15s ease",
    textAlign: "center" as const
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        paddingBottom: 2,
        width: "100%",
        boxSizing: "border-box"
      }}
    >
      <button
        type="button"
        onClick={() => setFilter("ACTIVE")}
        style={getTabStyle("ACTIVE")}
      >
        Pesanan ({activeCount})
      </button>

      <button
        type="button"
        onClick={() => setFilter("COURIER")}
        style={getTabStyle("COURIER")}
      >
        Dikirim ({shippedCount})
      </button>

      <button
        type="button"
        onClick={() => setFilter("COMPLETED")}
        style={getTabStyle("COMPLETED")}
      >
        Selesai
      </button>

      <button
        type="button"
        onClick={() => setFilter("REVIEWS")}
        style={getTabStyle("REVIEWS")}
      >
        Ulasan
      </button>
    </div>
  );
};

