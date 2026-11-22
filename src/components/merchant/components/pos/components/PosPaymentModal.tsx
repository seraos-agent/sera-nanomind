import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowLeftRight,
  Banknote,
  CheckCircle2,
  CreditCard,
  QrCode
} from "lucide-react";
import type { ThemeType } from "../../../../../theme";
import type {
  MerchantStore,
  PosBasePaymentMethod,
  PosPaymentPart
} from "../../../types";
import { formatNumberWithDots } from "../../products/components/ProductPricingSection";

export interface PosPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeType;
  store: MerchantStore | null;
  finalTotal: number;
  totalItemCount: number;
  paymentMethod: PosBasePaymentMethod;
  onSetPaymentMethod: (method: PosBasePaymentMethod) => void;
  cashTendered: string;
  onSetCashTendered: (val: string) => void;
  isCashSufficient: boolean;
  changeAmount: number;
  tenderedNum: number;
  onFinalizeTransaction: (splitPayments?: PosPaymentPart[]) => void;
}

const PAYMENT_OPTIONS: Array<{
  id: PosBasePaymentMethod;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
}> = [
  { id: "CASH", label: "Tunai", icon: Banknote },
  { id: "QRIS", label: "QRIS", icon: QrCode },
  { id: "TRANSFER", label: "Transfer", icon: CreditCard }
];

function pickAlternateMethod(primary: PosBasePaymentMethod): PosBasePaymentMethod {
  return primary === "CASH" ? "QRIS" : "CASH";
}

export const PosPaymentModal: React.FC<PosPaymentModalProps> = ({
  isOpen,
  onClose,
  theme,
  store,
  finalTotal,
  totalItemCount,
  paymentMethod,
  onSetPaymentMethod,
  cashTendered,
  onSetCashTendered,
  isCashSufficient,
  changeAmount,
  tenderedNum,
  onFinalizeTransaction
}) => {
  const [isSplitMode, setIsSplitMode] = useState(false);
  const [splitMethod1, setSplitMethod1] = useState<PosBasePaymentMethod>("CASH");
  const [splitMethod2, setSplitMethod2] = useState<PosBasePaymentMethod>("QRIS");
  const [splitAmount1Raw, setSplitAmount1Raw] = useState("");
  const [splitAmount2Raw, setSplitAmount2Raw] = useState("");
  const [showSplitPayDetails, setShowSplitPayDetails] = useState(false);

  // Reset split state cleanly each time the payment modal opens or order total changes
  useEffect(() => {
    if (!isOpen) return;
    setIsSplitMode(false);
    setSplitMethod1("CASH");
    setSplitMethod2("QRIS");
    const half = Math.round(finalTotal / 2);
    setSplitAmount1Raw(half > 0 ? String(half) : "");
    setSplitAmount2Raw(finalTotal - half > 0 ? String(finalTotal - half) : "");
    setShowSplitPayDetails(false);
  }, [isOpen, finalTotal]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const splitAmt1 = parseInt(splitAmount1Raw.replace(/[^0-9]/g, ""), 10) || 0;
  const splitAmt2 = parseInt(splitAmount2Raw.replace(/[^0-9]/g, ""), 10) || 0;
  const splitTotalPaid = splitAmt1 + splitAmt2;
  const hasCashInSplit = splitMethod1 === "CASH" || splitMethod2 === "CASH";
  const hasQrisInSplit = splitMethod1 === "QRIS" || splitMethod2 === "QRIS";
  const hasTransferInSplit = splitMethod1 === "TRANSFER" || splitMethod2 === "TRANSFER";
  const splitNonCashOverpaid = !hasCashInSplit && splitTotalPaid > finalTotal;
  const isSplitValid =
    splitMethod1 !== splitMethod2 &&
    splitAmt1 > 0 &&
    splitAmt2 > 0 &&
    splitTotalPaid >= finalTotal &&
    !splitNonCashOverpaid;

  const splitChange = Math.max(0, splitTotalPaid - finalTotal);
  const splitShortfall = Math.max(0, finalTotal - splitTotalPaid);
  const canSubmit = isSplitMode
    ? isSplitValid
    : paymentMethod !== "CASH" || isCashSufficient;

  const handleEnterSplitMode = () => {
    const primary = paymentMethod;
    const secondary = pickAlternateMethod(primary);
    const half = Math.round(finalTotal / 2);
    setSplitMethod1(primary);
    setSplitMethod2(secondary);
    setSplitAmount1Raw(half > 0 ? String(half) : "");
    setSplitAmount2Raw(finalTotal - half > 0 ? String(finalTotal - half) : "");
    setShowSplitPayDetails(false);
    setIsSplitMode(true);
  };

  const handleChangeSplitMethod1 = (next: PosBasePaymentMethod) => {
    if (next === splitMethod2) {
      setSplitMethod2(splitMethod1);
    }
    setSplitMethod1(next);
  };

  const handleChangeSplitMethod2 = (next: PosBasePaymentMethod) => {
    if (next === splitMethod1) {
      setSplitMethod1(splitMethod2);
    }
    setSplitMethod2(next);
  };

  const handleSplitAmount1Change = (digits: string) => {
    setSplitAmount1Raw(digits);
    const val1 = parseInt(digits || "0", 10) || 0;
    const remainder = Math.max(0, finalTotal - val1);
    setSplitAmount2Raw(remainder > 0 ? String(remainder) : "0");
  };

  const handleSplitHalf = () => {
    const half = Math.round(finalTotal / 2);
    setSplitAmount1Raw(String(half));
    setSplitAmount2Raw(String(Math.max(0, finalTotal - half)));
  };

  const handleConfirmSubmit = () => {
    if (!canSubmit) return;
    if (isSplitMode) {
      onFinalizeTransaction([
        { method: splitMethod1, amount: splitAmt1 },
        { method: splitMethod2, amount: splitAmt2 }
      ]);
      return;
    }
    onFinalizeTransaction();
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: 18,
          width: "100%",
          maxWidth: 440,
          maxHeight: "92vh",
          overflowY: "auto",
          boxShadow: "0 25px 50px rgba(0,0,0,0.3)",
          display: "flex",
          flexDirection: "column"
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
            background: theme.surface2,
            position: "sticky",
            top: 0,
            zIndex: 2
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
              <ArrowLeft size={16} />
            </button>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: theme.ink }}>
                Pembayaran Kasir
              </h3>
              <span style={{ fontSize: 11, color: theme.inkSoft }}>
                Total: Rp {finalTotal.toLocaleString("id-ID")} ({totalItemCount} item)
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => (isSplitMode ? setIsSplitMode(false) : handleEnterSplitMode())}
            style={{
              padding: "6px 10px",
              borderRadius: 8,
              border: `1px solid ${isSplitMode ? theme.accent : theme.border}`,
              background: isSplitMode ? `${theme.accent}14` : theme.surface,
              color: isSplitMode ? theme.accent : theme.inkSoft,
              fontSize: 11,
              fontWeight: 700,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              whiteSpace: "nowrap"
            }}
          >
            <ArrowLeftRight size={13} />
            <span>{isSplitMode ? "1 Metode" : "Split Bayar"}</span>
          </button>
        </div>

        <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
          {!isSplitMode ? (
            <>
              {/* Single Payment Method Tabs */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                {PAYMENT_OPTIONS.map((pm) => {
                  const active = paymentMethod === pm.id;
                  const Icon = pm.icon;
                  return (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => onSetPaymentMethod(pm.id)}
                      style={{
                        padding: "10px 8px",
                        borderRadius: 10,
                        border: `1px solid ${active ? theme.accent : theme.border}`,
                        background: active ? `${theme.accent}14` : theme.surface2,
                        color: active ? theme.accent : theme.inkSoft,
                        fontSize: 12,
                        fontWeight: active ? 700 : 500,
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 6
                      }}
                    >
                      <Icon size={18} />
                      <span>{pm.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* METHOD: CASH */}
              {paymentMethod === "CASH" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: theme.ink, marginBottom: 6 }}>
                      Uang Diterima dari Pembeli
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formatNumberWithDots(cashTendered)}
                      onChange={(e) => onSetCashTendered(e.target.value.replace(/\D/g, ""))}
                      placeholder="Contoh: 100.000"
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        fontSize: 16,
                        fontWeight: 700,
                        borderRadius: 10,
                        border: `1px solid ${isCashSufficient ? theme.border : "#EF4444"}`,
                        background: theme.surface2,
                        color: theme.ink,
                        outline: "none",
                        boxSizing: "border-box"
                      }}
                    />
                  </div>

                  {/* Quick Preset Buttons */}
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {[finalTotal, 10000, 20000, 50000, 100000, 200000].map((val, idx) => {
                      if (val < finalTotal && idx !== 0) return null;
                      return (
                        <button
                          key={val + "-" + idx}
                          type="button"
                          onClick={() => onSetCashTendered(val.toString())}
                          style={{
                            padding: "6px 10px",
                            borderRadius: 8,
                            fontSize: 11,
                            fontWeight: 600,
                            border: `1px solid ${theme.border}`,
                            background: theme.surface,
                            color: theme.ink,
                            cursor: "pointer"
                          }}
                        >
                          {idx === 0 ? "Uang Pas" : `Rp ${val.toLocaleString("id-ID")}`}
                        </button>
                      );
                    })}
                  </div>

                  {/* Kembalian Box */}
                  <div
                    style={{
                      padding: "12px 16px",
                      borderRadius: 10,
                      background: theme.surface2,
                      border: `1px solid ${theme.border}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between"
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 500, color: theme.inkSoft }}>
                      {isCashSufficient ? "Kembalian" : "Uang Kurang"}
                    </span>
                    <span
                      style={{
                        fontSize: 18,
                        fontWeight: 700,
                        color: theme.ink
                      }}
                    >
                      Rp {isCashSufficient ? changeAmount.toLocaleString("id-ID") : (finalTotal - tenderedNum).toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              )}

              {/* METHOD: QRIS */}
              {paymentMethod === "QRIS" && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, textAlign: "center" }}>
                  <div
                    style={{
                      padding: 12,
                      background: "#FFFFFF",
                      borderRadius: 12,
                      border: `1px solid ${theme.border}`,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.06)"
                    }}
                  >
                    <img
                      src={
                        store?.qrisImageUrl ||
                        `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=SERA-PAY-${finalTotal}`
                      }
                      alt="QRIS Toko"
                      style={{ width: 180, height: 180, display: "block" }}
                    />
                  </div>
                  <div style={{ fontSize: 12, color: theme.inkSoft, lineHeight: 1.4 }}>
                    Minta pembeli scan kode QRIS di atas melalui BCA, DANA, GoPay, OVO, atau Livin Mandiri.
                  </div>
                </div>
              )}

              {/* METHOD: TRANSFER */}
              {paymentMethod === "TRANSFER" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div
                    style={{
                      padding: 14,
                      borderRadius: 10,
                      background: theme.surface2,
                      border: `1px solid ${theme.border}`,
                      display: "flex",
                      flexDirection: "column",
                      gap: 4
                    }}
                  >
                    <div style={{ fontSize: 11, color: theme.inkSoft }}>Nomor Rekening / E-Wallet Toko:</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: theme.ink }}>
                      {store?.bankName || "DANA"}: {store?.bankAccount || store?.danaPhone || "081234567890"}
                    </div>
                    <div style={{ fontSize: 12, color: theme.inkSoft }}>
                      a.n {store?.bankHolder || store?.danaName || store?.name}
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: theme.inkSoft }}>
                    Pastikan dana telah masuk ke mutasi rekening sebelum menyelesaikan transaksi.
                  </div>
                </div>
              )}
            </>
          ) : (
            /* OPTIONAL SPLIT PAYMENT MODE (2 METHODS) */
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: theme.ink }}>
                  Kombinasi 2 Metode Pembayaran
                </span>
                <button
                  type="button"
                  onClick={handleSplitHalf}
                  style={{
                    padding: "4px 9px",
                    borderRadius: 6,
                    border: `1px solid ${theme.border}`,
                    background: theme.surface2,
                    color: theme.ink,
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  Bagi Rata 50/50
                </button>
              </div>

              {/* Payment Part 1 */}
              <div
                style={{
                  padding: 12,
                  borderRadius: 12,
                  background: theme.surface2,
                  border: `1px solid ${theme.border}`,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: theme.inkSoft }}>
                    Pembayaran 1
                  </span>
                  <div style={{ display: "flex", gap: 4 }}>
                    {PAYMENT_OPTIONS.map((pm) => {
                      const active = splitMethod1 === pm.id;
                      return (
                        <button
                          key={pm.id}
                          type="button"
                          onClick={() => handleChangeSplitMethod1(pm.id)}
                          style={{
                            padding: "4px 9px",
                            borderRadius: 7,
                            border: `1px solid ${active ? theme.accent : theme.border}`,
                            background: active ? `${theme.accent}16` : theme.surface,
                            color: active ? theme.accent : theme.inkSoft,
                            fontSize: 11,
                            fontWeight: 700,
                            cursor: "pointer"
                          }}
                        >
                          {pm.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  value={formatNumberWithDots(splitAmount1Raw)}
                  onChange={(e) => handleSplitAmount1Change(e.target.value.replace(/\D/g, ""))}
                  placeholder="Nominal metode 1"
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    fontSize: 15,
                    fontWeight: 700,
                    borderRadius: 9,
                    border: `1px solid ${splitAmt1 > 0 ? theme.border : "#EF4444"}`,
                    background: theme.surface,
                    color: theme.ink,
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              {/* Payment Part 2 */}
              <div
                style={{
                  padding: 12,
                  borderRadius: 12,
                  background: theme.surface2,
                  border: `1px solid ${theme.border}`,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: theme.inkSoft }}>
                    Pembayaran 2 (Sisa)
                  </span>
                  <div style={{ display: "flex", gap: 4 }}>
                    {PAYMENT_OPTIONS.map((pm) => {
                      const active = splitMethod2 === pm.id;
                      return (
                        <button
                          key={pm.id}
                          type="button"
                          onClick={() => handleChangeSplitMethod2(pm.id)}
                          style={{
                            padding: "4px 9px",
                            borderRadius: 7,
                            border: `1px solid ${active ? theme.accent : theme.border}`,
                            background: active ? `${theme.accent}16` : theme.surface,
                            color: active ? theme.accent : theme.inkSoft,
                            fontSize: 11,
                            fontWeight: 700,
                            cursor: "pointer"
                          }}
                        >
                          {pm.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  value={formatNumberWithDots(splitAmount2Raw)}
                  onChange={(e) => setSplitAmount2Raw(e.target.value.replace(/\D/g, ""))}
                  placeholder="Nominal metode 2"
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    fontSize: 15,
                    fontWeight: 700,
                    borderRadius: 9,
                    border: `1px solid ${splitAmt2 > 0 ? theme.border : "#EF4444"}`,
                    background: theme.surface,
                    color: theme.ink,
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              {/* Optional QRIS / Bank Account preview for non-cash split parts */}
              {(hasQrisInSplit || hasTransferInSplit) && (
                <div>
                  <button
                    type="button"
                    onClick={() => setShowSplitPayDetails((v) => !v)}
                    style={{
                      width: "100%",
                      padding: "7px 10px",
                      borderRadius: 8,
                      border: `1px dashed ${theme.border}`,
                      background: theme.surface,
                      color: theme.accent,
                      fontSize: 11.5,
                      fontWeight: 600,
                      cursor: "pointer"
                    }}
                  >
                    {showSplitPayDetails
                      ? "Sembunyikan QRIS / Rekening Toko"
                      : "Lihat QRIS / Info Rekening Toko"}
                  </button>
                  {showSplitPayDetails && (
                    <div
                      style={{
                        marginTop: 8,
                        padding: 12,
                        borderRadius: 10,
                        background: theme.surface2,
                        border: `1px solid ${theme.border}`,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 8,
                        textAlign: "center"
                      }}
                    >
                      {hasQrisInSplit && (
                        <img
                          src={
                            store?.qrisImageUrl ||
                            `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=SERA-PAY-${finalTotal}`
                          }
                          alt="QRIS Toko"
                          style={{ width: 136, height: 136, borderRadius: 8, background: "#fff", padding: 6 }}
                        />
                      )}
                      {hasTransferInSplit && (
                        <div style={{ fontSize: 11.5, color: theme.ink }}>
                          <strong>{store?.bankName || "DANA"}:</strong>{" "}
                          {store?.bankAccount || store?.danaPhone || "081234567890"} (a.n{" "}
                          {store?.bankHolder || store?.danaName || store?.name})
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Split Summary Box */}
              <div
                style={{
                  padding: "11px 14px",
                  borderRadius: 10,
                  background: theme.surface2,
                  border: `1px solid ${
                    splitNonCashOverpaid || splitShortfall > 0 ? "#F59E0B" : theme.border
                  }`,
                  display: "flex",
                  flexDirection: "column",
                  gap: 4
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: theme.inkSoft }}>
                  <span>Total Dibayar (2 Metode)</span>
                  <span style={{ fontWeight: 700, color: theme.ink }}>
                    Rp {splitTotalPaid.toLocaleString("id-ID")}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: theme.inkSoft }}>
                    {splitShortfall > 0
                      ? "Uang Kurang"
                      : splitNonCashOverpaid
                        ? "Nominal Berlebih"
                        : splitChange > 0
                          ? "Kembalian Tunai"
                          : "Status Pembayaran"}
                  </span>
                  <span
                    style={{
                      fontSize: 15,
                      fontWeight: 800,
                      color:
                        splitShortfall > 0
                          ? "#EF4444"
                          : splitNonCashOverpaid
                            ? "#F59E0B"
                            : theme.ink
                    }}
                  >
                    {splitShortfall > 0
                      ? `Rp ${splitShortfall.toLocaleString("id-ID")}`
                      : splitNonCashOverpaid
                        ? "Sesuaikan Total Non-Tunai"
                        : splitChange > 0
                          ? `Rp ${splitChange.toLocaleString("id-ID")}`
                          : "Lunas Pas"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Selesaikan Transaksi Button */}
          <button
            type="button"
            disabled={!canSubmit}
            onClick={handleConfirmSubmit}
            style={{
              width: "100%",
              padding: "13px",
              borderRadius: 10,
              background: !canSubmit
                ? theme.border
                : theme.isDark
                  ? "#24282D"
                  : "#191C1F",
              color: !canSubmit ? theme.inkSoft : "#FFFFFF",
              border: `1px solid ${
                !canSubmit
                  ? theme.border
                  : theme.isDark
                    ? "#3A4048"
                    : "#0F1113"
              }`,
              fontSize: 14,
              fontWeight: 600,
              cursor: !canSubmit ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
              transition: "all 0.15s ease"
            }}
          >
            <CheckCircle2 size={17} />
            <span>Selesaikan Transaksi</span>
          </button>
        </div>
      </div>
    </div>
  );
};
