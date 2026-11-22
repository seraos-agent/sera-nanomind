import React, { useState } from "react";
import { Store } from "lucide-react";
import type { ThemeType } from "../../../../../theme";
import { type StoreType, getStoreEntityLabel } from "../../../types";
import { formatStorePinLocation } from "../../../../marketplace/utils/formatters";

export interface StoreOverviewRow {
  id: string;
  label: string;
  value: string;
  badge?: string;
  onClick?: () => void;
}

export interface StoreSummaryCardProps {
  theme: ThemeType;
  isMobileView?: boolean;
  isDesktopHero?: boolean;
  storeType?: StoreType;
  editBannerUrl: string;
  editLogoUrl: string;
  editName: string;
  editCategory: string;
  editDescription?: string;
  editCity: string;
  editDistrict?: string;
  editVillage?: string;
  editAddress?: string;
  overviewRows?: StoreOverviewRow[];
}

export const StoreSummaryCard: React.FC<StoreSummaryCardProps> = ({
  theme,
  isMobileView,
  isDesktopHero = false,
  storeType,
  editBannerUrl,
  editLogoUrl,
  editName,
  editCategory,
  editDescription,
  editCity,
  editDistrict,
  editVillage,
  editAddress,
  overviewRows
}) => {
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);
  const entity = getStoreEntityLabel(storeType);
  const avatarSize = isDesktopHero ? 76 : 64;
  const avatarOverlap = isDesktopHero ? -38 : -32;

  return (
    <div
      style={{
        background: theme.surface,
        border: `1px solid ${theme.border}`,
        borderRadius: isDesktopHero ? 18 : 20,
        overflow: "hidden",
        position: "relative",
        flexShrink: 0
      }}
    >
      {/* Cover Banner */}
      <div
        style={{
          height: isDesktopHero ? 190 : (isMobileView ? 100 : 125),
          width: "100%",
          position: "relative",
          background: editBannerUrl
            ? `url(${editBannerUrl}) center/cover no-repeat`
            : theme.surface2,
          borderBottom: `1px solid ${theme.border}`
        }}
      />

      {/* Store Identity Bar */}
      <div
        style={{
          padding: isMobileView ? "0 16px 14px" : (isDesktopHero ? "0 22px 18px" : "0 20px 16px"),
          display: "flex",
          flexDirection: "column",
          gap: 10,
          position: "relative"
        }}
      >
        {/* Row 1: Logo Avatar & Store Name */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
          {/* Logo Avatar overlapping banner */}
          <div
            style={{
              width: avatarSize,
              height: avatarSize,
              borderRadius: "50%",
              border: `3px solid ${theme.surface}`,
              background: theme.surface2,
              overflow: "hidden",
              position: "relative",
              boxShadow: "0 3px 12px rgba(0,0,0,0.1)",
              flexShrink: 0,
              marginTop: avatarOverlap,
              zIndex: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            {editLogoUrl ? (
              <img
                src={editLogoUrl}
                alt={`Logo ${entity}`}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <Store size={isDesktopHero ? 28 : 24} color={theme.inkSoft} />
            )}
          </div>

          {/* Store Name */}
          <div style={{ minWidth: 0, flex: 1, paddingTop: 4 }}>
            <div
              style={{
                fontSize: isDesktopHero ? 20 : 17,
                fontWeight: 700,
                color: theme.ink,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis"
              }}
            >
              {editName.trim() || `${entity} Name`}
            </div>
          </div>
        </div>

        {/* Row 2: Category subtext on left & City on right without pin */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 12.5,
            color: theme.inkSoft,
            paddingTop: 2,
            gap: 12
          }}
        >
          <span style={{ fontWeight: 500 }}>
            {editCategory || `${entity} Category`}
          </span>
          <span style={{ fontWeight: 500, textAlign: "right" }}>
            {formatStorePinLocation({
              city: editCity,
              district: editDistrict,
              village: editVillage,
              address: editAddress,
              fallback: `${entity} City`
            })}
          </span>
        </div>

        {isDesktopHero && editDescription?.trim() && (
          <div
            style={{
              paddingTop: 10,
              borderTop: `1px solid ${theme.border}`,
              fontSize: 13.5,
              lineHeight: 1.55,
              color: theme.inkSoft
            }}
          >
            {editDescription.trim()}
          </div>
        )}

        {isDesktopHero && overviewRows && overviewRows.length > 0 && (
          <div
            style={{
              marginTop: 4,
              paddingTop: 6,
              borderTop: `1px solid ${theme.border}`,
              display: "flex",
              flexDirection: "column"
            }}
          >
            {overviewRows.map((row, idx) => {
              const isInteractive = Boolean(row.onClick);
              const isHovered = isInteractive && hoveredRowId === row.id;
              const isLast = idx === overviewRows.length - 1;

              return (
                <button
                  key={row.id}
                  type="button"
                  onClick={row.onClick}
                  disabled={!isInteractive}
                  onMouseEnter={() => isInteractive && setHoveredRowId(row.id)}
                  onMouseLeave={() => setHoveredRowId((prev) => (prev === row.id ? null : prev))}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    background: isHovered ? theme.surface2 : "transparent",
                    border: "none",
                    borderBottom: isLast ? "none" : `1px solid ${theme.border}`,
                    borderRadius: isHovered ? 8 : 0,
                    padding: "11px 6px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 16,
                    cursor: isInteractive ? "pointer" : "default",
                    transition: "background 0.15s ease"
                  }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: theme.inkSoft,
                      flexShrink: 0
                    }}
                  >
                    {row.label}
                  </span>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      gap: 8,
                      minWidth: 0
                    }}
                  >
                    {row.badge && (
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          padding: "2px 8px",
                          borderRadius: 999,
                          background: theme.surface2,
                          color: theme.inkSoft,
                          border: `1px solid ${theme.border}`,
                          flexShrink: 0
                        }}
                      >
                        {row.badge}
                      </span>
                    )}
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: theme.ink,
                        textAlign: "right",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap"
                      }}
                    >
                      {row.value}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
