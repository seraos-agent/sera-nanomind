import type { MerchantStore, PosTransaction } from "../../../types";
import { getPaymentMethodDisplayLabel } from "../../../utils/posPaymentUtils";
import type { DailyReportPrintPayload, KitchenTicketPrintPayload, PaperWidth } from "./printerTypes";

/**
 * Pure TypeScript ESC/POS receipt & daily report encoder.
 * Supports 58mm (32 columns) and 80mm (48 columns) thermal paper widths
 * with clean ASCII normalization and optional auto-cutter commands.
 */

const ESC = 0x1b;
const GS = 0x1d;

function sanitizeAscii(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7e]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getColumnCount(paperWidth: PaperWidth): number {
  return paperWidth === "80mm" ? 48 : 32;
}

function wrapText(text: string, maxWidth: number): string[] {
  const clean = sanitizeAscii(text);
  if (!clean) return [""];
  const words = clean.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    if (word.length > maxWidth) {
      if (current) {
        lines.push(current);
        current = "";
      }
      for (let i = 0; i < word.length; i += maxWidth) {
        lines.push(word.slice(i, i + maxWidth));
      }
      continue;
    }

    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxWidth) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines.length > 0 ? lines : [""];
}

function formatLeftRight(left: string, right: string, cols: number): string[] {
  const cleanRight = sanitizeAscii(right);
  const cleanLeft = sanitizeAscii(left);
  const minGap = 1;

  if (cleanLeft.length + minGap + cleanRight.length <= cols) {
    const spaces = " ".repeat(cols - cleanLeft.length - cleanRight.length);
    return [`${cleanLeft}${spaces}${cleanRight}`];
  }

  // Wrap left text while pinning right text on the final line
  const maxLeftWidth = Math.max(8, cols - cleanRight.length - 1);
  const wrappedLeft = wrapText(cleanLeft, maxLeftWidth);
  const lastIdx = wrappedLeft.length - 1;
  const lastLeft = wrappedLeft[lastIdx];
  const pad = Math.max(1, cols - lastLeft.length - cleanRight.length);
  wrappedLeft[lastIdx] = `${lastLeft}${" ".repeat(pad)}${cleanRight}`;
  return wrappedLeft;
}

class EscPosBuilder {
  private readonly bytes: number[] = [];
  private readonly cols: number;

  constructor(paperWidth: PaperWidth) {
    this.cols = getColumnCount(paperWidth);
    // ESC @ - Initialize printer state
    this.bytes.push(ESC, 0x40);
  }

  public align(mode: "left" | "center" | "right"): this {
    const code = mode === "center" ? 1 : mode === "right" ? 2 : 0;
    this.bytes.push(ESC, 0x61, code);
    return this;
  }

  public bold(enabled: boolean): this {
    this.bytes.push(ESC, 0x45, enabled ? 1 : 0);
    return this;
  }

  public size(normalOrLarge: "normal" | "title"): this {
    // GS ! n (0x00 = normal, 0x11 = double width + double height)
    this.bytes.push(GS, 0x21, normalOrLarge === "title" ? 0x01 : 0x00);
    return this;
  }

  public textLine(line: string): this {
    const ascii = sanitizeAscii(line);
    for (let i = 0; i < ascii.length; i++) {
      this.bytes.push(ascii.charCodeAt(i) & 0x7f);
    }
    this.bytes.push(0x0a);
    return this;
  }

  public wrappedLines(text: string): this {
    for (const line of wrapText(text, this.cols)) {
      this.textLine(line);
    }
    return this;
  }

  public keyValue(left: string, right: string): this {
    for (const line of formatLeftRight(left, right, this.cols)) {
      this.textLine(line);
    }
    return this;
  }

  public divider(char = "-"): this {
    return this.textLine(char.repeat(this.cols));
  }

  public feed(lines = 3): this {
    this.bytes.push(ESC, 0x64, Math.max(1, Math.min(10, lines)));
    return this;
  }

  public cut(partial = true): this {
    // GS V m n (66, 0 = partial feed & cut)
    if (partial) {
      this.bytes.push(GS, 0x56, 66, 0);
    }
    return this;
  }

  public build(): Uint8Array {
    return new Uint8Array(this.bytes);
  }
}

export function uint8ToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const slice = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...slice);
  }
  return btoa(binary);
}

export function buildPosReceiptEscPos(
  tx: PosTransaction,
  store: MerchantStore | null,
  options: { paperWidth: PaperWidth; autoCut: boolean }
): Uint8Array {
  const b = new EscPosBuilder(options.paperWidth);
  const storeName = store?.name || "SERA MERCHANT";
  const storeAddr = store?.address || "Downtown";
  const storeWa = store?.whatsapp || "-";
  const timeStr = new Date(tx.createdAt).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit"
  });
  const dateStr = new Date(tx.createdAt).toLocaleDateString("en-US");

  b.align("center")
    .bold(true)
    .size("title")
    .wrappedLines(storeName)
    .size("normal")
    .bold(false)
    .wrappedLines(storeAddr)
    .wrappedLines(`WA: ${storeWa}`)
    .align("left")
    .divider();

  b.keyValue(`No: ${tx.receiptNumber}`, `${dateStr} ${timeStr}`);
  if (tx.tableOrQueueNumber) {
    b.keyValue("Table/Order", tx.tableOrQueueNumber);
  }
  b.divider();

  for (const item of tx.items) {
    const label = `${item.quantity}x ${item.product.name}${item.variant ? ` (${item.variant.name})` : ""}`;
    const price = `Rp ${item.subtotal.toLocaleString("id-ID")}`;
    b.keyValue(label, price);
  }

  b.divider();
  if (tx.taxAmount && tx.taxAmount > 0) {
    b.keyValue("Tax", `Rp ${tx.taxAmount.toLocaleString("id-ID")}`);
  }
  if (tx.serviceChargeAmount && tx.serviceChargeAmount > 0) {
    b.keyValue("Service", `Rp ${tx.serviceChargeAmount.toLocaleString("id-ID")}`);
  }
  b.bold(true).keyValue("TOTAL", `Rp ${tx.totalAmount.toLocaleString("id-ID")}`).bold(false);

  const totalSavings =
    tx.discountAmount !== undefined
      ? tx.discountAmount
      : tx.items.reduce((sum, it) => {
          if (it.product.originalPrice && it.product.originalPrice > it.product.price) {
            return sum + (it.product.originalPrice - it.product.price) * it.quantity;
          }
          return sum;
        }, 0);

  if (totalSavings > 0) {
    b.keyValue("SAVINGS", `- Rp ${totalSavings.toLocaleString("id-ID")}`);
  }

  if (tx.paymentMethod === "SPLIT" && Array.isArray(tx.payments) && tx.payments.length > 0) {
    b.keyValue("Method", "SPLIT (2 Methods)");
    for (const part of tx.payments) {
      b.keyValue(`  ${getPaymentMethodDisplayLabel(part.method)}`, `Rp ${part.amount.toLocaleString("id-ID")}`);
    }
    if (tx.changeAmount > 0) {
      b.bold(true)
        .keyValue("Change", `Rp ${tx.changeAmount.toLocaleString("id-ID")}`)
        .bold(false);
    }
  } else {
    b.keyValue("Method", getPaymentMethodDisplayLabel(tx.paymentMethod));
    if (tx.paymentMethod === "CASH") {
      b.keyValue("Paid", `Rp ${tx.amountPaid.toLocaleString("id-ID")}`);
      b.bold(true)
        .keyValue("Change", `Rp ${tx.changeAmount.toLocaleString("id-ID")}`)
        .bold(false);
    }
  }

  b.divider()
    .align("center")
    .wrappedLines("Thank you for your visit!")
    .wrappedLines("Printed from SERA POS")
    .feed(options.autoCut ? 4 : 3);

  if (options.autoCut) {
    b.cut(true);
  }

  return b.build();
}

export function buildDailyReportEscPos(
  store: MerchantStore | null,
  report: DailyReportPrintPayload,
  options: { paperWidth: PaperWidth; autoCut: boolean }
): Uint8Array {
  const b = new EscPosBuilder(options.paperWidth);
  const nowDate = new Date().toLocaleDateString("en-US");
  const nowTime = new Date().toLocaleTimeString("en-US");

  b.align("center")
    .bold(true)
    .size("title")
    .wrappedLines(store?.name || "SERA MERCHANT")
    .size("normal")
    .wrappedLines("POS SALES & SHIFT SUMMARY")
    .bold(false)
    .wrappedLines(report.periodLabel ? `${report.periodLabel}` : `${nowDate} ${nowTime}`)
    .align("left")
    .divider();

  b.keyValue("Cash", `Rp ${report.totalCashInDrawer.toLocaleString("id-ID")}`)
    .keyValue("Non-Cash", `Rp ${report.totalNonCash.toLocaleString("id-ID")}`)
    .divider()
    .bold(true)
    .keyValue("TOTAL REVENUE", `Rp ${report.totalRevenue.toLocaleString("id-ID")}`)
    .bold(false);

  if (report.totalCogs && report.totalCogs > 0 && report.grossProfit !== undefined) {
    b.keyValue("Total COGS", `Rp ${report.totalCogs.toLocaleString("id-ID")}`)
      .bold(true)
      .keyValue("Gross Profit", `Rp ${report.grossProfit.toLocaleString("id-ID")}`)
      .bold(false);
  }

  b.keyValue("Transactions", `${report.activeTransactionsCount}`)
    .divider()
    .align("center")
    .wrappedLines("Printed from SERA POS")
    .feed(options.autoCut ? 4 : 3);

  if (options.autoCut) {
    b.cut(true);
  }

  return b.build();
}

export function buildTestPrintEscPos(
  store: MerchantStore | null,
  options: { paperWidth: PaperWidth; autoCut: boolean }
): Uint8Array {
  const b = new EscPosBuilder(options.paperWidth);
  const now = new Date().toLocaleString("en-US");

  b.align("center")
    .bold(true)
    .size("title")
    .wrappedLines(store?.name || "SERA POS TEST")
    .size("normal")
    .bold(false)
    .wrappedLines(`Thermal Printer Test (${options.paperWidth})`)
    .align("left")
    .divider()
    .keyValue("Status", "CONNECTED")
    .keyValue("Paper", options.paperWidth)
    .keyValue("Time", now)
    .divider()
    .align("center")
    .wrappedLines("Ready to print customer receipts!")
    .feed(options.autoCut ? 4 : 3);

  if (options.autoCut) {
    b.cut(true);
  }

  return b.build();
}

/**
 * Encodes a kitchen/barista order ticket (no prices) highlighting table/order mode,
 * quantities, variants, and preparation notes.
 */
export function buildKitchenTicketEscPos(
  payload: KitchenTicketPrintPayload,
  options: { paperWidth: PaperWidth; autoCut: boolean }
): Uint8Array {
  const b = new EscPosBuilder(options.paperWidth);
  const ts = payload.printedAt || Date.now();
  const timeStr = new Date(ts).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit"
  });
  const modeTitle =
    payload.orderType === "TAKEAWAY"
      ? "TAKEAWAY"
      : `DINE-IN: ${payload.tableLabel || "Table"}`;

  const ticketTitle = payload.isAdditionalOrder
    ? "KITCHEN / BAR ADD-ON"
    : payload.isReprint
      ? "KITCHEN REPRINT"
      : "KITCHEN / BARISTA TICKET";

  b.align("center")
    .bold(true)
    .size("title")
    .wrappedLines(ticketTitle)
    .size("normal")
    .wrappedLines(payload.store?.name || "SERA RESTAURANT")
    .divider("=")
    .size("title")
    .wrappedLines(modeTitle)
    .size("normal");
  if (payload.isAdditionalOrder) {
    b.wrappedLines(">>> ADDITIONAL ITEMS <<<");
  }
  b.bold(false)
    .align("left")
    .divider();

  b.keyValue("Time", timeStr);
  if (payload.actorName) {
    b.keyValue("Staff", payload.actorName);
  }
  if (payload.receiptOrBillNumber) {
    b.keyValue("Ref", payload.receiptOrBillNumber);
  }
  b.divider();

  let totalPortions = 0;
  for (const item of payload.items) {
    totalPortions += item.quantity;
    const itemLine = `[ ] ${item.quantity}x ${item.product.name}${
      item.variant ? ` (${item.variant.name})` : ""
    }`;
    b.bold(true).wrappedLines(itemLine).bold(false);
    if (item.notes && item.notes.trim()) {
      b.wrappedLines(`    Note: ${item.notes.trim()}`);
    }
  }

  b.divider()
    .bold(true)
    .keyValue("Total Portions", `${totalPortions} items`)
    .bold(false)
    .divider()
    .align("center")
    .wrappedLines("Prepare in kitchen promptly")
    .feed(options.autoCut ? 4 : 3);

  if (options.autoCut) {
    b.cut(true);
  }

  return b.build();
}
