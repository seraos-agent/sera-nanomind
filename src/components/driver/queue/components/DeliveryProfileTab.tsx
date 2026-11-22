import { ShieldCheck, LogOut } from "lucide-react";
import type { ThemeType } from "../../../../theme";
import type { DriverProfile } from "../../types";
import { getDriverFleet } from "../../types";
import { WhatsAppIcon } from "../utils/deliveryIcons";

function formatIndonesianPhone(phone?: string): string {
  if (!phone) return "-";
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("62")) {
    digits = "0" + digits.slice(2);
  }
  if (digits.length >= 10 && digits.length <= 13) {
    if (digits.length === 10) return digits.replace(/(\d{4})(\d{3})(\d{3})/, "$1-$2-$3");
    if (digits.length === 11) return digits.replace(/(\d{4})(\d{3})(\d{4})/, "$1-$2-$3");
    if (digits.length === 12) return digits.replace(/(\d{4})(\d{4})(\d{4})/, "$1-$2-$3");
    return digits.replace(/(\d{4})(\d{4})(\d{5})/, "$1-$2-$3");
  }
  return phone;
}

interface DeliveryProfileTabProps {
  theme: ThemeType;
  driver: DriverProfile;
  isMobileView?: boolean;
  onContactStore: () => void;
  onOpenProfile?: () => void;
  onUnlinkStore?: () => void;
}

export function DeliveryProfileTab({
  theme,
  driver,
  isMobileView,
  onContactStore,
  onUnlinkStore
}: DeliveryProfileTabProps) {
  const fleetType = getDriverFleet(driver);
  const fleetLabel =
    fleetType === "PICKUP"
      ? "Pickup / Cargo"
      : fleetType === "MOBIL"
        ? "Car / Box Van"
        : "Motorcycle";

  const hasPlate = Boolean(driver.plateNumber && driver.plateNumber !== "-");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* 1. Courier Identity & Fleet Card */}
      <div
        style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: 14,
          padding: isMobileView ? "14px 16px" : "18px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 14,
          boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
        }}
      >
        {/* Profile Header */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: theme.ink }}>
              {driver.name}
            </h3>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                fontSize: 11,
                fontWeight: 600,
                padding: "3px 8px",
                borderRadius: 12,
                background: theme.surface2,
                color: theme.status,
                border: `1px solid ${theme.border}`
              }}
            >
              <ShieldCheck size={12} color={theme.status} />
              <span>Verified Courier</span>
            </span>
          </div>

          <div style={{ fontSize: 12, color: theme.inkSoft }}>
            Account ID: <span style={{ color: theme.ink, fontFamily: "monospace", fontWeight: 600 }}>{driver.id}</span>
          </div>
        </div>

        {/* Contact & Fleet Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobileView ? "1fr" : "1fr 1fr",
            gap: 10,
            paddingTop: 12,
            borderTop: `1px solid ${theme.border}`
          }}
        >
          {/* Courier WhatsApp */}
          <div
            style={{
              background: theme.surface2,
              border: `1px solid ${theme.border}`,
              borderRadius: 10,
              padding: "10px 14px",
              display: "flex",
              flexDirection: "column",
              gap: 3
            }}
          >
            <span style={{ fontSize: 11.5, color: theme.inkSoft }}>
              WhatsApp Number
            </span>
            <span style={{ fontSize: 13.5, fontWeight: 600, color: theme.ink }}>
              {formatIndonesianPhone(driver.phone)}
            </span>
          </div>

          {/* Assigned Fleet */}
          <div
            style={{
              background: theme.surface2,
              border: `1px solid ${theme.border}`,
              borderRadius: 10,
              padding: "10px 14px",
              display: "flex",
              flexDirection: "column",
              gap: 3
            }}
          >
            <span style={{ fontSize: 11.5, color: theme.inkSoft }}>
              Assigned Fleet
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
              <span style={{ fontSize: 13.5, fontWeight: 600, color: theme.ink }}>
                {fleetLabel}
              </span>
              {hasPlate && (
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: 11,
                    fontWeight: 600,
                    color: theme.ink,
                    background: theme.surface,
                    border: `1px solid ${theme.border}`,
                    padding: "1px 6px",
                    borderRadius: 4
                  }}
                >
                  {driver.plateNumber}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Assigned Store Card */}
      <div
        style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: 14,
          padding: isMobileView ? "14px 16px" : "18px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
          boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: theme.ink }}>
              {driver.linkedStoreName || "SERA Partner Store"}
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={onContactStore}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                borderRadius: 8,
                background: theme.surface2,
                border: `1.5px solid ${theme.border}`,
                color: theme.ink,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
            >
              <WhatsAppIcon size={14} color={theme.status} />
              <span>Chat Store Cashier</span>
            </button>

            {onUnlinkStore && (
              <button
                type="button"
                onClick={onUnlinkStore}
                title="Leave this store's courier dispatch and enter a new store code"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 14px",
                  borderRadius: 8,
                  background: "transparent",
                  border: `1px solid ${theme.border}`,
                  color: "#EF4444",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.15s ease"
                }}
              >
                <LogOut size={13} color="#EF4444" />
                <span>Leave Store</span>
              </button>
            )}
          </div>
        </div>

        {/* Alamat Toko (Tanpa icon pin maps) */}
        {driver.linkedStoreAddress && (
          <div
            style={{
              fontSize: 12.5,
              color: theme.inkSoft,
              background: theme.surface2,
              border: `1px solid ${theme.border}`,
              borderRadius: 8,
              padding: "9px 12px",
              lineHeight: 1.45
            }}
          >
            {driver.linkedStoreAddress}
          </div>
        )}
      </div>
    </div>
  );
}

export default DeliveryProfileTab;
