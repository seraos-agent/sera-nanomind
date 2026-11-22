import type { PosBasePaymentMethod, PosCartItem, PosPaymentPart, PosTransaction } from "../types";

export const POS_PAYMENT_METHOD_LABELS: Record<PosBasePaymentMethod | "SPLIT", string> = {
  CASH: "Tunai",
  QRIS: "QRIS",
  TRANSFER: "Transfer",
  SPLIT: "Split Bayar"
};

/**
 * Normalizes a payment method code into a human-readable Indonesian label.
 */
export function getPaymentMethodDisplayLabel(method?: string): string {
  if (!method) return "Tunai";
  if (method === "CASH") return POS_PAYMENT_METHOD_LABELS.CASH;
  if (method === "QRIS") return POS_PAYMENT_METHOD_LABELS.QRIS;
  if (method === "TRANSFER") return POS_PAYMENT_METHOD_LABELS.TRANSFER;
  if (method === "SPLIT") return POS_PAYMENT_METHOD_LABELS.SPLIT;
  return method;
}

/**
 * Formats single or multi-part POS payments into a compact summary string (e.g. "Tunai + QRIS").
 */
export function formatPosPaymentBreakdown(tx: {
  paymentMethod: string;
  payments?: PosPaymentPart[];
}): string {
  if (tx.paymentMethod === "SPLIT" && Array.isArray(tx.payments) && tx.payments.length > 0) {
    return tx.payments
      .map((part) => getPaymentMethodDisplayLabel(part.method))
      .join(" + ");
  }
  return getPaymentMethodDisplayLabel(tx.paymentMethod);
}

/**
 * Computes net cash added to the register drawer by a transaction (handling change on split cash payments).
 */
export function getTransactionCashAmount(tx: {
  paymentMethod: string;
  payments?: PosPaymentPart[];
  totalAmount: number;
  changeAmount?: number;
}): number {
  if (Array.isArray(tx.payments) && tx.payments.length > 0) {
    const grossCash = tx.payments
      .filter((p) => p.method === "CASH")
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);
    if (grossCash <= 0) return 0;
    return Math.max(0, grossCash - Number(tx.changeAmount || 0));
  }
  return tx.paymentMethod === "CASH" ? Number(tx.totalAmount || 0) : 0;
}

/**
 * Checks whether a transaction matches a report filter, including split transactions that use that method.
 */
export function txIncludesPaymentMethod(
  tx: { paymentMethod: string; payments?: PosPaymentPart[] },
  filter: "ALL" | "CASH" | "QRIS" | "TRANSFER" | "SPLIT"
): boolean {
  if (filter === "ALL") return true;
  if (filter === "SPLIT") {
    return tx.paymentMethod === "SPLIT" || (Array.isArray(tx.payments) && tx.payments.length > 1);
  }
  if (tx.paymentMethod === filter) return true;
  if (Array.isArray(tx.payments)) {
    return tx.payments.some((p) => p.method === filter && p.amount > 0);
  }
  return false;
}

/**
 * Resolves the effective unit cost price (HPP) of a sold or cart POS item.
 */
export function getCartItemUnitCost(item: PosCartItem): number | undefined {
  const raw = item.costPrice ?? item.variant?.costPrice ?? item.product?.costPrice;
  if (raw === undefined || raw === null) return undefined;
  const num = Number(raw);
  return Number.isFinite(num) && num >= 0 ? num : undefined;
}

/**
 * Computes total COGS (HPP) and cost coverage for a completed POS transaction.
 */
export function computeTransactionCogs(tx: PosTransaction): {
  totalCogs: number;
  knownCostLines: number;
  totalLines: number;
} {
  let totalCogs = 0;
  let knownCostLines = 0;
  for (const item of tx.items || []) {
    const unitCost = getCartItemUnitCost(item);
    if (unitCost !== undefined && unitCost > 0) {
      totalCogs += unitCost * Number(item.quantity || 0);
      knownCostLines += 1;
    }
  }
  return {
    totalCogs,
    knownCostLines,
    totalLines: Array.isArray(tx.items) ? tx.items.length : 0
  };
}

function escapeCsvCell(value: string | number | undefined | null): string {
  const raw = value === undefined || value === null ? "" : String(value);
  if (/[",\r\n]/.test(raw)) {
    return `"${raw.replace(/"/g, '""')}"`;
  }
  return raw;
}

/**
 * Builds an Excel-compatible UTF-8 BOM CSV string for filtered POS transactions.
 */
export function buildPosReportCsv(params: {
  transactions: PosTransaction[];
  showProfitSummary: boolean;
}): string {
  const { transactions, showProfitSummary } = params;
  const headers = [
    "No Struk",
    "Tanggal & Waktu",
    "Meja / Order",
    "Pelanggan / Kasir",
    "Status",
    "Metode Bayar",
    "Rincian Pembayaran",
    "Item Terjual",
    "Diskon (Rp)",
    "Total Penjualan (Rp)"
  ];
  if (showProfitSummary) {
    headers.push("Total Modal HPP (Rp)", "Laba Kotor (Rp)");
  }

  const rows: string[] = [headers.map(escapeCsvCell).join(",")];

  for (const tx of transactions) {
    const dt = new Date(tx.createdAt);
    const dateTime = Number.isNaN(dt.getTime())
      ? ""
      : `${dt.toLocaleDateString("id-ID")} ${dt.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit"
        })}`;
    const paymentDetail =
      tx.paymentMethod === "SPLIT" && Array.isArray(tx.payments) && tx.payments.length > 0
        ? tx.payments
            .map(
              (p) =>
                `${getPaymentMethodDisplayLabel(p.method)}: ${p.amount.toLocaleString("id-ID")}`
            )
            .join(" + ")
        : `${getPaymentMethodDisplayLabel(tx.paymentMethod)}: ${tx.totalAmount.toLocaleString("id-ID")}`;

    const itemsSummary = tx.items
      .map(
        (it) =>
          `${it.quantity}x ${it.product.name}${it.variant ? ` (${it.variant.name})` : ""}`
      )
      .join("; ");

    const cols: Array<string | number> = [
      tx.receiptNumber,
      dateTime,
      tx.tableOrQueueNumber || "-",
      tx.customerName || "Pelanggan Kasir",
      tx.status === "VOIDED" ? "BATAL (VOID)" : "SELESAI",
      formatPosPaymentBreakdown(tx),
      paymentDetail,
      itemsSummary,
      tx.discountAmount || 0,
      tx.status === "VOIDED" ? 0 : tx.totalAmount
    ];

    if (showProfitSummary) {
      if (tx.status === "VOIDED") {
        cols.push(0, 0);
      } else {
        const { totalCogs, knownCostLines } = computeTransactionCogs(tx);
        const grossProfit =
          knownCostLines > 0 ? Math.max(0, tx.totalAmount - (tx.taxAmount || 0) - totalCogs) : 0;
        cols.push(totalCogs, grossProfit);
      }
    }

    rows.push(cols.map(escapeCsvCell).join(","));
  }

  return `\uFEFF${rows.join("\r\n")}`;
}

export interface PosChargeConfig {
  taxEnabled?: boolean;
  taxPercent?: number;
  serviceChargeEnabled?: boolean;
  serviceChargePercent?: number;
}

/**
 * Computes consistent POS tax, service charge, and grand total from discounted cart base.
 */
export function calculatePosChargeBreakdown(
  discountedBase: number,
  config?: PosChargeConfig | null
): {
  taxAmount: number;
  serviceChargeAmount: number;
  finalTotal: number;
} {
  const base = Math.max(0, Math.round(discountedBase || 0));
  const taxAmount = config?.taxEnabled
    ? Math.round((base * Number(config.taxPercent || 0)) / 100)
    : 0;
  const serviceChargeAmount = config?.serviceChargeEnabled
    ? Math.round((base * Number(config.serviceChargePercent || 0)) / 100)
    : 0;
  return {
    taxAmount,
    serviceChargeAmount,
    finalTotal: base + taxAmount + serviceChargeAmount
  };
}

