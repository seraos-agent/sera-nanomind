import { useState } from "react";
import { X, Wallet, Lock, ArrowDownCircle, ArrowUpCircle, CheckCircle2 } from "lucide-react";
import type { ThemeType } from "../../theme";
import type { CashierProfile, CashierShift } from "./types";
import { formatNumberWithDots } from "../merchant/components/products/components/ProductPricingSection";

interface OpenShiftViewProps {
  theme: ThemeType;
  storeName: string;
  cashier: CashierProfile;
  isSubmitting: boolean;
  onOpenShift: (openingCash: number, notes?: string) => Promise<void>;
  onDisconnect: () => void;
}

/**
 * Full-panel shift-start prompt displayed after terminal activation when no shift is open.
 */
export function OpenShiftView({
  theme,
  storeName,
  cashier,
  isSubmitting,
  onOpenShift,
  onDisconnect
}: OpenShiftViewProps) {
  const [openingCashInput, setOpeningCashInput] = useState("0");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numeric = parseInt(openingCashInput.replace(/[^0-9]/g, ""), 10) || 0;
    await onOpenShift(numeric, notes.trim() || undefined);
  };

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: 18,
          padding: 24,
          boxShadow: "0 14px 34px rgba(0,0,0,0.08)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: `${theme.accent}18`,
              color: theme.accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Wallet size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: theme.ink }}>
              Buka Shift Kasir
            </h3>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: theme.inkSoft }}>
              {storeName} • {cashier.name}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: theme.ink, marginBottom: 6 }}>
              Modal Awal Laci Kas (Rp)
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={formatNumberWithDots(openingCashInput)}
              onChange={(e) => setOpeningCashInput(e.target.value.replace(/\D/g, ""))}
              placeholder="Contoh: 200.000"
              autoFocus
              style={{
                width: "100%",
                padding: "11px 14px",
                borderRadius: 10,
                border: `1px solid ${theme.border}`,
                background: theme.surface2,
                color: theme.ink,
                fontSize: 16,
                fontWeight: 700,
                outline: "none",
                boxSizing: "border-box"
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: theme.ink, marginBottom: 6 }}>
              Catatan Shift (Opsional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Shift Pagi"
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: 10,
                border: `1px solid ${theme.border}`,
                background: theme.surface2,
                color: theme.ink,
                fontSize: 13,
                outline: "none",
                boxSizing: "border-box"
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              padding: "12px 16px",
              borderRadius: 12,
              border: "none",
              background: theme.accent,
              color: "#FFFFFF",
              fontSize: 14,
              fontWeight: 700,
              cursor: isSubmitting ? "wait" : "pointer",
              opacity: isSubmitting ? 0.7 : 1
            }}
          >
            {isSubmitting ? "Membuka Shift..." : "Buka Shift & Mulai Kasir"}
          </button>

          <button
            type="button"
            onClick={onDisconnect}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: `1px solid ${theme.border}`,
              background: "transparent",
              color: theme.inkSoft,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            Ganti Kasir / Putus Koneksi
          </button>
        </form>
      </div>
    </div>
  );
}

interface CashMovementModalProps {
  isOpen: boolean;
  theme: ThemeType;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (type: "IN" | "OUT", amount: number, note: string) => Promise<void>;
}

/**
 * Modal for recording petty cash additions or drawer expenses during an active shift.
 */
export function CashMovementModal({
  isOpen,
  theme,
  isSubmitting,
  onClose,
  onSubmit
}: CashMovementModalProps) {
  const [type, setType] = useState<"IN" | "OUT">("OUT");
  const [amountInput, setAmountInput] = useState("");
  const [note, setNote] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(amountInput.replace(/[^0-9]/g, ""), 10) || 0;
    if (amount <= 0 || !note.trim()) return;
    await onSubmit(type, amount, note.trim());
    setAmountInput("");
    setNote("");
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0,0,0,0.65)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: 16,
          padding: 20
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: theme.ink }}>
            Catat Kas Masuk / Keluar
          </h3>
          <button type="button" onClick={onClose} style={{ background: "transparent", border: "none", color: theme.inkSoft, cursor: "pointer" }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <button
              type="button"
              onClick={() => setType("OUT")}
              style={{
                padding: "9px",
                borderRadius: 10,
                border: `1px solid ${type === "OUT" ? "#EF4444" : theme.border}`,
                background: type === "OUT" ? "rgba(239,68,68,0.12)" : theme.surface2,
                color: type === "OUT" ? "#EF4444" : theme.inkSoft,
                fontSize: 12,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                cursor: "pointer"
              }}
            >
              <ArrowUpCircle size={15} /> Kas Keluar
            </button>
            <button
              type="button"
              onClick={() => setType("IN")}
              style={{
                padding: "9px",
                borderRadius: 10,
                border: `1px solid ${type === "IN" ? "#10B981" : theme.border}`,
                background: type === "IN" ? "rgba(16,185,129,0.12)" : theme.surface2,
                color: type === "IN" ? "#10B981" : theme.inkSoft,
                fontSize: 12,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                cursor: "pointer"
              }}
            >
              <ArrowDownCircle size={15} /> Kas Masuk
            </button>
          </div>

          <input
            type="text"
            inputMode="numeric"
            value={formatNumberWithDots(amountInput)}
            onChange={(e) => setAmountInput(e.target.value.replace(/\D/g, ""))}
            placeholder="Nominal (Rp)"
            required
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: `1px solid ${theme.border}`,
              background: theme.surface2,
              color: theme.ink,
              fontSize: 14,
              fontWeight: 600,
              outline: "none"
            }}
          />
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Keterangan"
            required
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: `1px solid ${theme.border}`,
              background: theme.surface2,
              color: theme.ink,
              fontSize: 13,
              outline: "none"
            }}
          />
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              padding: "11px",
              borderRadius: 10,
              border: "none",
              background: theme.accent,
              color: "#fff",
              fontSize: 13,
              fontWeight: 700,
              cursor: isSubmitting ? "wait" : "pointer"
            }}
          >
            {isSubmitting ? "Menyimpan..." : "Simpan Catatan Kas"}
          </button>
        </form>
      </div>
    </div>
  );
}

interface CloseShiftModalProps {
  isOpen: boolean;
  shift: CashierShift | null;
  cashSales: number;
  theme: ThemeType;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirmClose: (actualCash: number, notes?: string) => Promise<void>;
}

/**
 * Modal for closing an active cashier shift and reconciling physical drawer cash.
 */
export function CloseShiftModal({
  isOpen,
  shift,
  cashSales,
  theme,
  isSubmitting,
  onClose,
  onConfirmClose
}: CloseShiftModalProps) {
  const [actualCashInput, setActualCashInput] = useState("");
  const [notes, setNotes] = useState("");

  if (!isOpen || !shift) return null;

  const expectedCash = shift.openingCash + cashSales + shift.cashIn - shift.cashOut;
  const actualCash = parseInt(actualCashInput.replace(/[^0-9]/g, ""), 10) || 0;
  const variance = actualCash - expectedCash;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onConfirmClose(actualCash, notes.trim() || undefined);
    setActualCashInput("");
    setNotes("");
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0,0,0,0.65)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: 18,
          padding: 20
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: theme.ink }}>
            Tutup Shift & Rekonsiliasi Laci
          </h3>
          <button type="button" onClick={onClose} style={{ background: "transparent", border: "none", color: theme.inkSoft, cursor: "pointer" }}>
            <X size={18} />
          </button>
        </div>

        <div
          style={{
            background: theme.surface2,
            border: `1px solid ${theme.border}`,
            borderRadius: 12,
            padding: 12,
            fontSize: 12,
            display: "flex",
            flexDirection: "column",
            gap: 6,
            marginBottom: 14,
            color: theme.inkSoft
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Modal Awal</span>
            <strong style={{ color: theme.ink }}>Rp {shift.openingCash.toLocaleString("id-ID")}</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Penjualan Tunai Shift</span>
            <strong style={{ color: theme.ink }}>Rp {cashSales.toLocaleString("id-ID")}</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Kas Masuk / Keluar</span>
            <strong style={{ color: theme.ink }}>
              +Rp {shift.cashIn.toLocaleString("id-ID")} / -Rp {shift.cashOut.toLocaleString("id-ID")}
            </strong>
          </div>
          <div style={{ borderTop: `1px solid ${theme.border}`, paddingTop: 6, display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontWeight: 700, color: theme.ink }}>Ekspektasi Tunai di Laci</span>
            <strong style={{ color: theme.accent }}>Rp {expectedCash.toLocaleString("id-ID")}</strong>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: theme.ink, marginBottom: 6 }}>
              Uang Fisik Aktual di Laci (Rp)
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={formatNumberWithDots(actualCashInput)}
              onChange={(e) => setActualCashInput(e.target.value.replace(/\D/g, ""))}
              placeholder={expectedCash.toLocaleString("id-ID")}
              required
              autoFocus
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                border: `1px solid ${theme.border}`,
                background: theme.surface2,
                color: theme.ink,
                fontSize: 15,
                fontWeight: 700,
                outline: "none",
                boxSizing: "border-box"
              }}
            />
            {actualCashInput !== "" && (
              <div style={{ marginTop: 6, fontSize: 12, fontWeight: 600, color: variance === 0 ? "#10B981" : "#F59E0B" }}>
                Selisih: {variance >= 0 ? "+" : "-"}Rp {Math.abs(variance).toLocaleString("id-ID")}
              </div>
            )}
          </div>

          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Catatan tutup shift (opsional)"
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: `1px solid ${theme.border}`,
              background: theme.surface2,
              color: theme.ink,
              fontSize: 13,
              outline: "none"
            }}
          />

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              padding: "12px",
              borderRadius: 12,
              border: "none",
              background: theme.accent,
              color: "#fff",
              fontSize: 13,
              fontWeight: 700,
              cursor: isSubmitting ? "wait" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6
            }}
          >
            <CheckCircle2 size={16} />
            <span>{isSubmitting ? "Menutup Shift..." : "Konfirmasi Tutup Shift"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}

interface SupervisorPinModalProps {
  isOpen: boolean;
  theme: ThemeType;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: (pin: string) => Promise<void>;
  title?: string;
  description?: string;
  confirmLabel?: string;
}

/**
 * Prompts for supervisor PIN when a cashier without void permission cancels a transaction or unpaid open bill.
 */
export function SupervisorPinModal({
  isOpen,
  theme,
  isSubmitting,
  onClose,
  onConfirm,
  title = "Otorisasi PIN Supervisor",
  description = "Pembatalan (Void) transaksi membutuhkan PIN Supervisor dari pemilik toko.",
  confirmLabel = "Otorisasi & Void Transaksi"
}: SupervisorPinModalProps) {
  const [pin, setPin] = useState("");
  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) return;
    await onConfirm(pin.trim());
    setPin("");
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 360,
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: 16,
          padding: 20
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Lock size={17} color={theme.accent} />
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: theme.ink }}>
              {title}
            </h3>
          </div>
          <button type="button" onClick={onClose} style={{ background: "transparent", border: "none", color: theme.inkSoft, cursor: "pointer" }}>
            <X size={18} />
          </button>
        </div>

        <p style={{ margin: "0 0 12px", fontSize: 12, color: theme.inkSoft }}>
          {description}
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            type="password"
            inputMode="numeric"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="Masukkan PIN Supervisor"
            autoFocus
            required
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: `1px solid ${theme.border}`,
              background: theme.surface2,
              color: theme.ink,
              fontSize: 15,
              letterSpacing: 3,
              outline: "none"
            }}
          />
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              padding: "11px",
              borderRadius: 10,
              border: "none",
              background: "#EF4444",
              color: "#fff",
              fontSize: 13,
              fontWeight: 700,
              cursor: isSubmitting ? "wait" : "pointer"
            }}
          >
            {isSubmitting ? "Memverifikasi..." : confirmLabel}
          </button>
        </form>
      </div>
    </div>
  );
}
