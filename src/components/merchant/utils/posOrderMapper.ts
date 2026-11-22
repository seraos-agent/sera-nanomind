import type { MerchantOrder, PosPaymentPart } from "../types";
import { getPaymentMethodDisplayLabel } from "./posPaymentUtils";

/**
 * Formats a timestamp or date string into DD/MM/YY • HH:MM for MerchantOrder cards.
 */
function formatPosTimestamp(createdAt: number | string | undefined): string {
  const d = createdAt ? new Date(createdAt) : new Date();
  if (Number.isNaN(d.getTime())) return String(createdAt || "");
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${String(d.getFullYear()).slice(-2)} • ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

/**
 * Resolves a numeric millisecond timestamp for sorting mixed online and POS orders newest-first.
 */
export function getOrderSortTimestamp(order: MerchantOrder): number {
  if (typeof order.createdAtTs === "number" && Number.isFinite(order.createdAtTs)) {
    return order.createdAtTs;
  }
  const raw = String(order.createdAt || "").trim();
  const match = raw.match(/^(\d{2})\/(\d{2})\/(\d{2,4})\s*[•·-]\s*(\d{2}):(\d{2})/);
  if (match) {
    const day = Number(match[1]);
    const month = Number(match[2]) - 1;
    const yrRaw = Number(match[3]);
    const year = yrRaw < 100 ? 2000 + yrRaw : yrRaw;
    const hour = Number(match[4]);
    const min = Number(match[5]);
    const parsed = new Date(year, month, day, hour, min).getTime();
    if (Number.isFinite(parsed)) return parsed;
  }
  const isoParsed = Date.parse(raw);
  return Number.isFinite(isoParsed) ? isoParsed : 0;
}

/**
 * Determines whether a MerchantOrder originated from offline/cashier POS rather than online marketplace checkout.
 */
export function isPosOrder(order?: MerchantOrder | null): boolean {
  if (!order) return false;
  if (order.orderSource === "POS") return true;
  if (order.posTransactionId || order.posReceiptNumber) return true;
  const idStr = String(order.id || "");
  return idStr.startsWith("STR-") || idStr.startsWith("POS-");
}

/**
 * Converts a cloud or local POS transaction object into a normalized MerchantOrder
 * for unified reconciliation in the Merchant Sales (Completed) view.
 */
export function mapPosTransactionToMerchantOrder(tx: any): MerchantOrder {
  const receiptNo = String(tx?.receiptNumber || tx?.id || `STR-${Date.now().toString().slice(-6)}`);
  const itemsList: any[] = Array.isArray(tx?.items) ? tx.items : [];
  const itemsSummary =
    itemsList
      .map((it) => {
        const name = it.name || it.product?.name || "Product";
        const variantName = it.variantName || it.variant?.name;
        const qty = Number(it.quantity || 1);
        const notes = it.notes ? ` [${it.notes}]` : "";
        return `${qty}x ${name}${variantName ? ` (${variantName})` : ""}${notes}`;
      })
      .join(", ") || "POS Transaction";

  const tableLabel = tx?.tableOrQueueNumber ? String(tx.tableOrQueueNumber).trim() : undefined;
  const rawCustomer = tx?.customerName ? String(tx.customerName).trim() : "";
  const customerName =
    rawCustomer && !rawCustomer.startsWith("Kasir •") && !rawCustomer.startsWith("Cashier •")
      ? rawCustomer
      : "Walk-In Customer";

  const isVoided = tx?.status === "VOIDED";
  const paymentParts: PosPaymentPart[] = Array.isArray(tx?.payments) ? tx.payments : [];
  const paymentLabel =
    tx?.paymentMethod === "SPLIT" && paymentParts.length > 1
      ? paymentParts.map((p) => getPaymentMethodDisplayLabel(p.method)).join(" + ")
      : String(tx?.paymentMethod || "CASH");

  return {
    id: receiptNo,
    customerName,
    customerPhone: tx?.customerPhone ? String(tx.customerPhone) : "-",
    itemsSummary,
    totalAmount: Number(tx?.totalAmount || 0),
    paymentMethod: paymentLabel,
    paymentStatus: "PAID",
    status: isVoided ? "CANCELLED" : "COMPLETED",
    createdAt: formatPosTimestamp(tx?.createdAt),
    shippingMethod: "PICKUP",
    orderSource: "POS",
    posTransactionId: tx?.id ? String(tx.id) : undefined,
    posReceiptNumber: receiptNo,
    cashierName: tx?.cashierName ? String(tx.cashierName) : "Store Owner",
    tableOrQueueNumber: tableLabel,
    posVoided: isVoided,
    createdAtTs: typeof tx?.createdAt === "number" ? tx.createdAt : Date.parse(String(tx?.createdAt || "")) || Date.now()
  };
}
