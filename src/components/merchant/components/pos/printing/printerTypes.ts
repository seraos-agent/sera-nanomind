/**
 * printerTypes.ts - Strongly typed definitions for SERA Hybrid Thermal Printing.
 */

import type { MerchantStore, PosCartItem } from "../../../types";

export type PaperWidth = "58mm" | "80mm";

export type PrintTargetKind = "receipt" | "daily-report" | "kitchen" | "test-page";

export type PrinterConnectionMode =
  | "auto"
  | "system"
  | "webserial"
  | "bluetooth"
  | "rawbt";

export type WebSerialBaudRate = 9600 | 19200 | 38400 | 115200;

export interface KitchenPrinterSettings {
  enabled: boolean;
  paperWidth: PaperWidth;
  connectionMode: PrinterConnectionMode;
  bluetoothAddress: string | null;
  bluetoothName: string | null;
  autoCut: boolean;
  baudRate: WebSerialBaudRate;
}

export interface ThermalPrinterSettings {
  paperWidth: PaperWidth;
  connectionMode: PrinterConnectionMode;
  bluetoothAddress: string | null;
  bluetoothName: string | null;
  autoCut: boolean;
  baudRate: WebSerialBaudRate;
  kitchenPrinter?: KitchenPrinterSettings;
}

export interface PairedBluetoothPrinter {
  name: string;
  address: string;
  bonded?: boolean;
}

export interface PrintExecutionResult {
  ok: boolean;
  channel: "bluetooth" | "webserial" | "rawbt" | "system";
  message: string;
}

export interface DailyReportPrintPayload {
  totalCashInDrawer: number;
  totalNonCash: number;
  totalRevenue: number;
  activeTransactionsCount: number;
  periodLabel?: string;
  totalCogs?: number;
  grossProfit?: number;
}

export interface KitchenTicketPrintPayload {
  store: MerchantStore | null;
  orderType: "DINE_IN" | "TAKEAWAY";
  tableLabel?: string;
  receiptOrBillNumber?: string;
  actorName?: string;
  items: PosCartItem[];
  printedAt?: number;
  isAdditionalOrder?: boolean;
  isReprint?: boolean;
}
