import { Bike, Car, Truck, Trash2, Check, Copy, RefreshCw, KeyRound } from "lucide-react";
import type { ThemeType } from "../../../../../theme";
import type { StoreLinkedCourier } from "../../../types";

const WhatsAppIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: "block" }}>
    <path
      d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2z"
      fill="#25D366"
    />
    <path
      d="M17.47 14.38c-.3-.15-1.78-.88-2.06-.98-.27-.1-.47-.15-.67.15-.2.3-.78.98-.95 1.18-.18.2-.35.23-.65.08-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.79-1.68-2.09-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.53.15-.17.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.68-1.63-.93-2.23-.25-.6-.49-.51-.68-.52-.17-.01-.38-.01-.58-.01-.2 0-.53.08-.8.38-.28.3-1.06 1.03-1.06 2.51s1.08 2.91 1.23 3.11c.15.2 2.13 3.25 5.15 4.55.72.31 1.28.5 1.72.64.72.23 1.38.2 1.9-.12.58-.35 1.78-1.45 2.03-2.08.25-.63.25-1.16.18-1.28-.08-.11-.28-.19-.58-.34z"
      fill="#FFFFFF"
    />
  </svg>
);

interface CourierCardProps {
  courier: StoreLinkedCourier;
  theme: ThemeType;
  isMobileView?: boolean;
  isCopied: boolean;
  onCopyCode: (code: string) => void;
  onShareWhatsApp: (courier: StoreLinkedCourier) => void;
  onRequestResetCode: (courier: { id: string; name: string }) => void;
  onRequestSetPin: (courier: { id: string; name: string; hasPin?: boolean }) => void;
  onRequestUnlink: (courier: { id: string; name: string }) => void;
}

export function CourierCard({
  courier,
  theme,
  isMobileView,
  isCopied,
  onCopyCode,
  onShareWhatsApp,
  onRequestResetCode,
  onRequestSetPin,
  onRequestUnlink
}: CourierCardProps) {
  const currentFleet = courier.vehicleType || "MOTOR";
  const courierCode = courier.activationCode || "•••";
  const isActivated = Boolean(courier.isActivated || courier.status === "ONLINE");

  return (
    <div
      style={{
        background: theme.surface2,
        borderRadius: 14,
        border: `1px solid ${theme.border}`,
        padding: isMobileView ? "12px 14px" : "14px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        transition: "all 0.15s ease"
      }}
    >
      {/* Row 1: Courier Name & Status (Left) + Trash Icon (Right) */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        {/* Left: Name & Status Inline */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, flex: 1 }}>
          <span
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: theme.ink,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis"
            }}
          >
            {courier.name}
          </span>

          {/* Status Indicator Dot & Label */}
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4.5,
              fontSize: 11.5,
              fontWeight: 600,
              color: courier.status === "OFFLINE" ? theme.inkSoft : courier.status === "BUSY" ? "#1D4ED8" : isActivated ? "#10B981" : "#D97706",
              flexShrink: 0
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: courier.status === "OFFLINE" ? "#94A3B8" : courier.status === "BUSY" ? "#3B82F6" : isActivated ? "#10B981" : "#F59E0B"
              }}
            />
            <span>
              {courier.status === "OFFLINE" ? "Offline" : courier.status === "BUSY" ? "Delivering" : isActivated ? "Online" : "Pending"}
            </span>
          </span>
        </div>

        {/* Right: Trash Icon */}
        <button
          type="button"
          onClick={() => onRequestUnlink({ id: courier.id, name: courier.name })}
          title="Remove Courier"
          style={{
            background: "transparent",
            border: "none",
            color: theme.inkSoft,
            cursor: "pointer",
            padding: 0,
            borderRadius: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 24,
            height: 24,
            flexShrink: 0,
            transition: "color 0.15s ease"
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#EF4444"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = theme.inkSoft; }}
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Row 2: Plate Number below Name (Left) + Vehicle Icon below Trash Icon (Right) */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        {/* Left: License Plate below name */}
        <span
          style={{
            fontSize: 12.5,
            fontWeight: 600,
            fontFamily: "monospace",
            color: courier.plateNumber && courier.plateNumber !== "-" ? theme.ink : theme.inkSoft,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis"
          }}
        >
          {courier.plateNumber && courier.plateNumber !== "-" ? courier.plateNumber : "No plate number"}
        </span>

        {/* Right: Vehicle icon below trash icon */}
        <div
          style={{
            width: 24,
            height: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: theme.ink,
            flexShrink: 0
          }}
          title={currentFleet === "PICKUP" ? "Pickup / Roda 3" : currentFleet === "MOBIL" ? "Mobil" : "Sepeda Motor"}
        >
          {currentFleet === "PICKUP" ? <Truck size={17} /> : currentFleet === "MOBIL" ? <Car size={17} /> : <Bike size={17} />}
        </div>
      </div>

      {/* Hairline Divider */}
      <div style={{ height: 1, background: theme.border, marginTop: 2, marginBottom: 2 }} />

      {/* Row 3: Activation Code (Click to Copy), PIN Badge & Actions */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
        {/* Left: Activation Code Box + PIN Status Pill */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <div
            onClick={() => courier.activationCode && onCopyCode(courier.activationCode)}
            title="Click to copy Activation Code"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              cursor: courier.activationCode ? "pointer" : "default",
              userSelect: "none",
              padding: "4px 8px",
              borderRadius: 8,
              background: theme.surface,
              border: `1px solid ${theme.border}`,
              transition: "background 0.15s ease"
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 600, color: theme.inkSoft }}>
              Code:
            </span>
            <span
              style={{
                fontFamily: "monospace",
                fontSize: 13,
                fontWeight: 800,
                color: theme.ink,
                letterSpacing: 0.5
              }}
            >
              {courierCode}
            </span>
            {courier.activationCode &&
              (isCopied ? (
                <span style={{ fontSize: 11, color: "#10B981", fontWeight: 700, display: "flex", alignItems: "center", gap: 2 }}>
                  <Check size={12} />
                  <span>Copied</span>
                </span>
              ) : (
                <Copy size={12} color={theme.inkSoft} />
              ))}
          </div>

          <span
            style={{
              fontSize: 10.5,
              fontWeight: 700,
              padding: "3px 7px",
              borderRadius: 999,
              background: courier.hasPin ? "rgba(16, 185, 129, 0.12)" : "rgba(245, 158, 11, 0.14)",
              color: courier.hasPin ? "#10B981" : "#D97706",
              border: `1px solid ${courier.hasPin ? "rgba(16, 185, 129, 0.3)" : "rgba(245, 158, 11, 0.35)"}`,
              whiteSpace: "nowrap"
            }}
          >
            {courier.hasPin ? "PIN Active" : "No PIN Set"}
          </span>
        </div>

        {/* Actions: Set/Change PIN, WhatsApp Direct Chat & Reset Code */}
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <button
            type="button"
            onClick={() => onRequestSetPin({ id: courier.id, name: courier.name, hasPin: courier.hasPin })}
            title={courier.hasPin ? "Change Courier PIN" : "Set Courier PIN"}
            style={{
              height: 24,
              padding: "0 8px",
              borderRadius: 999,
              border: `1px solid ${courier.hasPin ? theme.border : "#D97706"}`,
              background: theme.surface,
              color: courier.hasPin ? theme.ink : "#D97706",
              fontSize: 11,
              fontWeight: 700,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              flexShrink: 0,
              whiteSpace: "nowrap"
            }}
          >
            <KeyRound size={11} />
            <span>{courier.hasPin ? "Change PIN" : "Set PIN"}</span>
          </button>

          <button
            type="button"
            onClick={() => onShareWhatsApp(courier)}
            title={courier.phone ? `WhatsApp Chat (${courier.phone})` : "Send Code via WhatsApp"}
            style={{
              background: "transparent",
              border: "none",
              padding: 0,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              borderRadius: "50%",
              transition: "transform 0.15s ease, opacity 0.15s ease"
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1.12)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
          >
            <WhatsAppIcon size={21} />
          </button>

          <button
            type="button"
            onClick={() => onRequestResetCode({ id: courier.id, name: courier.name })}
            title="Reset Activation Code"
            style={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              border: `1px solid ${theme.border}`,
              background: theme.surface,
              color: theme.inkSoft,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              transition: "color 0.15s ease, border-color 0.15s ease"
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = theme.ink; (e.currentTarget as HTMLElement).style.borderColor = theme.ink; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = theme.inkSoft; (e.currentTarget as HTMLElement).style.borderColor = theme.border; }}
          >
            <RefreshCw size={11} />
          </button>
        </div>
      </div>
    </div>
  );
}
