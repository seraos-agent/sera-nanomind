import React from "react";
import type { ThemeType } from "../../../../../theme";

interface OrderRevenueSummaryProps {
  theme: ThemeType;
  totalRevenue: number;
  completedCount: number;
  isMobileView?: boolean;
}

export const OrderRevenueSummary: React.FC<OrderRevenueSummaryProps> = ({
  theme,
  totalRevenue,
  completedCount,
  isMobileView
}) => {
  return (
    <div
      style={{
        background: theme.surface,
        border: `1px solid ${theme.border}`,
        borderRadius: 14,
        padding: isMobileView ? "14px 16px" : "16px 20px",
        display: "flex",
        flexDirection: isMobileView ? "column" : "row",
        justifyContent: "space-between",
        alignItems: isMobileView ? "flex-start" : "center",
        gap: 12,
        boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
      }}
    >
      <div
        style={{
          fontSize: isMobileView ? 24 : 26,
          fontWeight: 800,
          color: theme.accent,
          letterSpacing: "-0.5px"
        }}
      >
        Rp {totalRevenue.toLocaleString("id-ID")}
      </div>

      <div
        style={{
          fontSize: 12,
          color: theme.ink,
          background: theme.surface2,
          padding: "6px 12px",
          borderRadius: 8,
          border: `1px solid ${theme.border}`,
          display: "inline-flex",
          alignItems: "center",
          gap: 6
        }}
      >
        <span style={{ color: theme.inkSoft }}>Total:</span>
        <strong>{completedCount} completed transactions</strong>
      </div>
    </div>
  );
};

