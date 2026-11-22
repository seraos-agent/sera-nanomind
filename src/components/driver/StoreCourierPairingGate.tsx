import { useState } from "react";
import {
  ChevronLeft as CloseIcon,
  ShieldCheck,
  AlertCircle,
  Truck,
  Info
} from "lucide-react";
import type { ThemeType } from "../../theme";
import { getApiBaseUrl } from "../../config/marketplaceConfig";

interface StoreCourierPairingGateProps {
  theme: ThemeType;
  onBack: () => void;
  userEmail?: string | null;
  notice?: string | null;
  onPairSuccess: (storeData: {
    store: any;
    courier?: any;
    code: string;
    sessionId?: string;
  }) => void;
  isMobileView?: boolean;
}

export function StoreCourierPairingGate({
  theme,
  onBack,
  userEmail,
  notice,
  onPairSuccess,
  isMobileView
}: StoreCourierPairingGateProps) {
  const [storeCode, setStoreCode] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = storeCode.trim().toUpperCase();
    const cleanPin = pinCode.trim();
    if (!cleanCode) {
      setErrorMsg("Silakan masukkan Kode Aktivasi Kurir.");
      return;
    }
    if (!/^\d{4,6}$/.test(cleanPin)) {
      setErrorMsg("Silakan masukkan PIN Kurir (4–6 digit angka).");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const resolvedEmail =
        (userEmail || (typeof window !== "undefined" ? localStorage.getItem("sera_user_email") : "") || "")
          .trim()
          .toLowerCase() || undefined;
      const res = await fetch(`${getApiBaseUrl()}/api/market/stores/courier/pair`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pairingCode: cleanCode,
          pinCode: cleanPin,
          userEmail: resolvedEmail
        })
      });

      const json = await res.json();
      if (json.success && json.data?.store && json.data?.courier) {
        onPairSuccess({
          store: json.data.store,
          courier: json.data.courier,
          code: cleanCode,
          sessionId: json.data.sessionId || json.data.courier?.activeSessionId
        });
      } else {
        setErrorMsg(json.error || "Kode Kurir atau PIN tidak valid.");
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
      {/* Top Bar with Back Button */}
      <div
        style={{
          background: theme.surface,
          borderBottom: "none",
          padding: isMobileView ? "12px 14px 12px" : "16px 24px",
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
          Aktivasi Kurir Toko
        </span>
      </div>

      {/* Main Centered Content */}
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
            maxWidth: 440,
            background: theme.surface,
            border: `1.5px solid ${theme.border}`,
            borderRadius: 20,
            padding: isMobileView ? "24px 18px" : "32px 28px",
            boxShadow: "0 12px 32px rgba(0, 0, 0, 0.06)",
            display: "flex",
            flexDirection: "column",
            gap: 20
          }}
        >
          {/* Hero Icon */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 12 }}>
            <div
              style={{
                width: 68,
                height: 68,
                borderRadius: 20,
                background: `${theme.accent}15`,
                color: theme.accent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: `1px solid ${theme.accent}30`,
                boxShadow: `0 8px 20px ${theme.accent}20`
              }}
            >
              <Truck size={34} />
            </div>

            <div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: theme.ink }}>
                Aktivasi Kurir Toko Anda
              </h2>
              <p style={{ margin: "6px 0 0", fontSize: 12.5, color: theme.inkSoft, lineHeight: 1.45 }}>
                Masukkan <b>Kode Aktivasi Kurir</b> (contoh: <code>KR-8F4K2M</code>) dan <b>PIN pribadi (4–6 digit)</b> dari pemilik toko untuk masuk ke antrean pengantaran Anda.
              </p>
            </div>
          </div>

          {notice && (
            <div
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                background: theme.isDark ? "rgba(245, 158, 11, 0.14)" : "#fffbeb",
                border: `1px solid ${theme.isDark ? "rgba(245, 158, 11, 0.35)" : "#fde68a"}`,
                color: theme.isDark ? "#FBBF24" : "#b45309",
                fontSize: 12,
                lineHeight: 1.45,
                display: "flex",
                alignItems: "flex-start",
                gap: 8
              }}
            >
              <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{notice}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 700,
                  color: theme.ink,
                  marginBottom: 8,
                  textAlign: "center"
                }}
              >
                KODE AKTIVASI KURIR
              </label>
              <input
                type="text"
                value={storeCode}
                onChange={e => {
                  setStoreCode(e.target.value.toUpperCase());
                  setErrorMsg("");
                }}
                placeholder="CONTOH: KR-8F4K2M"
                maxLength={14}
                autoFocus
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: 12,
                  border: `2px solid ${errorMsg ? "#ef4444" : theme.border}`,
                  background: theme.surface2,
                  color: theme.ink,
                  fontSize: 18,
                  fontWeight: 800,
                  letterSpacing: 3,
                  textAlign: "center",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border 0.15s ease"
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 700,
                  color: theme.ink,
                  marginBottom: 8,
                  textAlign: "center"
                }}
              >
                PIN KURIR (4–6 DIGIT ANGKA)
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                required
                value={pinCode}
                onChange={e => {
                  setPinCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                  setErrorMsg("");
                }}
                placeholder="Masukkan 4–6 digit PIN"
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: 12,
                  border: `2px solid ${errorMsg ? "#ef4444" : theme.border}`,
                  background: theme.surface2,
                  color: theme.ink,
                  fontSize: 18,
                  fontWeight: 800,
                  letterSpacing: 4,
                  textAlign: "center",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border 0.15s ease"
                }}
              />
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div
                style={{
                  padding: "9px 12px",
                  borderRadius: 8,
                  background: theme.isDark ? "rgba(239, 68, 68, 0.15)" : "#fef2f2",
                  border: `1px solid ${theme.isDark ? "rgba(239, 68, 68, 0.35)" : "#fecaca"}`,
                  color: theme.isDark ? "#F87171" : "#dc2626",
                  fontSize: 11.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 8
                }}
              >
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !storeCode.trim() || !/^\d{4,6}$/.test(pinCode.trim())}
              style={{
                marginTop: 4,
                padding: "13px 20px",
                borderRadius: 12,
                border: "none",
                background: theme.accent,
                color: "#FFFFFF",
                fontSize: 14,
                fontWeight: 700,
                cursor:
                  isSubmitting || !storeCode.trim() || !/^\d{4,6}$/.test(pinCode.trim())
                    ? "not-allowed"
                    : "pointer",
                opacity:
                  isSubmitting || !storeCode.trim() || !/^\d{4,6}$/.test(pinCode.trim())
                    ? 0.65
                    : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                boxShadow: `0 4px 14px ${theme.accent}35`,
                transition: "all 0.15s ease"
              }}
            >
              <ShieldCheck size={16} />
              <span>{isSubmitting ? "Mengaktifkan..." : "Aktifkan & Mulai Bekerja"}</span>
            </button>
          </form>

          {/* Helpful Tips Card */}
          <div
            style={{
              padding: "12px 14px",
              borderRadius: 10,
              background: theme.surface2,
              border: `1px solid ${theme.border}`,
              display: "flex",
              alignItems: "flex-start",
              gap: 10
            }}
          >
            <Info size={16} color={theme.inkSoft} style={{ marginTop: 2, flexShrink: 0 }} />
            <div style={{ fontSize: 11.5, color: theme.inkSoft, lineHeight: 1.45 }}>
              Belum punya kode? Minta pengelola toko mendaftarkan Anda di menu <b>"Kurir Toko"</b> pada dashboard merchant SERA untuk mendapatkan Kode Aktivasi Kurir unik Anda.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
