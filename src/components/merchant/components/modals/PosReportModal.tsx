import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  ChevronLeft,
  Download,
  FileText,
  Printer,
  Share2,
  ShoppingBag
} from "lucide-react";
import type { ThemeType } from "../../../../theme";
import type { MerchantStore, PosTransaction } from "../../types";
import {
  buildPosReportCsv,
  computeTransactionCogs,
  getTransactionCashAmount,
  txIncludesPaymentMethod
} from "../../utils/posPaymentUtils";
import { PosReportSummaryStats } from "./posReport/PosReportSummaryStats";
import { PosTransactionCard } from "./posReport/PosTransactionCard";
import { PosVoidConfirmModal } from "./posReport/PosVoidConfirmModal";
import { PosThermalReportPrint } from "./posReport/PosThermalReportPrint";
import { printDailyReportHybrid } from "../pos/printing/thermalPrintService";
import { registerBackHandler } from "../../../../utils/backButton";

type DatePreset = "TODAY" | "7D" | "30D" | "CUSTOM";

function toDateInputValue(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

interface PosReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: PosTransaction[];
  store: MerchantStore | null;
  theme: ThemeType;
  onReprintReceipt: (tx: PosTransaction) => void;
  onVoidTransaction: (tx: PosTransaction) => void;
  isMobileView?: boolean;
  showProfitSummary?: boolean;
  onNotify?: (message: string) => void;
}

export function PosReportModal({
  isOpen,
  onClose,
  transactions,
  store,
  theme,
  onReprintReceipt,
  onVoidTransaction,
  isMobileView,
  showProfitSummary = true,
  onNotify
}: PosReportModalProps) {
  const isMobile = isMobileView ?? (typeof window !== "undefined" && window.innerWidth <= 768);
  const [filterMethod, setFilterMethod] = useState<"ALL" | "CASH" | "QRIS" | "SPLIT">("ALL");
  const [datePreset, setDatePreset] = useState<DatePreset>("TODAY");
  const [customStartDate, setCustomStartDate] = useState<string>(() => toDateInputValue(new Date()));
  const [customEndDate, setCustomEndDate] = useState<string>(() => toDateInputValue(new Date()));
  const [transactionToVoid, setTransactionToVoid] = useState<PosTransaction | null>(null);

  useEffect(() => {
    if (!isOpen || !transactionToVoid) return;
    return registerBackHandler("pos_report_void_confirm", 88, () => {
      setTransactionToVoid(null);
      return true;
    });
  }, [isOpen, transactionToVoid]);

  useEffect(() => {
    if (!isOpen || isMobile) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !transactionToVoid) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isMobile, transactionToVoid, onClose]);

  const { rangeStartTs, rangeEndTs, periodLabel } = useMemo(() => {
    const now = new Date();
    const endToday = new Date(now);
    endToday.setHours(23, 59, 59, 999);

    if (datePreset === "TODAY") {
      const startToday = new Date(now);
      startToday.setHours(0, 0, 0, 0);
      return {
        rangeStartTs: startToday.getTime(),
        rangeEndTs: endToday.getTime(),
        periodLabel: "Hari Ini"
      };
    }

    if (datePreset === "7D") {
      const start7 = new Date(now);
      start7.setDate(start7.getDate() - 6);
      start7.setHours(0, 0, 0, 0);
      return {
        rangeStartTs: start7.getTime(),
        rangeEndTs: endToday.getTime(),
        periodLabel: "7 Hari Terakhir"
      };
    }

    if (datePreset === "30D") {
      const start30 = new Date(now);
      start30.setDate(start30.getDate() - 29);
      start30.setHours(0, 0, 0, 0);
      return {
        rangeStartTs: start30.getTime(),
        rangeEndTs: endToday.getTime(),
        periodLabel: "30 Hari Terakhir"
      };
    }

    const startParsed = customStartDate ? new Date(`${customStartDate}T00:00:00`) : new Date(now);
    const endParsed = customEndDate ? new Date(`${customEndDate}T23:59:59.999`) : new Date(endToday);
    const sTs = Number.isNaN(startParsed.getTime()) ? 0 : startParsed.getTime();
    const eTs = Number.isNaN(endParsed.getTime()) ? endToday.getTime() : endParsed.getTime();
    const [minTs, maxTs] = sTs <= eTs ? [sTs, eTs] : [eTs, sTs];
    const fmt = (ts: number) =>
      new Date(ts).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    const label =
      customStartDate && customEndDate && customStartDate === customEndDate
        ? fmt(minTs)
        : `${fmt(minTs)} - ${fmt(maxTs)}`;
    return {
      rangeStartTs: minTs,
      rangeEndTs: maxTs,
      periodLabel: label
    };
  }, [datePreset, customStartDate, customEndDate]);

  // Transactions inside the active date range
  const rangedTransactions = useMemo(() => {
    return transactions.filter(
      (t) => t.createdAt >= rangeStartTs && t.createdAt <= rangeEndTs
    );
  }, [transactions, rangeStartTs, rangeEndTs]);

  const activeTransactions = useMemo(() => {
    return rangedTransactions.filter((t) => t.status !== "VOIDED");
  }, [rangedTransactions]);

  const totalRevenue = useMemo(() => {
    return activeTransactions.reduce((sum, t) => sum + t.totalAmount, 0);
  }, [activeTransactions]);

  const totalCashInDrawer = useMemo(() => {
    return activeTransactions.reduce((sum, t) => sum + getTransactionCashAmount(t), 0);
  }, [activeTransactions]);

  const totalNonCash = useMemo(() => {
    return Math.max(0, totalRevenue - totalCashInDrawer);
  }, [totalRevenue, totalCashInDrawer]);

  const { totalCogs, grossProfit, grossMarginPercent, hasCostData, isPartialCostData } = useMemo(() => {
    let cogs = 0;
    let totalTax = 0;
    let knownLines = 0;
    let totalLines = 0;
    for (const tx of activeTransactions) {
      const res = computeTransactionCogs(tx);
      cogs += res.totalCogs;
      totalTax += tx.taxAmount || 0;
      knownLines += res.knownCostLines;
      totalLines += res.totalLines;
    }
    const netRevenueExTax = Math.max(0, totalRevenue - totalTax);
    const profit = Math.max(0, netRevenueExTax - cogs);
    const margin = netRevenueExTax > 0 ? Math.round((profit / netRevenueExTax) * 100) : 0;
    return {
      totalCogs: cogs,
      grossProfit: profit,
      grossMarginPercent: margin,
      hasCostData: knownLines > 0,
      isPartialCostData: knownLines > 0 && knownLines < totalLines
    };
  }, [activeTransactions, totalRevenue]);

  // Aggregate items sold
  const itemsSoldSummary = useMemo(() => {
    const map = new Map<string, number>();
    activeTransactions.forEach((t) => {
      t.items.forEach((it) => {
        const name = `${it.product.name}${it.variant ? ` (${it.variant.name})` : ""}`;
        map.set(name, (map.get(name) || 0) + it.quantity);
      });
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [activeTransactions]);

  // Filtered transactions list
  const filteredList = useMemo(() => {
    return rangedTransactions.filter((t) => txIncludesPaymentMethod(t, filterMethod));
  }, [rangedTransactions, filterMethod]);

  const handleExportCsv = () => {
    if (filteredList.length === 0) {
      onNotify?.("Tidak ada transaksi pada rentang ini untuk diekspor.");
      return;
    }
    const csvContent = buildPosReportCsv({
      transactions: filteredList,
      showProfitSummary
    });
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const slug = (store?.name || "toko")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const dateTag = toDateInputValue(new Date());
    link.href = url;
    link.download = `rekap-kasir-${slug}-${dateTag}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onNotify?.(`Export CSV berhasil (${filteredList.length} transaksi).`);
  };

  // Send summary to WhatsApp
  const handleSendReportWhatsApp = () => {
    const phone = store?.whatsapp ? store.whatsapp.replace(/[^0-9]/g, "") : "";
    const target = phone.startsWith("0") ? `62${phone.slice(1)}` : phone;

    const nowTime = new Date().toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit"
    });

    const itemsText =
      itemsSoldSummary.length > 0
        ? itemsSoldSummary.map(([name, qty]) => `• ${qty}x ${name}`).join("\n")
        : "Belum ada produk terjual";

    const profitLines =
      showProfitSummary && hasCostData
        ? `\n• Total Modal (HPP): Rp ${totalCogs.toLocaleString("id-ID")}\n• *Laba Kotor: Rp ${grossProfit.toLocaleString("id-ID")}* (Margin ${grossMarginPercent}%)`
        : "";

    const message = `*LAPORAN REKAP KASIR - ${store?.name || "MITRA SERA"}*
Periode: ${periodLabel} (${nowTime} WIB)
--------------------------------
*Total Omset Kasir: Rp ${totalRevenue.toLocaleString("id-ID")}*
• Uang Tunai: Rp ${totalCashInDrawer.toLocaleString("id-ID")}
• Non-Tunai (QRIS/Transfer): Rp ${totalNonCash.toLocaleString("id-ID")}${profitLines}
• Total Transaksi Selesai: ${activeTransactions.length} transaksi
--------------------------------
*Rincian Produk Terjual:*
${itemsText}
--------------------------------
Laporan dibuat otomatis dari sistem kasir SERA.`;

    const url = target
      ? `https://wa.me/${target}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const handlePrintDailyReport = async () => {
    try {
      const res = await printDailyReportHybrid(store, {
        totalCashInDrawer,
        totalNonCash,
        totalRevenue,
        activeTransactionsCount: activeTransactions.length,
        periodLabel,
        totalCogs: showProfitSummary && hasCostData ? totalCogs : undefined,
        grossProfit: showProfitSummary && hasCostData ? grossProfit : undefined
      });
      if (onNotify) onNotify(res.message);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal mencetak rekap kasir.";
      if (onNotify) onNotify(msg);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={() => {
        if (!isMobile) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: isMobile ? theme.surface : "rgba(0, 0, 0, 0.7)",
        backdropFilter: isMobile ? "none" : "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: isMobile ? 0 : 16
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: theme.surface,
          border: isMobile ? "none" : `1px solid ${theme.border}`,
          borderRadius: isMobile ? 0 : 18,
          width: "100%",
          maxWidth: isMobile ? "100%" : 660,
          height: isMobile ? "100%" : "auto",
          maxHeight: isMobile ? "100dvh" : "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: isMobile ? "none" : "0 25px 50px rgba(0,0,0,0.3)",
          overflow: "hidden"
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: isMobile ? "12px 14px" : "14px 18px",
            borderBottom: `1px solid ${theme.border}`,
            background: theme.surface2,
            position: "sticky",
            top: 0,
            zIndex: 10
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              type="button"
              onClick={onClose}
              title="Kembali"
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                border: `1px solid ${theme.border}`,
                background: theme.surface,
                color: theme.ink,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer"
              }}
            >
              <ChevronLeft size={18} />
            </button>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: theme.surface,
                border: `1px solid ${theme.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: theme.ink
              }}
            >
              <FileText size={17} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 15.5, fontWeight: 700, color: theme.ink }}>
                Rekap Kasir & Laba
              </h3>
              <p style={{ margin: 0, fontSize: 11, color: theme.inkSoft }}>
                Periode: {periodLabel}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: isMobile ? "14px 16px 28px" : 18,
            display: "flex",
            flexDirection: "column",
            gap: isMobile ? 14 : 16
          }}
        >
          {/* Date Range Selector */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <Calendar size={14} style={{ color: theme.inkSoft }} />
              {[
                { id: "TODAY", label: "Hari Ini" },
                { id: "7D", label: "7 Hari" },
                { id: "30D", label: "30 Hari" },
                { id: "CUSTOM", label: "Pilih Tanggal" }
              ].map((p) => {
                const active = datePreset === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setDatePreset(p.id as DatePreset)}
                    style={{
                      padding: isMobile ? "5px 10px" : "5px 11px",
                      borderRadius: 999,
                      border: `1px solid ${active ? theme.accent : theme.border}`,
                      background: active ? `${theme.accent}16` : theme.surface2,
                      color: active ? theme.accent : theme.inkSoft,
                      fontSize: 11.5,
                      fontWeight: active ? 700 : 600,
                      cursor: "pointer"
                    }}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>

            {datePreset === "CUSTOM" && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 8,
                  padding: 10,
                  borderRadius: 10,
                  background: theme.surface2,
                  border: `1px solid ${theme.border}`
                }}
              >
                <div>
                  <div style={{ fontSize: 10.5, fontWeight: 600, color: theme.inkSoft, marginBottom: 4 }}>
                    Dari Tanggal
                  </div>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "6px 8px",
                      borderRadius: 7,
                      border: `1px solid ${theme.border}`,
                      background: theme.surface,
                      color: theme.ink,
                      fontSize: 12,
                      boxSizing: "border-box"
                    }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 10.5, fontWeight: 600, color: theme.inkSoft, marginBottom: 4 }}>
                    Sampai Tanggal
                  </div>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "6px 8px",
                      borderRadius: 7,
                      border: `1px solid ${theme.border}`,
                      background: theme.surface,
                      color: theme.ink,
                      fontSize: 12,
                      boxSizing: "border-box"
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <PosReportSummaryStats
            theme={theme}
            isMobile={isMobile}
            periodLabel={periodLabel}
            totalRevenue={totalRevenue}
            totalCashInDrawer={totalCashInDrawer}
            totalNonCash={totalNonCash}
            activeTransactionsCount={activeTransactions.length}
            totalCogs={totalCogs}
            grossProfit={grossProfit}
            grossMarginPercent={grossMarginPercent}
            hasCostData={hasCostData}
            isPartialCostData={isPartialCostData}
            showProfitSummary={showProfitSummary}
          />

          {/* Quick Action Buttons */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={handlePrintDailyReport}
              style={{
                flex: 1,
                minWidth: 110,
                padding: "9px 10px",
                borderRadius: 10,
                border: `1px solid ${theme.border}`,
                background: theme.surface,
                color: theme.ink,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6
              }}
            >
              <Printer size={15} />
              <span>{isMobile ? "Cetak" : "Cetak Rekap"}</span>
            </button>

            <button
              type="button"
              onClick={handleExportCsv}
              style={{
                flex: 1,
                minWidth: 110,
                padding: "9px 10px",
                borderRadius: 10,
                border: `1px solid ${theme.border}`,
                background: theme.surface,
                color: theme.ink,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6
              }}
            >
              <Download size={15} />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={handleSendReportWhatsApp}
              style={{
                flex: 1,
                minWidth: 110,
                padding: "9px 10px",
                borderRadius: 10,
                border: `1px solid ${theme.border}`,
                background: theme.surface,
                color: theme.ink,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6
              }}
            >
              <Share2 size={15} />
              <span>{isMobile ? "Kirim WA" : "Kirim ke WA"}</span>
            </button>
          </div>

          {/* Filter Bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
              flexWrap: isMobile ? "wrap" : "nowrap"
            }}
          >
            <span
              style={{
                fontSize: isMobile ? 12 : 13,
                fontWeight: 700,
                color: theme.ink,
                whiteSpace: "nowrap"
              }}
            >
              Riwayat Transaksi ({filteredList.length})
            </span>
            <div style={{ display: "flex", gap: isMobile ? 4 : 6 }}>
              {[
                { id: "ALL", label: "Semua" },
                { id: "CASH", label: "Tunai" },
                { id: "QRIS", label: "QRIS" },
                { id: "SPLIT", label: "Split" }
              ].map((f) => {
                const active = filterMethod === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFilterMethod(f.id as "ALL" | "CASH" | "QRIS" | "SPLIT")}
                    style={{
                      padding: isMobileView ? "3px 8px" : "4px 10px",
                      borderRadius: 16,
                      fontSize: isMobileView ? 10 : 11,
                      fontWeight: active ? 700 : 500,
                      border: `1px solid ${active ? theme.ink : theme.border}`,
                      background: active ? theme.surface2 : theme.surface,
                      color: active ? theme.ink : theme.inkSoft,
                      cursor: "pointer",
                      whiteSpace: "nowrap"
                    }}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Transactions List */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filteredList.length === 0 ? (
              <div
                style={{
                  padding: 30,
                  textAlign: "center",
                  color: theme.inkSoft,
                  background: theme.surface2,
                  borderRadius: 12,
                  border: `1px dashed ${theme.border}`
                }}
              >
                <ShoppingBag size={32} style={{ opacity: 0.3, marginBottom: 6 }} />
                <p style={{ margin: 0, fontSize: 12, fontWeight: 600 }}>
                  Belum ada transaksi pada filter ini
                </p>
              </div>
            ) : (
              filteredList.map((tx) => (
                <PosTransactionCard
                  key={tx.id}
                  tx={tx}
                  theme={theme}
                  onReprintReceipt={onReprintReceipt}
                  onRequestVoid={setTransactionToVoid}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <PosVoidConfirmModal
        transactionToVoid={transactionToVoid}
        theme={theme}
        onCancel={() => setTransactionToVoid(null)}
        onConfirmVoid={(tx) => {
          onVoidTransaction(tx);
          setTransactionToVoid(null);
        }}
      />

      <PosThermalReportPrint
        store={store}
        totalCashInDrawer={totalCashInDrawer}
        totalNonCash={totalNonCash}
        totalRevenue={totalRevenue}
        activeTransactionsCount={activeTransactions.length}
        periodLabel={periodLabel}
        totalCogs={showProfitSummary && hasCostData ? totalCogs : undefined}
        grossProfit={showProfitSummary && hasCostData ? grossProfit : undefined}
      />
    </div>
  );
}
