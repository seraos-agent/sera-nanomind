import { useEffect } from "react";
import { ChevronLeft, Bike, Car, Truck } from "lucide-react";
import type { ThemeType } from "../../../../../theme";
import { registerBackHandler } from "../../../../../utils/backButton";

interface AddCourierModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  theme: ThemeType;
  isMobileView?: boolean;
  name: string;
  setName: (name: string) => void;
  phone: string;
  setPhone: (phone: string) => void;
  vehicle: "MOTOR" | "MOBIL" | "PICKUP";
  setVehicle: (vehicle: "MOTOR" | "MOBIL" | "PICKUP") => void;
  plate: string;
  setPlate: (plate: string) => void;
  newCourierPin: string;
  setNewCourierPin: (pin: string) => void;
  isAdding: boolean;
}

export function AddCourierModal({
  show,
  onClose,
  onSubmit,
  theme,
  isMobileView,
  name,
  setName,
  phone,
  setPhone,
  vehicle,
  setVehicle,
  plate,
  setPlate,
  newCourierPin,
  setNewCourierPin,
  isAdding
}: AddCourierModalProps) {
  const isFormValid = Boolean(name.trim() && /^\d{4,6}$/.test(newCourierPin.trim()));
  // Register sequential back handler for AddCourierModal
  useEffect(() => {
    if (!show) return;
    return registerBackHandler("add_courier_modal", 85, () => {
      onClose();
      return true;
    });
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: theme.bg,
        zIndex: 140,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden"
      }}
    >
      {/* 1. STICKY TOP HEADER */}
      <div
        style={{
          background: theme.surface,
          borderBottom: `1px solid ${theme.border}`,
          padding: isMobileView ? "14px 16px" : "16px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxSizing: "border-box",
          flexShrink: 0
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            type="button"
            onClick={onClose}
            title="Back"
            style={{
              background: theme.surface2,
              border: `1px solid ${theme.border}`,
              borderRadius: "50%",
              width: 36,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: theme.ink,
              transition: "all 0.15s ease",
              flexShrink: 0
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = theme.border; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = theme.surface2; }}
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: theme.ink }}>
              Add Store Courier
            </div>
            <div style={{ fontSize: 12, color: theme.inkSoft, marginTop: 1 }}>
              Register a new store delivery fleet member
            </div>
          </div>
        </div>
      </div>

      {/* 2. SCROLLABLE BODY */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: isMobileView ? "16px 14px 90px" : "24px 20px 90px",
          boxSizing: "border-box"
        }}
      >
        <div
          style={{
            maxWidth: 540,
            margin: "0 auto",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 16
          }}
        >
          {/* Card Form */}
          <div
            style={{
              padding: isMobileView ? "18px 16px" : "22px 20px",
              borderRadius: 20,
              border: `1px solid ${theme.border}`,
              background: theme.surface,
              boxSizing: "border-box"
            }}
          >
            <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: theme.ink, marginBottom: 7 }}>
                  Courier Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Example: Alex Johnson"
                  value={name}
                  onChange={e => {
                    const val = e.target.value.replace(/[^a-zA-Z\s'.`-]/g, "");
                    setName(val);
                  }}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    height: 48,
                    padding: "0 14px",
                    borderRadius: 14,
                    border: `1px solid ${theme.border}`,
                    background: theme.surface2,
                    color: theme.ink,
                    fontSize: 14,
                    fontWeight: 500,
                    outline: "none"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: theme.ink, marginBottom: 7 }}>
                  Courier WhatsApp Number *
                </label>
                <input
                  type="tel"
                  required
                  inputMode="numeric"
                  maxLength={15}
                  placeholder="Example: 08123456789"
                  value={phone}
                  onChange={e => {
                    const val = e.target.value.replace(/\D/g, "");
                    setPhone(val);
                  }}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    height: 48,
                    padding: "0 14px",
                    borderRadius: 14,
                    border: `1px solid ${theme.border}`,
                    background: theme.surface2,
                    color: theme.ink,
                    fontSize: 14,
                    fontWeight: 500,
                    outline: "none"
                  }}
                />
              </div>

              {/* Fleet Selection */}
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: theme.ink, marginBottom: 8 }}>
                  Assigned Vehicle Type
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => setVehicle("MOTOR")}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      padding: "12px 8px",
                      borderRadius: 12,
                      border: vehicle === "MOTOR" ? `1.5px solid ${theme.ink}` : `1px solid ${theme.border}`,
                      background: vehicle === "MOTOR" ? theme.surface2 : theme.bg,
                      color: vehicle === "MOTOR" ? theme.ink : theme.inkSoft,
                      fontSize: 12.5,
                      fontWeight: vehicle === "MOTOR" ? 700 : 500,
                      cursor: "pointer",
                      boxShadow: vehicle === "MOTOR" ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
                      transition: "all 0.15s ease"
                    }}
                  >
                    <Bike size={19} />
                    <span>Motorcycle</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVehicle("MOBIL")}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      padding: "12px 8px",
                      borderRadius: 12,
                      border: vehicle === "MOBIL" ? `1.5px solid ${theme.ink}` : `1px solid ${theme.border}`,
                      background: vehicle === "MOBIL" ? theme.surface2 : theme.bg,
                      color: vehicle === "MOBIL" ? theme.ink : theme.inkSoft,
                      fontSize: 12.5,
                      fontWeight: vehicle === "MOBIL" ? 700 : 500,
                      cursor: "pointer",
                      boxShadow: vehicle === "MOBIL" ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
                      transition: "all 0.15s ease"
                    }}
                  >
                    <Car size={19} />
                    <span>Car</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVehicle("PICKUP")}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      padding: "12px 8px",
                      borderRadius: 12,
                      border: vehicle === "PICKUP" ? `1.5px solid ${theme.ink}` : `1px solid ${theme.border}`,
                      background: vehicle === "PICKUP" ? theme.surface2 : theme.bg,
                      color: vehicle === "PICKUP" ? theme.ink : theme.inkSoft,
                      fontSize: 12.5,
                      fontWeight: vehicle === "PICKUP" ? 700 : 500,
                      cursor: "pointer",
                      boxShadow: vehicle === "PICKUP" ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
                      transition: "all 0.15s ease"
                    }}
                  >
                    <Truck size={19} />
                    <span>Pickup Truck</span>
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: theme.ink, marginBottom: 7 }}>
                  Vehicle License Plate (Optional)
                </label>
                <input
                  type="text"
                  maxLength={12}
                  placeholder="Example: AB 4589 SER"
                  value={plate}
                  onChange={e => {
                    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9\s-]/g, "");
                    setPlate(val);
                  }}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    height: 48,
                    padding: "0 14px",
                    borderRadius: 14,
                    border: `1px solid ${theme.border}`,
                    background: theme.surface2,
                    color: theme.ink,
                    fontSize: 14,
                    fontWeight: 600,
                    outline: "none"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: theme.ink, marginBottom: 7 }}>
                  Courier PIN (4-6 Numeric Digits, Required) <span style={{ color: "#EF4444" }}>*</span>
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  required
                  placeholder="Enter 4-6 digit PIN"
                  value={newCourierPin}
                  onChange={e => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setNewCourierPin(val);
                  }}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    height: 48,
                    padding: "0 14px",
                    borderRadius: 14,
                    border: `1px solid ${theme.border}`,
                    background: theme.surface2,
                    color: theme.ink,
                    fontSize: 15,
                    fontWeight: 700,
                    letterSpacing: 2,
                    outline: "none"
                  }}
                />
                <div style={{ fontSize: 11.5, color: theme.inkSoft, marginTop: 5 }}>
                  This PIN is required each time the courier logs in or switches shifts/devices.
                </div>
              </div>

              {/* Informative Note */}
              <div
                style={{
                  background: theme.surface2,
                  borderRadius: 14,
                  border: `1px solid ${theme.border}`,
                  padding: "12px 14px",
                  fontSize: 12.5,
                  color: theme.inkSoft,
                  lineHeight: 1.45
                }}
              >
                The system will generate a <b>Unique Activation Code</b>. Share the Activation Code and the courier's PIN separately to keep account security intact.
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    flex: 1,
                    height: 48,
                    borderRadius: 20,
                    border: `1px solid ${theme.border}`,
                    background: theme.surface2,
                    color: theme.ink,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isAdding || !isFormValid}
                  style={{
                    flex: 1.3,
                    height: 48,
                    borderRadius: 20,
                    border: "none",
                    background: theme.ink,
                    color: theme.bg,
                    fontSize: 14,
                    fontWeight: 700,
                    opacity: isAdding || !isFormValid ? 0.55 : 1,
                    cursor: isAdding || !isFormValid ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    boxShadow: "0 2px 6px rgba(0,0,0,0.08)"
                  }}
                >
                  {isAdding ? "Saving..." : "Save Courier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
