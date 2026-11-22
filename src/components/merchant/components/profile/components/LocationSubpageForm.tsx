import React from "react";
import { CheckCircle2, MapPin } from "lucide-react";
import type { ThemeType } from "../../../../../theme";
import { formatStorePinLocation } from "../../../../marketplace/utils/formatters";

export interface LocationSubpageFormProps {
  theme: ThemeType;
  editWhatsapp: string;
  setEditWhatsapp: (v: string) => void;
  isWhatsappVerified?: boolean;
  onOpenWaModal: () => void;
  editLatitude?: number;
  editLongitude?: number;
  onOpenLocationModal: () => void;
  editAddress: string;
  setEditAddress: (v: string) => void;
  editCity: string;
  setEditCity: (v: string) => void;
  editDistrict?: string;
  setEditDistrict?: (v: string) => void;
  editVillage?: string;
  setEditVillage?: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const LocationSubpageForm: React.FC<LocationSubpageFormProps> = ({
  theme,
  editWhatsapp,
  setEditWhatsapp,
  isWhatsappVerified,
  onOpenWaModal,
  editLatitude,
  editLongitude,
  onOpenLocationModal,
  editAddress,
  setEditAddress,
  editCity,
  setEditCity,
  editDistrict = "",
  setEditDistrict,
  editVillage = "",
  setEditVillage,
  onSubmit
}) => {
  return (
    <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header Info Banner */}
      <div
        style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: 18,
          padding: "16px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 4
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 700, color: theme.ink }}>
          Store Address & Contact
        </div>
        <div style={{ fontSize: 13, color: theme.inkSoft, lineHeight: 1.45 }}>
          Used for order pickup coordinates by couriers and buyers
        </div>
      </div>

      {/* 1. Store WhatsApp Card */}
      <div
        style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: 18,
          padding: "18px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 12
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: theme.ink }}>
            Store WhatsApp
          </div>

          {isWhatsappVerified ? (
            <div
              title="Verified Number"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 26,
                height: 26,
                borderRadius: "50%",
                color: "#10B981",
                background: "rgba(16, 185, 129, 0.12)",
                border: "1px solid rgba(16, 185, 129, 0.25)"
              }}
            >
              <CheckCircle2 size={16} />
            </div>
          ) : editWhatsapp.replace(/\D/g, "").length >= 9 ? (
            <button
              type="button"
              onClick={onOpenWaModal}
              style={{
                background: theme.surface2,
                border: `1px solid ${theme.border}`,
                color: theme.ink,
                fontSize: 11.5,
                fontWeight: 700,
                padding: "4px 12px",
                borderRadius: 20,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                transition: "background 0.15s ease"
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = theme.border)}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = theme.surface2)}
            >
              Verify
            </button>
          ) : null}
        </div>

        <input
          type="tel"
          inputMode="numeric"
          required
          value={editWhatsapp}
          onChange={(e) => setEditWhatsapp(e.target.value.replace(/\D/g, ""))}
          placeholder="081234567890"
          style={{
            width: "100%",
            padding: "13px 16px",
            borderRadius: 14,
            border: `1px solid ${theme.border}`,
            background: theme.surface2,
            color: theme.ink,
            fontSize: 14,
            fontWeight: 500,
            outline: "none",
            boxSizing: "border-box"
          }}
        />
      </div>

      {/* 2. Titik Lokasi di Peta Card */}
      <div
        style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: 18,
          padding: "18px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 12
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: theme.ink }}>
            Map Pin Location
          </div>
          {editLatitude !== undefined && editLongitude !== undefined ? (
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#10B981",
                background: "rgba(16, 185, 129, 0.12)",
                padding: "3px 8px",
                borderRadius: 6
              }}
            >
              GPS Pinned
            </span>
          ) : (
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: theme.inkSoft,
                background: theme.surface2,
                padding: "3px 8px",
                borderRadius: 6
              }}
            >
              Not Pinned Yet
            </span>
          )}
        </div>

        <div style={{ fontSize: 13, color: theme.inkSoft, lineHeight: 1.45 }}>
          {editLatitude !== undefined && editLongitude !== undefined ? (
            <span>
              Saved coordinates: {editLatitude.toFixed(6)}, {editLongitude.toFixed(6)}
            </span>
          ) : (
            <span>Pin your store location on the map so couriers and buyers can navigate accurately</span>
          )}
        </div>

        <button
          type="button"
          onClick={onOpenLocationModal}
          style={{
            width: "100%",
            padding: "12px 16px",
            borderRadius: 12,
            border: `1px solid ${theme.border}`,
            background: theme.surface2,
            color: theme.ink,
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            transition: "all 0.15s ease",
            marginTop: 4
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = theme.surface;
            (e.currentTarget as HTMLElement).style.borderColor = theme.ink;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = theme.surface2;
            (e.currentTarget as HTMLElement).style.borderColor = theme.border;
          }}
        >
          <MapPin size={16} color={theme.accent} />
          <span>
            {editLatitude !== undefined && editLongitude !== undefined
              ? "Update Map Pin Location"
              : "Open Map & Pin Store Location"}
          </span>
        </button>
      </div>

      {/* 3. Full Address Card */}
      <div
        style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: 18,
          padding: "18px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 12
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 700, color: theme.ink }}>
          Full Store Address
        </div>
        <textarea
          rows={3}
          required
          value={editAddress}
          onChange={(e) => setEditAddress(e.target.value)}
          placeholder="Street name, unit/building number, district, landmarks..."
          style={{
            width: "100%",
            minHeight: 120,
            padding: "14px 16px",
            borderRadius: 14,
            border: `1px solid ${theme.border}`,
            background: theme.surface2,
            color: theme.ink,
            fontSize: 14,
            fontWeight: 500,
            lineHeight: 1.55,
            outline: "none",
            boxSizing: "border-box",
            fontFamily: "inherit",
            resize: "vertical"
          }}
        />
      </div>

      {/* 4. Store Area Card (City, District, Neighborhood) */}
      <div
        style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: 18,
          padding: "18px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 12
        }}
      >
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: theme.ink }}>
            Store Area Details
          </div>
          <div style={{ fontSize: 12, color: theme.inkSoft, marginTop: 2 }}>
            Auto-filled when picking a map pin, or can be edited manually
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: theme.inkSoft }}>
            City / Regency
          </label>
          <input
            type="text"
            required
            value={editCity}
            onChange={(e) => setEditCity(e.target.value)}
            placeholder="Example: San Francisco / Malang"
            style={{
              width: "100%",
              padding: "13px 16px",
              borderRadius: 14,
              border: `1px solid ${theme.border}`,
              background: theme.surface2,
              color: theme.ink,
              fontSize: 14,
              fontWeight: 500,
              outline: "none",
              boxSizing: "border-box"
            }}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: theme.inkSoft }}>
              District
            </label>
            <input
              type="text"
              value={editDistrict}
              onChange={(e) => setEditDistrict?.(e.target.value)}
              placeholder="Example: Central / Lowokwaru"
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 12,
                border: `1px solid ${theme.border}`,
                background: theme.surface2,
                color: theme.ink,
                fontSize: 13.5,
                fontWeight: 500,
                outline: "none",
                boxSizing: "border-box"
              }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: theme.inkSoft }}>
              Neighborhood / Subdistrict
            </label>
            <input
              type="text"
              value={editVillage}
              onChange={(e) => setEditVillage?.(e.target.value)}
              placeholder="Optional (e.g., Downtown)"
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 12,
                border: `1px solid ${theme.border}`,
                background: theme.surface2,
                color: theme.ink,
                fontSize: 13.5,
                fontWeight: 500,
                outline: "none",
                boxSizing: "border-box"
              }}
            />
          </div>
        </div>

        {(editCity.trim() || editDistrict.trim()) && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              color: theme.inkSoft,
              background: theme.surface2,
              padding: "8px 12px",
              borderRadius: 10,
              border: `1px solid ${theme.border}`
            }}
          >
            <MapPin size={13} color="#EF4444" />
            <span>Marketplace pin label:</span>
            <strong style={{ color: theme.ink }}>
              {formatStorePinLocation({
                city: editCity,
                district: editDistrict,
                village: editVillage,
                address: editAddress,
                fallback: editCity || "-"
              })}
            </strong>
          </div>
        )}
      </div>

      <button
        type="submit"
        style={{
          padding: "13px 28px",
          borderRadius: 20,
          background: theme.ink,
          color: theme.bg,
          border: "none",
          fontSize: 14,
          fontWeight: 700,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 14px rgba(0, 0, 0, 0.12)",
          transition: "opacity 0.15s ease",
          marginTop: 4
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.opacity = "0.85";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.opacity = "1";
        }}
      >
        <span>Save Location</span>
      </button>
    </form>
  );
};

