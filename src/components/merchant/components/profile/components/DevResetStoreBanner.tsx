import { RotateCcw } from "lucide-react";
import type { ThemeType } from "../../../../../theme";

interface DevResetStoreBannerProps {
  theme: ThemeType;
  onOpenResetModal: () => void;
}

export function DevResetStoreBanner({
  theme,
  onOpenResetModal
}: DevResetStoreBannerProps) {
  return (
    <div
      style={{
        marginTop: 8,
        padding: "16px 18px",
        borderRadius: 20,
        background: theme.isDark ? "rgba(239, 68, 68, 0.08)" : "#fff5f5",
        border: `1.5px dashed ${theme.isDark ? "rgba(239, 68, 68, 0.3)" : "#fca5a5"}`,
        display: "flex",
        flexDirection: "column",
        gap: 10
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <RotateCcw size={16} color="#ef4444" />
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "#ef4444",
            textTransform: "uppercase",
            letterSpacing: "0.5px"
          }}
        >
          Testing Mode (Developer)
        </span>
      </div>
      <p
        style={{
          margin: 0,
          fontSize: 13,
          color: theme.inkSoft,
          lineHeight: 1.45
        }}
      >
        Clear local store data to restart and test the new store onboarding flow from scratch.
      </p>
      <button
        type="button"
        onClick={onOpenResetModal}
        style={{
          marginTop: 4,
          padding: "12px 16px",
          borderRadius: 14,
          background: "#ef4444",
          color: "#ffffff",
          border: "none",
          fontWeight: 600,
          fontSize: 13,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          transition: "opacity 0.2s",
          boxShadow: "0 2px 8px rgba(239, 68, 68, 0.25)"
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.opacity = "0.9";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.opacity = "1";
        }}
      >
        <RotateCcw size={15} />
        <span>Reset Demo Store (Start Fresh)</span>
      </button>
    </div>
  );
}
