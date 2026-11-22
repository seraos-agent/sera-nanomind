import { Capacitor, registerPlugin } from "@capacitor/core";
import type { MerchantStore, PosTransaction } from "../../../types";
import {
  buildDailyReportEscPos,
  buildKitchenTicketEscPos,
  buildPosReceiptEscPos,
  buildTestPrintEscPos,
  uint8ToBase64
} from "./escPosEncoder";
import type {
  DailyReportPrintPayload,
  KitchenPrinterSettings,
  KitchenTicketPrintPayload,
  PairedBluetoothPrinter,
  PaperWidth,
  PrintExecutionResult,
  PrintTargetKind,
  ThermalPrinterSettings
} from "./printerTypes";
import type { PosCartItem } from "../../../types";

interface ThermalPrinterPluginInterface {
  isSupported(): Promise<{ supported: boolean; enabled: boolean; hasPermission: boolean }>;
  listPairedPrinters(): Promise<{ printers: PairedBluetoothPrinter[] }>;
  printRawBytes(options: { address: string; dataBase64: string }): Promise<void>;
}

interface WebSerialPort {
  readable: unknown;
  writable: WritableStream<Uint8Array> | null;
  open(options: { baudRate: number }): Promise<void>;
  close(): Promise<void>;
}

interface NavigatorWithSerial extends Navigator {
  serial?: {
    requestPort(options?: { filters?: Array<Record<string, unknown>> }): Promise<WebSerialPort>;
    getPorts(): Promise<WebSerialPort[]>;
  };
}

const ThermalPrinterNative = registerPlugin<ThermalPrinterPluginInterface>("ThermalPrinter");

const SETTINGS_STORAGE_KEY = "sera_pos_printer_settings_v1";
const DYNAMIC_PAGE_STYLE_ID = "sera-dynamic-print-page-style";

let cachedReceiptSerialPort: WebSerialPort | null = null;
let cachedKitchenSerialPort: WebSerialPort | null = null;

export const DEFAULT_KITCHEN_PRINTER: KitchenPrinterSettings = {
  enabled: false,
  paperWidth: "58mm",
  connectionMode: "auto",
  bluetoothAddress: null,
  bluetoothName: null,
  autoCut: false,
  baudRate: 9600
};

const DEFAULT_SETTINGS: ThermalPrinterSettings = {
  paperWidth: "58mm",
  connectionMode: "auto",
  bluetoothAddress: null,
  bluetoothName: null,
  autoCut: false,
  baudRate: 9600,
  kitchenPrinter: { ...DEFAULT_KITCHEN_PRINTER }
};

function normalizeConnectionMode(mode: unknown): ThermalPrinterSettings["connectionMode"] {
  return mode === "system" ||
    mode === "webserial" ||
    mode === "bluetooth" ||
    mode === "rawbt"
    ? mode
    : "auto";
}

function normalizeBaudRate(baud: unknown): ThermalPrinterSettings["baudRate"] {
  return baud === 19200 || baud === 38400 || baud === 115200 ? baud : 9600;
}

export function loadPrinterSettings(): ThermalPrinterSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) {
      return {
        ...DEFAULT_SETTINGS,
        kitchenPrinter: { ...DEFAULT_KITCHEN_PRINTER }
      };
    }
    const parsed = JSON.parse(raw) as Partial<ThermalPrinterSettings>;
    const rawKitchen = parsed.kitchenPrinter;
    return {
      paperWidth: parsed.paperWidth === "80mm" ? "80mm" : "58mm",
      connectionMode: normalizeConnectionMode(parsed.connectionMode),
      bluetoothAddress: parsed.bluetoothAddress || null,
      bluetoothName: parsed.bluetoothName || null,
      autoCut: Boolean(parsed.autoCut),
      baudRate: normalizeBaudRate(parsed.baudRate),
      kitchenPrinter: {
        enabled: Boolean(rawKitchen?.enabled),
        paperWidth: rawKitchen?.paperWidth === "80mm" ? "80mm" : "58mm",
        connectionMode: normalizeConnectionMode(rawKitchen?.connectionMode),
        bluetoothAddress: rawKitchen?.bluetoothAddress || null,
        bluetoothName: rawKitchen?.bluetoothName || null,
        autoCut: Boolean(rawKitchen?.autoCut),
        baudRate: normalizeBaudRate(rawKitchen?.baudRate)
      }
    };
  } catch {
    return {
      ...DEFAULT_SETTINGS,
      kitchenPrinter: { ...DEFAULT_KITCHEN_PRINTER }
    };
  }
}

export function savePrinterSettings(settings: ThermalPrinterSettings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Ignore storage quota exceptions silently
  }
}

export function isCapacitorNativeAndroid(): boolean {
  try {
    return Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android";
  } catch {
    return false;
  }
}

export function supportsWebSerial(): boolean {
  return typeof navigator !== "undefined" && Boolean((navigator as NavigatorWithSerial).serial);
}

export function isAndroidMobileBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android/i.test(navigator.userAgent) && !isCapacitorNativeAndroid();
}

export async function listPairedBluetoothPrinters(): Promise<PairedBluetoothPrinter[]> {
  if (!isCapacitorNativeAndroid()) {
    throw new Error("Bluetooth printer native hanya tersedia di aplikasi Android SERA.");
  }
  const res = await ThermalPrinterNative.listPairedPrinters();
  return Array.isArray(res?.printers) ? res.printers : [];
}

export async function selectWebSerialPrinterPort(
  target: "receipt" | "kitchen" = "receipt"
): Promise<boolean> {
  const nav = navigator as NavigatorWithSerial;
  if (!nav.serial) {
    throw new Error("Browser ini belum mendukung WebSerial. Gunakan Chrome atau Edge di PC.");
  }
  const port = await nav.serial.requestPort();
  if (target === "kitchen") {
    cachedKitchenSerialPort = port;
  } else {
    cachedReceiptSerialPort = port;
  }
  return true;
}

export function hasAuthorizedWebSerialPort(target: "receipt" | "kitchen" = "receipt"): boolean {
  return target === "kitchen" ? cachedKitchenSerialPort !== null : cachedReceiptSerialPort !== null;
}

async function sendBytesOverWebSerial(
  bytes: Uint8Array,
  baudRate: number,
  target: "receipt" | "kitchen" = "receipt"
): Promise<void> {
  const nav = navigator as NavigatorWithSerial;
  if (!nav.serial) {
    throw new Error("WebSerial API is unavailable.");
  }

  let port = target === "kitchen" ? cachedKitchenSerialPort : cachedReceiptSerialPort;
  if (!port) {
    const existing = await nav.serial.getPorts();
    if (existing.length > 0 && target === "receipt") {
      port = existing[0];
      cachedReceiptSerialPort = port;
    } else {
      port = await nav.serial.requestPort();
      if (target === "kitchen") {
        cachedKitchenSerialPort = port;
      } else {
        cachedReceiptSerialPort = port;
      }
    }
  }

  let openedHere = false;
  if (!port.writable) {
    await port.open({ baudRate });
    openedHere = true;
  }

  const writer = port.writable?.getWriter();
  if (!writer) {
    throw new Error("Gagal membuka stream tulis ke port printer USB.");
  }

  try {
    await writer.write(bytes);
  } finally {
    writer.releaseLock();
    if (openedHere) {
      await port.close().catch(() => {});
    }
  }
}

const TARGET_ELEMENT_IDS: Record<PrintTargetKind, string> = {
  receipt: "#sera-thermal-receipt",
  "daily-report": "#sera-thermal-daily-report",
  kitchen: "#sera-thermal-kitchen-ticket",
  "test-page": "#sera-thermal-test-page"
};

export function applyDynamicPrintPageCss(
  paperWidth: PaperWidth,
  target: PrintTargetKind = "receipt"
): void {
  if (typeof document === "undefined") return;
  document.body.dataset.seraPrintTarget = target;
  let styleEl = document.getElementById(DYNAMIC_PAGE_STYLE_ID) as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = DYNAMIC_PAGE_STYLE_ID;
    document.head.appendChild(styleEl);
  }
  const widthCss = paperWidth === "80mm" ? "80mm" : "58mm";
  const targetSelector = TARGET_ELEMENT_IDS[target];
  styleEl.textContent = `
    @media print {
      @page {
        size: ${widthCss} auto;
        margin: 0mm;
      }
      body * {
        visibility: hidden !important;
      }
      ${targetSelector},
      ${targetSelector} * {
        visibility: visible !important;
      }
      ${targetSelector} {
        display: block !important;
        position: fixed !important;
        left: 0 !important;
        top: 0 !important;
        width: ${widthCss} !important;
        max-width: ${widthCss} !important;
        margin: 0 !important;
        padding: 4mm !important;
        background: #FFFFFF !important;
        color: #000000 !important;
        font-family: monospace !important;
        box-shadow: none !important;
        border: none !important;
        z-index: 99999 !important;
      }
    }
  `;
}

type EffectivePrinterConfig = Omit<ThermalPrinterSettings, "kitchenPrinter">;

async function dispatchEscPosOrSystemPrint(
  bytes: Uint8Array,
  settings: EffectivePrinterConfig,
  allowSystemPrint: boolean,
  printTarget: PrintTargetKind = "receipt",
  systemMessage?: string,
  serialTarget: "receipt" | "kitchen" = "receipt"
): Promise<PrintExecutionResult> {
  const mode = resolveEffectiveMode(settings, serialTarget);

  if (mode === "bluetooth") {
    if (!isCapacitorNativeAndroid()) {
      return {
        ok: false,
        channel: "bluetooth",
        message: "Mode Bluetooth native hanya berjalan di aplikasi Android (APK)."
      };
    }
    if (!settings.bluetoothAddress) {
      return {
        ok: false,
        channel: "bluetooth",
        message:
          serialTarget === "kitchen"
            ? "Pilih printer Bluetooth khusus dapur terlebih dahulu di menu Atur Printer."
            : "Pilih printer Bluetooth terlebih dahulu di menu Atur Printer."
      };
    }
    await ThermalPrinterNative.printRawBytes({
      address: settings.bluetoothAddress,
      dataBase64: uint8ToBase64(bytes)
    });
    return {
      ok: true,
      channel: "bluetooth",
      message: `Terkirim ke printer ${settings.bluetoothName || "Bluetooth"}`
    };
  }

  if (mode === "webserial") {
    await sendBytesOverWebSerial(bytes, settings.baudRate, serialTarget);
    return {
      ok: true,
      channel: "webserial",
      message:
        serialTarget === "kitchen"
          ? "Tiket dapur dikirim lewat kabel USB/Serial"
          : "Struk dikirim langsung lewat kabel USB/Serial"
    };
  }

  if (mode === "rawbt") {
    const b64 = uint8ToBase64(bytes);
    window.location.href = `rawbt:base64,${b64}`;
    return {
      ok: true,
      channel: "rawbt",
      message: "Membuka aplikasi bridge RawBT di Android"
    };
  }

  // Fallback: System OS print dialog (PC USB/LAN thermal printer driver)
  if (!allowSystemPrint) {
    return {
      ok: false,
      channel: "system",
      message: "Tes cetak dialog OS tidak memakai ESC/POS. Gunakan mode Bluetooth atau USB Serial."
    };
  }
  applyDynamicPrintPageCss(settings.paperWidth, printTarget);
  window.print();
  return {
    ok: true,
    channel: "system",
    message: systemMessage || `Membuka dialog cetak OS (${settings.paperWidth})`
  };
}

function resolveEffectiveMode(
  settings: EffectivePrinterConfig,
  serialTarget: "receipt" | "kitchen" = "receipt"
): "bluetooth" | "webserial" | "rawbt" | "system" {
  if (settings.connectionMode !== "auto") {
    return settings.connectionMode;
  }
  if (isCapacitorNativeAndroid() && settings.bluetoothAddress) {
    return "bluetooth";
  }
  if (supportsWebSerial() && hasAuthorizedWebSerialPort(serialTarget)) {
    return "webserial";
  }
  return "system";
}

/**
 * Computes unprinted item deltas for incremental kitchen/bar preparation tickets.
 */
export function computeKitchenTicketPlan(cart: PosCartItem[]): {
  deltaItems: PosCartItem[];
  pendingCount: number;
  hasPreviouslySentItems: boolean;
} {
  const deltaItems: PosCartItem[] = [];
  let pendingCount = 0;
  let hasPreviouslySentItems = false;

  for (const item of cart) {
    const sentQty = Math.max(0, Math.min(item.quantity, item.kitchenSentQty || 0));
    if (sentQty > 0) {
      hasPreviouslySentItems = true;
    }
    const delta = item.quantity - sentQty;
    if (delta > 0) {
      pendingCount += delta;
      const unitPrice = item.variant ? item.variant.price : item.product.price;
      deltaItems.push({
        ...item,
        quantity: delta,
        subtotal: delta * unitPrice
      });
    }
  }

  return { deltaItems, pendingCount, hasPreviouslySentItems };
}

export async function printPosReceiptHybrid(
  tx: PosTransaction,
  store: MerchantStore | null
): Promise<PrintExecutionResult> {
  const settings = loadPrinterSettings();
  const bytes = buildPosReceiptEscPos(tx, store, {
    paperWidth: settings.paperWidth,
    autoCut: settings.autoCut
  });
  return dispatchEscPosOrSystemPrint(bytes, settings, true, "receipt", undefined, "receipt");
}

export async function printKitchenTicketHybrid(
  payload: KitchenTicketPrintPayload
): Promise<PrintExecutionResult> {
  const settings = loadPrinterSettings();
  const useSeparateKitchen = Boolean(settings.kitchenPrinter?.enabled);
  const effectiveConfig: EffectivePrinterConfig = useSeparateKitchen
    ? settings.kitchenPrinter!
    : settings;

  const bytes = buildKitchenTicketEscPos(payload, {
    paperWidth: effectiveConfig.paperWidth,
    autoCut: effectiveConfig.autoCut
  });
  return dispatchEscPosOrSystemPrint(
    bytes,
    effectiveConfig,
    true,
    "kitchen",
    `${payload.isAdditionalOrder ? "Tambahan dapur" : "Tiket dapur"} siap dicetak (${effectiveConfig.paperWidth})`,
    useSeparateKitchen ? "kitchen" : "receipt"
  );
}

export async function printDailyReportHybrid(
  store: MerchantStore | null,
  report: DailyReportPrintPayload
): Promise<PrintExecutionResult> {
  const settings = loadPrinterSettings();
  const bytes = buildDailyReportEscPos(store, report, {
    paperWidth: settings.paperWidth,
    autoCut: settings.autoCut
  });
  return dispatchEscPosOrSystemPrint(bytes, settings, true, "daily-report", undefined, "receipt");
}

export async function runThermalPrinterTest(
  store: MerchantStore | null,
  overrideSettings?: ThermalPrinterSettings,
  target: "receipt" | "kitchen" = "receipt"
): Promise<PrintExecutionResult> {
  const allSettings = overrideSettings || loadPrinterSettings();
  const effectiveConfig: EffectivePrinterConfig =
    target === "kitchen" && allSettings.kitchenPrinter
      ? allSettings.kitchenPrinter
      : allSettings;

  const bytes = buildTestPrintEscPos(store, {
    paperWidth: effectiveConfig.paperWidth,
    autoCut: effectiveConfig.autoCut
  });
  const mode = resolveEffectiveMode(effectiveConfig, target);
  if (mode === "system") {
    applyDynamicPrintPageCss(effectiveConfig.paperWidth, "test-page");
    window.print();
    return {
      ok: true,
      channel: "system",
      message: `Tes dialog cetak OS (${effectiveConfig.paperWidth}) dibuka`
    };
  }
  return dispatchEscPosOrSystemPrint(bytes, effectiveConfig, false, "test-page", undefined, target);
}
