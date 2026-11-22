import { useState } from "react";
import { ChevronLeft as CloseIcon, ShieldCheck, AlertCircle, Calculator, Info } from "lucide-react";
import type { ThemeType } from "../../theme";
import { getApiBaseUrl } from "../../config/marketplaceConfig";
import { normalizeStoreType } from "../merchant/types";
import type { CashierSession, CashierShift } from "./types";
import type { MerchantProduct } from "../merchant/types";

interface StoreCashierPairingGateProps {
  theme: ThemeType;
  isMobileView?: boolean;
  userEmail?: string | null;
  notice?: string | null;
  onBack: () => void;
  onActivateSuccess: (payload: {
    session: CashierSession;
    activeShift: CashierShift | null;
    items: MerchantProduct[];
  }) => void;
}

/**
 * StoreCashierPairingGate — Terminal activation screen for Mitra Kasir staff.
 * Connects a cashier device to a store using its KS-XXXX activation code and optional PIN.
 */
export function StoreCashierPairingGate({
  theme,
  isMobileView,
  userEmail,
  notice,
  onBack,
  onActivateSuccess
}: StoreCashierPairingGateProps) {
  const [activationCode, setActivationCode] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = activationCode.trim().toUpperCase();
    const cleanPin = pinCode.trim();
    if (!cleanCode) {
      setErrorMsg("Silakan masukkan Kode Aktivasi Kasir (contoh: KS-8F4K2M).");
      return;
    }
    if (!/^\d{4,6}$/.test(cleanPin)) {
      setErrorMsg("PIN Kasir wajib diisi (4–6 digit angka).");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const resolvedEmail =
        (userEmail || (typeof window !== "undefined" ? localStorage.getItem("sera_user_email") : "") || "")
          .trim()
          .toLowerCase() || undefined;
      const res = await fetch(`${getApiBaseUrl()}/api/market/pos/activate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activationCode: cleanCode,
          pinCode: cleanPin,
          userEmail: resolvedEmail
        })
      });

      const json = await res.json();
      if (json.success && json.data?.store && json.data?.cashier) {
        const rawStore = json.data.store;
        const normalizedStore = {
          ...rawStore,
          type: normalizeStoreType(rawStore.type)
        };
        const { activationCode: _hiddenCode, activeSessionId: _hiddenSession, ...safeCashier } =
          json.data.cashier;
        onActivateSuccess({
          session: {
            sessionId: json.data.sessionId || json.data.cashier?.activeSessionId,
            store: normalizedStore,
            posConfig: json.data.posConfig,
            cashier: safeCashier
          },
          activeShift: json.data.activeShift || null,
          items: Array.isArray(json.data.items) ? json.data.items : []
        });
      } else {
        setErrorMsg(json.error || "Kode kasir tidak ditemukan atau PIN salah.");
      }
    } catch {
      setErrorMsg("Gagal menghubungi server. Periksa koneksi internet Anda.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        background: theme.bg,
        minHeight: "100%"
      }}
    >
      {/* Top Bar */}
      <div
        style={{
          background: theme.surface,
          borderBottom: `1px solid ${theme.border}`,
          padding: isMobileView ? "12px 14px" : "16px 24px",
          display: "flex",
          alignItems: "center",
          gap: 12
        }}
      >
        <button
          type="button"
          onClick={onBack}
          title="Kembali ke Dashboard Utama"
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: theme.inkSoft,
            padding: 4,
            display: "flex",
            borderRadius: 6
          }}
        >
          <CloseIcon size={20} />
        </button>
        <span style={{ fontSize: 15, fontWeight: 700, color: theme.ink }}>
          Aktivasi Mitra Kasir
        </span>
      </div>

      {/* Centered Card */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: isMobileView ? "20px 16px 36px" : "36px 20px"
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 420,
            background: theme.surface,
            border: `1px solid ${theme.border}`,
            borderRadius: 18,
            padding: isMobileView ? 20 : 28,
            boxShadow: "0 14px 36px rgba(0,0,0,0.08)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: `${theme.accent}18`,
                color: theme.accent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}
            >
              <Calculator size={22} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: theme.ink }}>
                Terminal Mitra Kasir
              </h2>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: theme.inkSoft }}>
                Hubungkan perangkat ini ke kasir toko Anda
              </p>
            </div>
          </div>

          {notice && (
            <div
              style={{
                background: theme.isDark ? "rgba(245, 158, 11, 0.14)" : "#fffbeb",
                border: `1px solid ${theme.isDark ? "rgba(245, 158, 11, 0.35)" : "#fde68a"}`,
                color: theme.isDark ? "#FBBF24" : "#b45309",
                borderRadius: 12,
                padding: "10px 12px",
                display: "flex",
                alignItems: "flex-start",
                gap: 8,
                marginBottom: 14,
                fontSize: 12,
                lineHeight: 1.45
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{notice}</span>
            </div>
          )}

          <div
            style={{
              background: theme.surface2,
              border: `1px solid ${theme.border}`,
              borderRadius: 12,
              padding: "10px 12px",
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
              marginBottom: 18,
              fontSize: 12,
              color: theme.inkSoft,
              lineHeight: 1.45
            }}
          >
            <Info size={16} style={{ flexShrink: 0, marginTop: 1, color: theme.accent }} />
            <span>
              Minta <strong>Kode Aktivasi Kasir (KS-XXXX)</strong> dari pemilik toko di menu Mitra Store untuk mulai bertugas tanpa masuk ke akun pemilik.
            </span>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 600,
                  color: theme.ink,
                  marginBottom: 6
                }}
              >
                Kode Aktivasi Kasir
              </label>
              <input
                type="text"
                value={activationCode}
                onChange={(e) => {
                  setActivationCode(e.target.value.toUpperCase());
                  setErrorMsg("");
                }}
                placeholder="Contoh: KS-8F4K2M"
                autoFocus
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  borderRadius: 10,
                  border: `1px solid ${theme.border}`,
                  background: theme.surface2,
                  color: theme.ink,
                  fontSize: 15,
                  fontWeight: 700,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 600,
                  color: theme.ink,
                  marginBottom: 6
                }}
              >
                PIN Kasir <span style={{ fontWeight: 400, color: theme.inkSoft }}>(4–6 digit angka, wajib)</span>
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                required
                value={pinCode}
                onChange={(e) => {
                  setPinCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                  setErrorMsg("");
                }}
                placeholder="Masukkan 4–6 digit PIN"
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  borderRadius: 10,
                  border: `1px solid ${theme.border}`,
                  background: theme.surface2,
                  color: theme.ink,
                  fontSize: 15,
                  letterSpacing: 3,
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />
            </div>

            {errorMsg && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 12px",
                  borderRadius: 10,
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.25)",
                  color: "#EF4444",
                  fontSize: 12,
                  fontWeight: 500
                }}
              >
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !activationCode.trim() || !/^\d{4,6}$/.test(pinCode.trim())}
              style={{
                marginTop: 4,
                padding: "12px 16px",
                borderRadius: 12,
                border: "none",
                background: theme.accent,
                color: "#FFFFFF",
                fontSize: 14,
                fontWeight: 700,
                cursor:
                  isSubmitting || !activationCode.trim() || !/^\d{4,6}$/.test(pinCode.trim())
                    ? "not-allowed"
                    : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                opacity:
                  isSubmitting || !activationCode.trim() || !/^\d{4,6}$/.test(pinCode.trim())
                    ? 0.65
                    : 1
              }}
            >
              <ShieldCheck size={18} />
              <span>{isSubmitting ? "Menghubungkan..." : "Aktifkan Terminal Kasir"}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
