import { Banknote, QrCode, TrendingUp, Wallet } from "lucide-react";
import type { ThemeType } from "../../../../../theme";

interface PosReportSummaryStatsProps {
  theme: ThemeType;
  isMobile: boolean;
  periodLabel: string;
  totalRevenue: number;
  totalCashInDrawer: number;
  totalNonCash: number;
  activeTransactionsCount: number;
  totalCogs: number;
  grossProfit: number;
  grossMarginPercent: number;
  hasCostData: boolean;
  isPartialCostData: boolean;
  showProfitSummary?: boolean;
}

export function PosReportSummaryStats({
  theme,
  isMobile,
  periodLabel,
  totalRevenue,
  totalCashInDrawer,
  totalNonCash,
  activeTransactionsCount,
  totalCogs,
  grossProfit,
  grossMarginPercent,
  hasCostData,
  isPartialCostData,
  showProfitSummary = true
}: PosReportSummaryStatsProps) {
  const profitCard = showProfitSummary && (
    <div
      style={{
        background: hasCostData ? "rgba(16, 185, 129, 0.08)" : theme.surface2,
        border: `1px solid ${hasCostData ? "rgba(16, 185, 129, 0.28)" : theme.border}`,
        borderRadius: 12,
        padding: isMobile ? "11px 14px" : "12px 14px",
        display: "flex",
        alignItems: isMobile ? "flex-start" : "center",
        justifyContent: "space-between",
        flexDirection: isMobile ? "column" : "row",
        gap: 10
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            color: hasCostData ? "#059669" : theme.inkSoft,
            fontSize: 11,
            fontWeight: 700
          }}
        >
          <Wallet size={13} />
          <span>Estimated Gross Profit ({periodLabel})</span>
        </div>
        {hasCostData ? (
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 17, fontWeight: 800, color: "#059669" }}>
              Rp {grossProfit.toLocaleString("id-ID")}
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#059669",
                background: "rgba(16, 185, 129, 0.14)",
                padding: "2px 7px",
                borderRadius: 999
              }}
            >
              Margin {grossMarginPercent}%
            </span>
          </div>
        ) : (
          <div style={{ fontSize: 11.5, color: theme.inkSoft }}>
            No COGS data yet. Fill in <strong>Cost Price</strong> when editing products to view gross profit.
          </div>
        )}
      </div>

      {hasCostData && (
        <div style={{ textAlign: isMobile ? "left" : "right" }}>
          <div style={{ fontSize: 11, color: theme.inkSoft }}>
            Total COGS:{" "}
            <strong style={{ color: theme.ink }}>Rp {totalCogs.toLocaleString("id-ID")}</strong>
          </div>
          {isPartialCostData && (
            <div style={{ fontSize: 10, color: "#D97706", marginTop: 2 }}>
              Some sold items are missing a cost price
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div
          style={{
            background: theme.surface2,
            border: `1px solid ${theme.border}`,
            borderRadius: 14,
            padding: "14px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 12
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 11, color: theme.inkSoft, fontWeight: 500, marginBottom: 2 }}>
                Total Omset ({periodLabel})
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: theme.ink, letterSpacing: -0.5 }}>
                Rp {totalRevenue.toLocaleString("id-ID")}
              </div>
            </div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: theme.inkSoft,
                background: theme.surface,
                border: `1px solid ${theme.border}`,
                padding: "3px 8px",
                borderRadius: 12
              }}
            >
              {activeTransactionsCount} Transactions
            </div>
          </div>

          <div style={{ height: 1, background: theme.border }} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: theme.inkSoft, marginBottom: 2 }}>
                <Banknote size={13} />
                <span>Cash</span>
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: theme.ink }}>
                Rp {totalCashInDrawer.toLocaleString("id-ID")}
              </div>
            </div>

            <div style={{ borderLeft: `1px solid ${theme.border}`, paddingLeft: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: theme.inkSoft, marginBottom: 2 }}>
                <QrCode size={13} />
                <span>QRIS & Bank</span>
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: theme.ink }}>
                Rp {totalNonCash.toLocaleString("id-ID")}
              </div>
            </div>
          </div>
        </div>
        {profitCard}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
        <div
          style={{
            background: theme.surface2,
            border: `1px solid ${theme.border}`,
            borderRadius: 12,
            padding: "12px 14px",
            display: "flex",
            flexDirection: "column",
            gap: 4
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: theme.inkSoft, fontSize: 11 }}>
            <Banknote size={14} />
            <span>Cash</span>
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: theme.ink }}>
            Rp {totalCashInDrawer.toLocaleString("id-ID")}
          </div>
        </div>

        <div
          style={{
            background: theme.surface2,
            border: `1px solid ${theme.border}`,
            borderRadius: 12,
            padding: "12px 14px",
            display: "flex",
            flexDirection: "column",
            gap: 4
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: theme.inkSoft, fontSize: 11 }}>
            <QrCode size={14} />
            <span>QRIS &amp; Bank</span>
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: theme.ink }}>
            Rp {totalNonCash.toLocaleString("id-ID")}
          </div>
        </div>

        <div
          style={{
            background: theme.surface2,
            border: `1px solid ${theme.border}`,
            borderRadius: 12,
            padding: "12px 14px",
            display: "flex",
            flexDirection: "column",
            gap: 4
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: theme.inkSoft, fontSize: 11 }}>
            <TrendingUp size={14} />
            <span>Total Revenue</span>
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: theme.ink }}>
            Rp {totalRevenue.toLocaleString("id-ID")}
          </div>
          <div style={{ fontSize: 10, color: theme.inkSoft }}>
            {activeTransactionsCount} transactions • {periodLabel}
          </div>
        </div>
      </div>
      {profitCard}
    </div>
  );
}
