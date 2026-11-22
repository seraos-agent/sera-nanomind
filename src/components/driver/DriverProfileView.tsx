import {
  Bike,
  Car,
  Truck,
  FileText,
  ShieldCheck,
  MessageCircle,
  Lock,
  LogOut
} from "lucide-react";
import type { ThemeType } from "../../theme";
import type { DriverProfile } from "./types";
import { getDriverFleet } from "./types";

interface DriverProfileViewProps {
  theme: ThemeType;
  driver: DriverProfile;
  onUpdateDriver?: (updated: DriverProfile) => void;
  isMobileView?: boolean;
  onUnlinkStore?: () => void;
}

export function DriverProfileView({
  theme,
  driver,
  isMobileView,
  onUnlinkStore
}: DriverProfileViewProps) {
  const currentFleet = getDriverFleet(driver);

  // Contact Store via WhatsApp
  const handleContactStore = () => {
    const storePhone = driver.linkedStorePhone || "";
    if (!storePhone) return;
    const cleanPhone = storePhone.replace(/^0/, "62").replace(/[^0-9]/g, "");
    const text = encodeURIComponent(
      `Hello Cashier / Admin at ${driver.linkedStoreName || "Store"}, this is ${driver.name} (Official Store Courier). Checking in regarding today's delivery schedule.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, "_blank");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* 1. STORE AFFILIATION CARD */}
      <div
        style={{
          background: theme.surface,
          border: `1.5px solid ${theme.border}`,
          borderRadius: 16,
          padding: isMobileView ? "16px 14px" : "20px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 14,
          boxShadow: "0 2px 8px rgba(0,0,0,0.03)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: theme.ink }}>
                {driver.linkedStoreName || "SERA Partner Store"}
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
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={handleContactStore}
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
              <MessageCircle size={14} color={theme.status} />
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

        {/* Store Address & Management Notice */}
        <div
          style={{
            background: theme.surface2,
            borderRadius: 10,
            border: `1px solid ${theme.border}`,
            padding: "12px 14px",
            display: "flex",
            flexDirection: "column",
            gap: 6
          }}
        >
          <div style={{ fontSize: 12.5, color: theme.ink, lineHeight: 1.45 }}>
            {driver.linkedStoreAddress || `Store Territory • ${driver.city || "Store City"}`}
          </div>
          <div style={{ fontSize: 11.5, color: theme.inkSoft, lineHeight: 1.4 }}>
            <b>Operations Note:</b> All delivery routes, task assignments, and fleet types are centrally managed by the store owner in the Merchant Store dashboard.
          </div>
        </div>
      </div>

      {/* 2. STORE ASSIGNED VEHICLE & FLEET SPECS (Managed by Store) */}
      <div
        style={{
          background: theme.surface,
          border: `1.5px solid ${theme.border}`,
          borderRadius: 16,
          padding: isMobileView ? "16px 14px" : "20px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 14,
          boxShadow: "0 2px 8px rgba(0,0,0,0.03)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {currentFleet === "PICKUP" ? (
              <Truck size={18} color={theme.accent} />
            ) : currentFleet === "MOBIL" ? (
              <Car size={18} color={theme.accent} />
            ) : (
              <Bike size={18} color={theme.accent} />
            )}
            <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: theme.ink }}>
              Store-Assigned Fleet
            </h4>
          </div>

          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              fontSize: 10.5,
              fontWeight: 600,
              padding: "2px 8px",
              borderRadius: 6,
              background: theme.surface2,
              border: `1px solid ${theme.border}`,
              color: theme.inkSoft
            }}
          >
            <Lock size={10} />
            <span>Assigned by Store</span>
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobileView ? "1fr" : "repeat(3, 1fr)",
            gap: 12
          }}
        >
          <div
            style={{
              background: theme.surface2,
              border: `1px solid ${theme.border}`,
              borderRadius: 10,
              padding: "12px 14px"
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 500, color: theme.inkSoft }}>
              Assigned Vehicle Type
            </span>
            <div style={{ fontSize: 13, fontWeight: 700, color: theme.ink, marginTop: 4 }}>
              {currentFleet === "PICKUP"
                ? "Pickup / Cargo (Heavy Load)"
                : currentFleet === "MOBIL"
                ? "Car / Van (Medium Load)"
                : "Motorcycle (Fast Delivery)"}
            </div>
          </div>

          <div
            style={{
              background: theme.surface2,
              border: `1px solid ${theme.border}`,
              borderRadius: 10,
              padding: "12px 14px"
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 500, color: theme.inkSoft }}>
              Vehicle Brand / Model
            </span>
            <div style={{ fontSize: 13, fontWeight: 600, color: theme.ink, marginTop: 4 }}>
              {driver.vehicleBrand || "Store Delivery Motorcycle"}
            </div>
          </div>

          <div
            style={{
              background: theme.surface2,
              border: `1px solid ${theme.border}`,
              borderRadius: 10,
              padding: "12px 14px"
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 500, color: theme.inkSoft }}>
              License Plate Number
            </span>
            <div style={{ fontSize: 13, fontWeight: 600, color: theme.ink, marginTop: 4 }}>
              {driver.plateNumber || "-"}
            </div>
          </div>
        </div>

        <div style={{ fontSize: 11.5, color: theme.inkSoft, fontStyle: "italic" }}>
          * If the store switches your assigned fleet (for example from Motorcycle to Van/Pickup for large loads), it updates automatically from the Merchant Store dashboard.
        </div>
      </div>

      {/* 3. COURIER IDENTITY & CONTACT CARD (Read-Only Store-Owned Pass) */}
      <div
        style={{
          background: theme.surface,
          border: `1.5px solid ${theme.border}`,
          borderRadius: 16,
          padding: isMobileView ? "16px 14px" : "20px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 14,
          boxShadow: "0 2px 8px rgba(0,0,0,0.03)"
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: theme.ink }}>
              {driver.name}
            </h3>
            <span
              style={{
                fontSize: 10.5,
                fontWeight: 600,
                padding: "2px 8px",
                borderRadius: 4,
                background: theme.surface2,
                border: `1px solid ${theme.border}`,
                color: theme.inkSoft,
                fontFamily: "monospace"
              }}
            >
              ID: {driver.id}
            </span>
          </div>

          <p style={{ margin: 0, fontSize: 12.5, color: theme.inkSoft }}>
            WA: {driver.phone || "-"}{driver.city ? ` • Territory: ${driver.city}` : ""}
          </p>
        </div>

        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            fontSize: 10.5,
            fontWeight: 600,
            padding: "4px 10px",
            borderRadius: 8,
            background: theme.surface2,
            border: `1px solid ${theme.border}`,
            color: theme.inkSoft,
            whiteSpace: "nowrap"
          }}
        >
          <Lock size={11} />
          <span>Managed by Store</span>
        </span>
      </div>

      {/* 4. VERIFICATION DOCUMENTS CARD (shown only if provided by store) */}
      {(driver.simNumber || driver.stnkNumber) && (
        <div
          style={{
            background: theme.surface,
            border: `1.5px solid ${theme.border}`,
            borderRadius: 16,
            padding: isMobileView ? "16px 14px" : "20px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
            boxShadow: "0 2px 8px rgba(0,0,0,0.03)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <FileText size={16} color={theme.accent} />
            <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: theme.ink }}>
              Store Courier Documents & Permits
            </h4>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobileView ? "1fr" : "repeat(2, 1fr)",
              gap: 12
            }}
          >
            {driver.simNumber && (
              <div
                style={{
                  background: theme.surface2,
                  border: `1px solid ${theme.border}`,
                  borderRadius: 10,
                  padding: "12px 14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}
              >
                <div>
                  <span style={{ fontSize: 11, fontWeight: 500, color: theme.inkSoft }}>
                    Driver License (SIM)
                  </span>
                  <div style={{ fontSize: 13, fontWeight: 600, color: theme.ink, marginTop: 2 }}>
                    {driver.simNumber}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 4, color: theme.accent, fontSize: 11, fontWeight: 600 }}>
                  <ShieldCheck size={14} />
                  <span>Valid</span>
                </div>
              </div>
            )}

            {driver.stnkNumber && (
              <div
                style={{
                  background: theme.surface2,
                  border: `1px solid ${theme.border}`,
                  borderRadius: 10,
                  padding: "12px 14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}
              >
                <div>
                  <span style={{ fontSize: 11, fontWeight: 500, color: theme.inkSoft }}>
                    Vehicle Registration (STNK)
                  </span>
                  <div style={{ fontSize: 13, fontWeight: 600, color: theme.ink, marginTop: 2 }}>
                    {driver.stnkNumber}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 4, color: theme.accent, fontSize: 11, fontWeight: 600 }}>
                  <ShieldCheck size={14} />
                  <span>Valid</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
