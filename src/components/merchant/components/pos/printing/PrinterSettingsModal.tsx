import React, { useState } from "react";
import {
  Bluetooth,
  Cable,
  ChefHat,
  Printer,
  RefreshCw,
  Scissors,
  Smartphone,
  X,
  Check
} from "lucide-react";
import type { ThemeType } from "../../../../../theme";
import type { MerchantStore } from "../../../types";
import {
  DEFAULT_KITCHEN_PRINTER,
  isAndroidMobileBrowser,
  isCapacitorNativeAndroid,
  listPairedBluetoothPrinters,
  loadPrinterSettings,
  runThermalPrinterTest,
  savePrinterSettings,
  selectWebSerialPrinterPort,
  supportsWebSerial
} from "./thermalPrintService";
import type {
  KitchenPrinterSettings,
  PairedBluetoothPrinter,
  PaperWidth,
  PrinterConnectionMode,
  ThermalPrinterSettings,
  WebSerialBaudRate
} from "./printerTypes";

interface PrinterSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeType;
  store: MerchantStore | null;
  onNotify?: (message: string) => void;
}

export const PrinterSettingsModal: React.FC<PrinterSettingsModalProps> = ({
  isOpen,
  onClose,
  theme,
  store,
  onNotify
}) => {
  const [settings, setSettings] = useState<ThermalPrinterSettings>(() => loadPrinterSettings());
  const [pairedPrinters, setPairedPrinters] = useState<PairedBluetoothPrinter[]>([]);
  const [isScanningBt, setIsScanningBt] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isTestingKitchen, setIsTestingKitchen] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<{ type: "ok" | "err"; text: string } | null>(
    null
  );

  const isNativeApk = isCapacitorNativeAndroid();
  const hasWebSerial = supportsWebSerial();
  const isAndroidChrome = isAndroidMobileBrowser();

  if (!isOpen) return null;

  const kitchenSettings: KitchenPrinterSettings = settings.kitchenPrinter || {
    ...DEFAULT_KITCHEN_PRINTER
  };

  const updateSettings = (patch: Partial<ThermalPrinterSettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    savePrinterSettings(next);
  };

  const updateKitchenSettings = (patch: Partial<KitchenPrinterSettings>) => {
    const nextKitchen: KitchenPrinterSettings = {
      ...kitchenSettings,
      ...patch
    };
    const next: ThermalPrinterSettings = {
      ...settings,
      kitchenPrinter: nextKitchen
    };
    setSettings(next);
    savePrinterSettings(next);
  };

  const handleLoadBluetoothPrinters = async () => {
    setIsScanningBt(true);
    setStatusFeedback(null);
    try {
      const devices = await listPairedBluetoothPrinters();
      setPairedPrinters(devices);
      if (devices.length === 0) {
        setStatusFeedback({
          type: "err",
          text: "Belum ada printer Bluetooth yang di-pair di pengaturan Bluetooth Android HP ini."
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal membaca daftar Bluetooth.";
      setStatusFeedback({ type: "err", text: msg });
    } finally {
      setIsScanningBt(false);
    }
  };

  const handleSelectSerialPort = async (target: "receipt" | "kitchen" = "receipt") => {
    setStatusFeedback(null);
    try {
      await selectWebSerialPrinterPort(target);
      if (target === "kitchen") {
        updateKitchenSettings({ connectionMode: "webserial" });
        setStatusFeedback({
          type: "ok",
          text: "Port USB khusus printer dapur berhasil dipilih."
        });
      } else {
        updateSettings({ connectionMode: "webserial" });
        setStatusFeedback({
          type: "ok",
          text: "Port printer USB/Serial berhasil dipilih untuk cetak 1-klik."
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Pemilihan port USB dibatalkan.";
      setStatusFeedback({ type: "err", text: msg });
    }
  };

  const handleTestPrint = async (target: "receipt" | "kitchen" = "receipt") => {
    if (target === "kitchen") {
      setIsTestingKitchen(true);
    } else {
      setIsTesting(true);
    }
    setStatusFeedback(null);
    try {
      const res = await runThermalPrinterTest(store, settings, target);
      setStatusFeedback({
        type: res.ok ? "ok" : "err",
        text: res.message
      });
      if (res.ok && onNotify) {
        onNotify(res.message);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menjalankan tes cetak.";
      setStatusFeedback({ type: "err", text: msg });
    } finally {
      setIsTesting(false);
      setIsTestingKitchen(false);
    }
  };

  const modeOptions: Array<{
    id: PrinterConnectionMode;
    label: string;
    desc: string;
    icon: React.ReactNode;
  }> = [
    {
      id: "auto",
      label: "Otomatis (Hybrid)",
      desc: isNativeApk
        ? "Pakai Bluetooth jika sudah dipilih, atau fallback ke OS"
        : "Pakai USB Direct jika aktif di PC, atau dialog cetak OS",
      icon: <Printer size={15} />
    },
    {
      id: "system",
      label: "Printer Kabel / Driver OS",
      desc: "Cocok untuk kasir PC/Laptop Windows & Mac (USB / LAN)",
      icon: <Cable size={15} />
    },
    ...(hasWebSerial
      ? [
          {
            id: "webserial" as PrinterConnectionMode,
            label: "USB Direct 1-Klik (Chrome PC)",
            desc: "Cetak langsung ke kabel USB/Serial tanpa dialog print",
            icon: <Cable size={15} />
          }
        ]
      : []),
    ...(isNativeApk
      ? [
          {
            id: "bluetooth" as PrinterConnectionMode,
            label: "Bluetooth Thermal (APK Native)",
            desc: "Cetak langsung ke printer Bluetooth SPP (EPPOS, Blueprint, RPP02)",
            icon: <Bluetooth size={15} />
          }
        ]
      : []),
    ...(isAndroidChrome
      ? [
          {
            id: "rawbt" as PrinterConnectionMode,
            label: "RawBT Bridge (Browser HP)",
            desc: "Kirim struk ESC/POS via aplikasi pendamping RawBT di Chrome Android",
            icon: <Smartphone size={15} />
          }
        ]
      : [])
  ];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10050,
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(5px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16
      }}
    >
      <div
        style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: 18,
          width: "100%",
          maxWidth: 440,
          maxHeight: "90dvh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 24px 48px rgba(0,0,0,0.32)"
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 18px",
            borderBottom: `1px solid ${theme.border}`,
            background: theme.surface2
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Printer size={18} color={theme.ink} />
            <div>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: theme.ink }}>
                Pengaturan Printer Thermal
              </h3>
              <p style={{ margin: 0, fontSize: 11, color: theme.inkSoft }}>
                Hybrid PC Kabel & Android Bluetooth
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: theme.inkSoft,
              padding: 4
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div
          style={{
            padding: 18,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 16
          }}
        >
          {/* Paper Width Selector */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: theme.ink, marginBottom: 8 }}>
              Ukuran Kertas Struk
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {(["58mm", "80mm"] as PaperWidth[]).map((w) => {
                const active = settings.paperWidth === w;
                return (
                  <button
                    key={w}
                    type="button"
                    onClick={() =>
                      updateSettings({
                        paperWidth: w,
                        autoCut: w === "80mm" ? true : settings.autoCut
                      })
                    }
                    style={{
                      padding: "10px 12px",
                      borderRadius: 10,
                      border: `1.5px solid ${active ? theme.ink : theme.border}`,
                      background: active ? theme.surface2 : theme.surface,
                      color: theme.ink,
                      textAlign: "left",
                      cursor: "pointer"
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{w}</div>
                    <div style={{ fontSize: 11, color: theme.inkSoft }}>
                      {w === "58mm" ? "32 kolom (Mini / BT)" : "48 kolom (Kasir PC)"}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Connection Mode */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: theme.ink, marginBottom: 8 }}>
              Jalur Koneksi Printer
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {modeOptions.map((opt) => {
                const active = settings.connectionMode === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => updateSettings({ connectionMode: opt.id })}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      padding: "10px 12px",
                      borderRadius: 10,
                      border: `1.5px solid ${active ? theme.ink : theme.border}`,
                      background: active ? theme.surface2 : theme.surface,
                      color: theme.ink,
                      textAlign: "left",
                      cursor: "pointer"
                    }}
                  >
                    <div style={{ marginTop: 2 }}>{opt.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{opt.label}</div>
                      <div style={{ fontSize: 11, color: theme.inkSoft }}>{opt.desc}</div>
                    </div>
                    {active && <Check size={16} color={theme.ink} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bluetooth Pairing Panel (Capacitor Android Native) */}
          {isNativeApk &&
            (settings.connectionMode === "bluetooth" || settings.connectionMode === "auto") && (
              <div
                style={{
                  padding: 12,
                  borderRadius: 12,
                  border: `1px solid ${theme.border}`,
                  background: theme.surface2,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: theme.ink }}>
                      Printer Bluetooth Terpilih
                    </div>
                    <div style={{ fontSize: 11, color: theme.inkSoft }}>
                      {settings.bluetoothName
                        ? `${settings.bluetoothName} (${settings.bluetoothAddress})`
                        : "Belum ada printer dipilih"}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleLoadBluetoothPrinters}
                    disabled={isScanningBt}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "7px 11px",
                      borderRadius: 8,
                      border: `1px solid ${theme.border}`,
                      background: theme.surface,
                      color: theme.ink,
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: "pointer"
                    }}
                  >
                    <RefreshCw size={13} />
                    <span>{isScanningBt ? "Memuat..." : "Cari Printer"}</span>
                  </button>
                </div>

                {pairedPrinters.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {pairedPrinters.map((dev) => {
                      const selected = settings.bluetoothAddress === dev.address;
                      return (
                        <button
                          key={dev.address}
                          type="button"
                          onClick={() =>
                            updateSettings({
                              bluetoothAddress: dev.address,
                              bluetoothName: dev.name,
                              connectionMode: "bluetooth"
                            })
                          }
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "8px 10px",
                            borderRadius: 8,
                            border: `1px solid ${selected ? theme.ink : theme.border}`,
                            background: theme.surface,
                            color: theme.ink,
                            cursor: "pointer",
                            textAlign: "left"
                          }}
                        >
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 600 }}>{dev.name}</div>
                            <div style={{ fontSize: 10, color: theme.inkSoft }}>{dev.address}</div>
                          </div>
                          {selected && <Check size={14} color={theme.ink} />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

          {/* WebSerial Direct USB Settings (Desktop Chrome/Edge) */}
          {hasWebSerial && settings.connectionMode === "webserial" && (
            <div
              style={{
                padding: 12,
                borderRadius: 12,
                border: `1px solid ${theme.border}`,
                background: theme.surface2,
                display: "flex",
                flexDirection: "column",
                gap: 10
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: theme.ink }}>
                    Port Kabel USB / Serial
                  </div>
                  <div style={{ fontSize: 11, color: theme.inkSoft }}>
                    Pilih port COM/USB printer kasir Anda
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => void handleSelectSerialPort("receipt")}
                  style={{
                    padding: "7px 12px",
                    borderRadius: 8,
                    border: `1px solid ${theme.border}`,
                    background: theme.surface,
                    color: theme.ink,
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: "pointer",
                    whiteSpace: "nowrap"
                  }}
                >
                  Pilih Port USB
                </button>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: theme.ink }}>Baud Rate Printer</span>
                <select
                  value={settings.baudRate}
                  onChange={(e) =>
                    updateSettings({ baudRate: Number(e.target.value) as WebSerialBaudRate })
                  }
                  style={{
                    padding: "5px 8px",
                    borderRadius: 8,
                    border: `1px solid ${theme.border}`,
                    background: theme.surface,
                    color: theme.ink,
                    fontSize: 12
                  }}
                >
                  <option value={9600}>9600 bps (Standar)</option>
                  <option value={19200}>19200 bps</option>
                  <option value={38400}>38400 bps</option>
                  <option value={115200}>115200 bps (Cepat)</option>
                </select>
              </div>
            </div>
          )}

          {/* Auto-Cut Option */}
          <label
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 12px",
              borderRadius: 10,
              border: `1px solid ${theme.border}`,
              background: theme.surface,
              cursor: "pointer"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Scissors size={15} color={theme.inkSoft} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: theme.ink }}>
                  Auto-Cut Kertas (ESC/POS)
                </div>
                <div style={{ fontSize: 10, color: theme.inkSoft }}>
                  Aktifkan jika printer 80mm mendukung pemotong otomatis
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.autoCut}
              onChange={(e) => updateSettings({ autoCut: e.target.checked })}
            />
          </label>

          {/* Optional Separate Kitchen / Bar Printer */}
          <div
            style={{
              borderRadius: 12,
              border: `1px solid ${kitchenSettings.enabled ? theme.accent : theme.border}`,
              background: kitchenSettings.enabled ? theme.surface2 : theme.surface,
              overflow: "hidden"
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 12px",
                cursor: "pointer"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <ChefHat size={15} color={kitchenSettings.enabled ? theme.accent : theme.inkSoft} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: theme.ink }}>
                    Printer Khusus Dapur / Bar (Opsional)
                  </div>
                  <div style={{ fontSize: 10, color: theme.inkSoft }}>
                    {kitchenSettings.enabled
                      ? "Tiket dapur dikirim ke printer terpisah ini"
                      : "Nonaktif: tiket dapur ikut printer utama kasir"}
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={kitchenSettings.enabled}
                onChange={(e) => updateKitchenSettings({ enabled: e.target.checked })}
              />
            </label>

            {kitchenSettings.enabled && (
              <div
                style={{
                  padding: "12px",
                  borderTop: `1px solid ${theme.border}`,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10
                }}
              >
                <div style={{ display: "flex", gap: 8 }}>
                  {(["58mm", "80mm"] as PaperWidth[]).map((w) => {
                    const active = kitchenSettings.paperWidth === w;
                    return (
                      <button
                        key={w}
                        type="button"
                        onClick={() =>
                          updateKitchenSettings({
                            paperWidth: w,
                            autoCut: w === "80mm" ? true : kitchenSettings.autoCut
                          })
                        }
                        style={{
                          flex: 1,
                          padding: "7px 10px",
                          borderRadius: 8,
                          border: `1.5px solid ${active ? theme.ink : theme.border}`,
                          background: active ? theme.surface : "transparent",
                          color: theme.ink,
                          fontSize: 11.5,
                          fontWeight: 700,
                          cursor: "pointer"
                        }}
                      >
                        Kertas Dapur {w}
                      </button>
                    );
                  })}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: theme.inkSoft }}>
                    Jalur Printer Dapur
                  </span>
                  <select
                    value={kitchenSettings.connectionMode}
                    onChange={(e) =>
                      updateKitchenSettings({
                        connectionMode: e.target.value as PrinterConnectionMode
                      })
                    }
                    style={{
                      padding: "8px 10px",
                      borderRadius: 8,
                      border: `1px solid ${theme.border}`,
                      background: theme.surface,
                      color: theme.ink,
                      fontSize: 12,
                      fontWeight: 600
                    }}
                  >
                    {modeOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {isNativeApk &&
                  (kitchenSettings.connectionMode === "bluetooth" ||
                    kitchenSettings.connectionMode === "auto") && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ fontSize: 11, color: theme.inkSoft }}>
                          {kitchenSettings.bluetoothName
                            ? `BT Dapur: ${kitchenSettings.bluetoothName}`
                            : "Belum pilih Bluetooth dapur"}
                        </div>
                        <button
                          type="button"
                          onClick={handleLoadBluetoothPrinters}
                          disabled={isScanningBt}
                          style={{
                            padding: "5px 9px",
                            borderRadius: 7,
                            border: `1px solid ${theme.border}`,
                            background: theme.surface,
                            color: theme.ink,
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: "pointer"
                          }}
                        >
                          {isScanningBt ? "Memuat..." : "Cari BT"}
                        </button>
                      </div>
                      {pairedPrinters.length > 0 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          {pairedPrinters.map((dev) => {
                            const selected = kitchenSettings.bluetoothAddress === dev.address;
                            return (
                              <button
                                key={`kitchen-${dev.address}`}
                                type="button"
                                onClick={() =>
                                  updateKitchenSettings({
                                    bluetoothAddress: dev.address,
                                    bluetoothName: dev.name,
                                    connectionMode: "bluetooth"
                                  })
                                }
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  padding: "6px 9px",
                                  borderRadius: 7,
                                  border: `1px solid ${selected ? theme.ink : theme.border}`,
                                  background: theme.surface,
                                  color: theme.ink,
                                  fontSize: 11,
                                  cursor: "pointer",
                                  textAlign: "left"
                                }}
                              >
                                <span>
                                  {dev.name} ({dev.address})
                                </span>
                                {selected && <Check size={13} color={theme.ink} />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                {hasWebSerial && kitchenSettings.connectionMode === "webserial" && (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                    <select
                      value={kitchenSettings.baudRate}
                      onChange={(e) =>
                        updateKitchenSettings({
                          baudRate: Number(e.target.value) as WebSerialBaudRate
                        })
                      }
                      style={{
                        padding: "6px 8px",
                        borderRadius: 8,
                        border: `1px solid ${theme.border}`,
                        background: theme.surface,
                        color: theme.ink,
                        fontSize: 11.5
                      }}
                    >
                      <option value={9600}>9600 bps</option>
                      <option value={19200}>19200 bps</option>
                      <option value={38400}>38400 bps</option>
                      <option value={115200}>115200 bps</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => void handleSelectSerialPort("kitchen")}
                      style={{
                        padding: "6px 10px",
                        borderRadius: 8,
                        border: `1px solid ${theme.border}`,
                        background: theme.surface,
                        color: theme.ink,
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: "pointer"
                      }}
                    >
                      Pilih Port USB Dapur
                    </button>
                  </div>
                )}

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: theme.ink, cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={kitchenSettings.autoCut}
                      onChange={(e) => updateKitchenSettings({ autoCut: e.target.checked })}
                    />
                    <span>Auto-Cut Dapur</span>
                  </label>
                  <button
                    type="button"
                    disabled={isTestingKitchen}
                    onClick={() => void handleTestPrint("kitchen")}
                    style={{
                      padding: "6px 11px",
                      borderRadius: 8,
                      border: `1px solid ${theme.border}`,
                      background: theme.surface,
                      color: theme.ink,
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    {isTestingKitchen ? "Mengirim..." : "Tes Printer Dapur"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {statusFeedback && (
            <div
              style={{
                padding: "9px 12px",
                borderRadius: 10,
                fontSize: 12,
                background: statusFeedback.type === "ok" ? "#ECFDF5" : "#FEF2F2",
                color: statusFeedback.type === "ok" ? "#065F46" : "#991B1B",
                border: `1px solid ${statusFeedback.type === "ok" ? "#A7F3D0" : "#FECACA"}`
              }}
            >
              {statusFeedback.text}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: "12px 18px",
            borderTop: `1px solid ${theme.border}`,
            display: "flex",
            gap: 10
          }}
        >
          <button
            type="button"
            disabled={isTesting}
            onClick={() => void handleTestPrint("receipt")}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: 10,
              border: `1px solid ${theme.border}`,
              background: theme.surface2,
              color: theme.ink,
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            {isTesting ? "Mengirim Tes..." : "Tes Cetak"}
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: 10,
              border: "none",
              background: theme.isDark ? "#24282D" : "#191C1F",
              color: "#FFFFFF",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            Simpan & Tutup
          </button>
        </div>
      </div>

      {/* Hidden Printable Test Slip for PC System Print Dialog */}
      <div id="sera-thermal-test-page" style={{ display: "none" }}>
        <div style={{ textAlign: "center", fontWeight: "bold", fontSize: 13 }}>
          {store?.name || "MITRA SERA"}
        </div>
        <div style={{ textAlign: "center", fontSize: 10 }}>
          TES CETAK PRINTER THERMAL
        </div>
        <div style={{ borderTop: "1px dashed #000", margin: "4px 0" }} />
        <div style={{ fontSize: 10 }}>Kertas: {settings.paperWidth}</div>
        <div style={{ fontSize: 10 }}>Mode: Dialog OS (PC USB / LAN)</div>
        <div style={{ fontSize: 10 }}>Status: Printer siap digunakan</div>
        <div style={{ borderTop: "1px dashed #000", margin: "4px 0" }} />
        <div style={{ textAlign: "center", fontSize: 9 }}>SERA POS Hybrid Print</div>
      </div>
    </div>
  );
};
