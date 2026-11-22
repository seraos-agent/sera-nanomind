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
          {store?.name || "MITRA SERA"}
        </div>
        <div style={{ textAlign: "center", fontSize: 10 }}>
          LAPORAN REKAP KASIR
        </div>
        <div style={{ textAlign: "center", fontSize: 9 }}>
          {periodLabel || `${new Date().toLocaleDateString("id-ID")} • ${new Date().toLocaleTimeString("id-ID")}`}
        </div>
        <div style={{ borderTop: "1px dashed #000", margin: "4px 0" }} />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10 }}>
          <span>Uang Tunai:</span>
          <span>Rp {totalCashInDrawer.toLocaleString("id-ID")}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10 }}>
          <span>Non-Tunai:</span>
          <span>Rp {totalNonCash.toLocaleString("id-ID")}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: "bold", marginTop: 4 }}>
          <span>TOTAL OMSET:</span>
          <span>Rp {totalRevenue.toLocaleString("id-ID")}</span>
        </div>
        {totalCogs !== undefined && totalCogs > 0 && grossProfit !== undefined && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10 }}>
              <span>Total Modal (HPP):</span>
              <span>Rp {totalCogs.toLocaleString("id-ID")}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, fontWeight: "bold" }}>
              <span>Laba Kotor:</span>
              <span>Rp {grossProfit.toLocaleString("id-ID")}</span>
            </div>
          </>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9 }}>
          <span>Total Transaksi:</span>
          <span>{activeTransactionsCount}</span>
        </div>
        <div style={{ borderTop: "1px dashed #000", margin: "4px 0" }} />
        <div style={{ textAlign: "center", fontSize: 9 }}>
          Dicetak dari SERA POS
        </div>
      </div>
    </>
  );
}
