import type { MerchantStore } from "../../../types";

interface PosThermalReportPrintProps {
  store: MerchantStore | null;
  totalCashInDrawer: number;
  totalNonCash: number;
  totalRevenue: number;
  activeTransactionsCount: number;
  periodLabel?: string;
  totalCogs?: number;
  grossProfit?: number;
}

export function PosThermalReportPrint({
  store,
  totalCashInDrawer,
  totalNonCash,
  totalRevenue,
  activeTransactionsCount,
  periodLabel,
  totalCogs,
  grossProfit
}: PosThermalReportPrintProps) {
  return (
    <>
      <div
        id="sera-thermal-daily-report"
        style={{
          display: "none"
        }}
      >
        <div style={{ textAlign: "center", fontWeight: "bold", fontSize: 13 }}>
          {store?.name || "SERA MERCHANT"}
        </div>
        <div style={{ textAlign: "center", fontSize: 10 }}>
          POS SALES &amp; SHIFT SUMMARY
        </div>
        <div style={{ textAlign: "center", fontSize: 9 }}>
          {periodLabel || `${new Date().toLocaleDateString("en-US")} • ${new Date().toLocaleTimeString("en-US")}`}
        </div>
        <div style={{ borderTop: "1px dashed #000", margin: "4px 0" }} />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10 }}>
          <span>Cash:</span>
          <span>Rp {totalCashInDrawer.toLocaleString("id-ID")}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10 }}>
          <span>Non-Cash:</span>
          <span>Rp {totalNonCash.toLocaleString("id-ID")}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: "bold", marginTop: 4 }}>
          <span>TOTAL REVENUE:</span>
          <span>Rp {totalRevenue.toLocaleString("id-ID")}</span>
        </div>
        {totalCogs !== undefined && totalCogs > 0 && grossProfit !== undefined && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10 }}>
              <span>Total COGS:</span>
              <span>Rp {totalCogs.toLocaleString("id-ID")}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, fontWeight: "bold" }}>
              <span>Gross Profit:</span>
              <span>Rp {grossProfit.toLocaleString("id-ID")}</span>
            </div>
          </>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9 }}>
          <span>Total Transactions:</span>
          <span>{activeTransactionsCount}</span>
        </div>
        <div style={{ borderTop: "1px dashed #000", margin: "4px 0" }} />
        <div style={{ textAlign: "center", fontSize: 9 }}>
          Printed from SERA POS
        </div>
      </div>
    </>
  );
}
