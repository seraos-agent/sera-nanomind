import React from "react";
import { Store } from "lucide-react";
import type { ThemeType } from "../../../../../theme";
import { type StoreType, getStoreEntityLabel } from "../../../types";
import { formatStorePinLocation } from "../../../../marketplace/utils/formatters";

export interface StoreSummaryCardProps {
  theme: ThemeType;
  isMobileView?: boolean;
  storeType?: StoreType;
  editBannerUrl: string;
  editLogoUrl: string;
  editName: string;
  editCategory: string;
  editCity: string;
  editDistrict?: string;
  editVillage?: string;
  editAddress?: string;
}

export const StoreSummaryCard: React.FC<StoreSummaryCardProps> = ({
  theme,
  isMobileView,
  storeType,
  editBannerUrl,
  editLogoUrl,
  editName,
  editCategory,
  editCity,
  editDistrict,
  editVillage,
  editAddress
}) => {
  const entity = getStoreEntityLabel(storeType);
  return (
    <div
      style={{
        background: theme.surface,
        border: `1px solid ${theme.border}`,
        borderRadius: 20,
        overflow: "hidden",
        position: "relative"
      }}
    >
      {/* Cover Banner */}
      <div
        style={{
          height: isMobileView ? 100 : 125,
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
          padding: isMobileView ? "0 16px 14px" : "0 20px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          position: "relative"
        }}
      >
        {/* Row 1: Logo Avatar & Nama Toko */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
          {/* Logo Avatar overlapping banner */}
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              border: `3px solid ${theme.surface}`,
              background: theme.surface2,
              overflow: "hidden",
              position: "relative",
              boxShadow: "0 3px 12px rgba(0,0,0,0.1)",
              flexShrink: 0,
              marginTop: -32,
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
              <Store size={24} color={theme.inkSoft} />
            )}
          </div>

          {/* Nama Toko / Resto */}
          <div style={{ minWidth: 0, flex: 1, paddingTop: 4 }}>
            <div
              style={{
                fontSize: 17,
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
            paddingTop: 2
          }}
        >
          <span style={{ fontWeight: 500 }}>
            {editCategory || `${entity} Category`}
          </span>
          <span style={{ fontWeight: 500 }}>
            {formatStorePinLocation({
              city: editCity,
              district: editDistrict,
              village: editVillage,
              address: editAddress,
              fallback: `${entity} City`
            })}
          </span>
        </div>
      </div>
    </div>
  );
};

