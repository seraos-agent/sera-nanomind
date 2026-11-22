import type { ThemeType } from "../../../../theme";

interface DeliveryOfflineStateProps {
  theme: ThemeType;
  onToggleOnline?: () => void;
}

export function DeliveryOfflineState({ theme, onToggleOnline }: DeliveryOfflineStateProps) {
  return (
    <div
      style={{
        padding: "44px 20px",
        textAlign: "center",
        background: theme.surface,
        borderRadius: 14,
        border: `1px solid ${theme.border}`,
        color: theme.inkSoft,
        boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          background: theme.surface2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: theme.inkSoft
        }}
      >
        <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M18.36 6.64a9 9 0 1 1-12.73 0M12 2v10" />
        </svg>
      </div>
      <div>
        <div style={{ fontSize: 14.5, fontWeight: 700, color: theme.ink }}>
          Status Driver Sedang Offline
        </div>
        <div style={{ fontSize: 12, color: theme.inkSoft, maxWidth: 300, margin: "4px auto 0", lineHeight: 1.5 }}>
          Anda sedang offline dan tidak dapat menerima tugas pengantaran baru dari toko.
        </div>
      </div>
      {onToggleOnline && (
        <button
          type="button"
          onClick={onToggleOnline}
          style={{
            marginTop: 4,
            padding: "9px 24px",
            borderRadius: 20,
            background: theme.ink,
            color: theme.bg,
            border: "none",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.12)",
            transition: "opacity 0.15s ease"
          }}
        >
          Mulai Online
        </button>
      )}
    </div>
  );
}
