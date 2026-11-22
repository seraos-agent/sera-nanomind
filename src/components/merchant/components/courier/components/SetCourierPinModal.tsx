import { useEffect, useState } from "react";
import { Lock } from "lucide-react";
import type { ThemeType } from "../../../../../theme";
import { registerBackHandler } from "../../../../../utils/backButton";

interface SetCourierPinModalProps {
  isOpen: boolean;
  courier: { id: string; name: string; hasPin?: boolean } | null;
  isUpdating: boolean;
  theme: ThemeType;
  onConfirm: (pin: string) => void;
  onCancel: () => void;
}

export function SetCourierPinModal({
  isOpen,
  courier,
  isUpdating,
  theme,
  onConfirm,
  onCancel
}: SetCourierPinModalProps) {
  const [pinInput, setPinInput] = useState("");

  useEffect(() => {
    if (isOpen && courier) {
      setPinInput("");
    }
  }, [isOpen, courier?.id]);

  useEffect(() => {
    if (!isOpen || !courier) return;
    return registerBackHandler("set_courier_pin_modal", 90, () => {
      if (!isUpdating) {
        onCancel();
        return true;
      }
      return false;
    });
  }, [isOpen, courier, isUpdating, onCancel]);

  if (!isOpen || !courier) return null;

  const isPinValid = /^\d{4,6}$/.test(pinInput.trim());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPinValid || isUpdating) return;
    onConfirm(pinInput.trim());
  };

  return (
    <div
      onClick={() => !isUpdating && onCancel()}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(4px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16
      }}
    >
      <form
        onClick={e => e.stopPropagation()}
        onSubmit={handleSubmit}
        style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: 20,
          width: "100%",
          maxWidth: 400,
          padding: 24,
          boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          boxSizing: "border-box"
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            background: theme.surface2,
            color: theme.ink,
            border: `1px solid ${theme.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 14
          }}
        >
          <Lock size={22} />
        </div>

        <h3
          style={{
            margin: "0 0 8px 0",
            fontSize: 17,
            fontWeight: 700,
            color: theme.ink
          }}
        >
          {courier.hasPin ? "Ganti PIN Kurir" : "Atur PIN Kurir"}
        </h3>

        <div
          style={{
            width: "100%",
            padding: "10px 14px",
            background: theme.surface2,
            border: `1px solid ${theme.border}`,
            borderRadius: 12,
            fontSize: 13.5,
            fontWeight: 700,
            color: theme.ink,
            marginBottom: 12,
            boxSizing: "border-box"
          }}
        >
          {courier.name}
        </div>

        <p
          style={{
            margin: "0 0 14px 0",
            fontSize: 12.5,
            lineHeight: 1.45,
            color: theme.inkSoft
          }}
        >
          Masukkan 4–6 digit angka PIN pribadi untuk kurir ini. Kurir wajib memasukkan Kode Aktivasi beserta PIN ini saat login atau ganti perangkat.
        </p>

        <input
          type="password"
          inputMode="numeric"
          maxLength={6}
          autoFocus
          required
          placeholder="PIN 4–6 digit angka"
          value={pinInput}
          onChange={e => setPinInput(e.target.value.replace(/\D/g, "").slice(0, 6))}
          style={{
            width: "100%",
            boxSizing: "border-box",
            height: 48,
            padding: "0 14px",
            borderRadius: 14,
            border: `1px solid ${theme.border}`,
            background: theme.surface2,
            color: theme.ink,
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: 3,
            textAlign: "center",
            outline: "none",
            marginBottom: 18
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            width: "100%",
            boxSizing: "border-box"
          }}
        >
          <button
            type="button"
            disabled={isUpdating}
            onClick={onCancel}
            style={{
              flex: 1,
              height: 46,
              borderRadius: 20,
              background: theme.surface2,
              color: theme.ink,
              border: `1px solid ${theme.border}`,
              fontSize: 14,
              fontWeight: 600,
              cursor: isUpdating ? "not-allowed" : "pointer"
            }}
          >
            Batal
          </button>

          <button
            type="submit"
            disabled={!isPinValid || isUpdating}
            style={{
              flex: 1.2,
              height: 46,
              borderRadius: 20,
              background: theme.ink,
              color: theme.bg,
              border: "none",
              fontSize: 14,
              fontWeight: 700,
              opacity: !isPinValid || isUpdating ? 0.55 : 1,
              cursor: !isPinValid || isUpdating ? "not-allowed" : "pointer"
            }}
          >
            {isUpdating ? "Menyimpan..." : "Simpan PIN"}
          </button>
        </div>
      </form>
    </div>
  );
}
