import { Truck, Plus } from "lucide-react";
import type { ThemeType } from "../../../../../theme";
import type { StoreLinkedCourier } from "../../../types";
import { CourierCard } from "./CourierCard";

interface CourierFleetListProps {
  linkedCouriers: StoreLinkedCourier[];
  theme: ThemeType;
  isMobileView?: boolean;
  copiedCourierCode: string | null;
  onOpenAddModal: () => void;
  onCopyCode: (code: string) => void;
  onShareWhatsApp: (courier: StoreLinkedCourier) => void;
  onRequestResetCode: (courier: { id: string; name: string }) => void;
  onRequestSetPin: (courier: { id: string; name: string; hasPin?: boolean }) => void;
  onRequestUnlink: (courier: { id: string; name: string }) => void;
}

export function CourierFleetList({
  linkedCouriers,
  theme,
  isMobileView,
  copiedCourierCode,
  onOpenAddModal,
  onCopyCode,
  onShareWhatsApp,
  onRequestResetCode,
  onRequestSetPin,
  onRequestUnlink
}: CourierFleetListProps) {
  return (
    <div
      style={{
        background: theme.surface,
        border: `1px solid ${theme.border}`,
        borderRadius: 20,
        padding: isMobileView ? "20px 16px" : "24px 22px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
      }}
    >
      {/* Store Couriers Header */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {/* Row 1: Title on left, Add button on right */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: theme.ink }}>
            Store Couriers
          </div>

          <button
            type="button"
            onClick={onOpenAddModal}
            style={{
              padding: "6px 16px",
              borderRadius: 20,
              background: theme.ink,
              color: theme.bg,
              border: "none",
              fontSize: 12.5,
              fontWeight: 700,
              cursor: "pointer",
              flexShrink: 0,
              boxShadow: "0 2px 5px rgba(0,0,0,0.06)",
              transition: "opacity 0.15s ease"
            }}
          >
            Add
          </button>
        </div>

        {/* Row 2: Subtitle on left, Courier count pill on right */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ fontSize: 12.5, color: theme.inkSoft }}>
            Staff delivering orders directly to buyers
          </div>

          <span
            style={{
              fontSize: 11.5,
              fontWeight: 600,
              color: theme.inkSoft,
              padding: "2px 8px",
              borderRadius: 10,
              background: theme.surface2,
              border: `1px solid ${theme.border}`,
              whiteSpace: "nowrap",
              flexShrink: 0
            }}
          >
            {linkedCouriers.length} Couriers
          </span>
        </div>
      </div>

      {/* Body: List or Clean Empty State */}
      {linkedCouriers.length === 0 ? (
        <div
          style={{
            padding: isMobileView ? "26px 14px" : "32px 16px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            background: theme.surface2,
            borderRadius: 16,
            border: `1px dashed ${theme.border}`
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: theme.surface,
              border: `1px solid ${theme.border}`,
              color: theme.inkSoft,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 10
            }}
          >
            <Truck size={20} />
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: theme.ink, margin: "0 0 4px 0" }}>
            No Registered Couriers Yet
          </div>
          <div
            style={{
              fontSize: 12.5,
              color: theme.inkSoft,
              margin: "0 0 16px 0",
              lineHeight: 1.45,
              maxWidth: 320
            }}
          >
            Register store staff to generate a unique Activation PIN for the courier app.
          </div>
          <button
            type="button"
            onClick={onOpenAddModal}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "9px 20px",
              borderRadius: 20,
              border: "none",
              background: theme.ink,
              color: theme.bg,
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
              transition: "opacity 0.15s ease"
            }}
          >
            <Plus size={14} />
            <span>Add First Courier</span>
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {linkedCouriers.map(courier => (
            <CourierCard
              key={courier.id}
              courier={courier}
              theme={theme}
              isMobileView={isMobileView}
              isCopied={Boolean(courier.activationCode && copiedCourierCode === courier.activationCode)}
              onCopyCode={onCopyCode}
              onShareWhatsApp={onShareWhatsApp}
              onRequestResetCode={onRequestResetCode}
              onRequestSetPin={onRequestSetPin}
              onRequestUnlink={onRequestUnlink}
            />
          ))}
        </div>
      )}
    </div>
  );
}
