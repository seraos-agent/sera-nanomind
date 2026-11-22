import type { ThemeType } from "../../../../../theme";
import { getStoreEntityLabel, type StoreType } from "../../../types";

interface MerchantCourierHeaderProps {
  theme: ThemeType;
  isMobileView?: boolean;
  storeType?: StoreType;
  courierCount?: number;
  enabled: boolean;
  onToggleEnabled: () => void;
  onOpenAddModal?: () => void;
}

export function MerchantCourierHeader({
  theme,
  isMobileView,
  storeType,
  enabled,
  onToggleEnabled
}: MerchantCourierHeaderProps) {
  const entity = getStoreEntityLabel(storeType);
  const entityLower = getStoreEntityLabel(storeType, true);
  return (
    <div
      onClick={onToggleEnabled}
      style={{
        background: theme.surface,
        border: `1px solid ${theme.border}`,
        borderRadius: 20,
        padding: isMobileView ? "18px 16px" : "20px 22px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        cursor: "pointer",
        userSelect: "none",
        boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
        transition: "background 0.15s ease"
      }}
    >
      {/* Left: Title & Subtitle */}
      <div style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1, paddingRight: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: theme.ink }}>
          Layanan Kurir {entity}
        </div>
        <div style={{ fontSize: 12.5, color: theme.inkSoft, lineHeight: 1.4 }}>
          {enabled
            ? `Layanan aktif — pembeli dapat memilih pengantaran kurir ${entityLower} saat checkout`
            : `Layanan nonaktif — opsi pengantaran mandiri ${entityLower} sedang ditutup`}
        </div>
      </div>

      {/* Right: Tactile iOS Toggle Switch */}
      <div
        style={{
          width: 50,
          height: 28,
          borderRadius: 14,
          background: enabled ? (theme.isDark ? "#10B981" : theme.ink) : theme.border,
          position: "relative",
          transition: "background 0.2s ease",
          flexShrink: 0
        }}
      >
        <div
          style={{
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: "#FFFFFF",
            position: "absolute",
            top: 3,
            left: 3,
            transition: "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
            transform: enabled ? "translateX(22px)" : "translateX(0)",
            boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)"
          }}
        />
      </div>
    </div>
  );
}
