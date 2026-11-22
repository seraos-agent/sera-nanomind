import React from "react";
import { Store, MapPin, Clock, QrCode, Truck, Calculator, ChevronRight, CheckCircle2 } from "lucide-react";
import type { ThemeType } from "../../../../../theme";
import { type StoreType, getStoreEntityLabel } from "../../../types";

export interface HubNavigationMenuProps {
  theme: ThemeType;
  storeType?: StoreType;
  onNavigate: (mode: "profile" | "location" | "schedule" | "payments" | "pos") => void;
  onOpenShippingModal: () => void;
  isRegistered?: boolean;
  completionStatus?: {
    profile: boolean;
    location: boolean;
    schedule: boolean;
    payments: boolean;
  };
}

export const HubNavigationMenu: React.FC<HubNavigationMenuProps> = ({
  theme,
  storeType,
  onNavigate,
  onOpenShippingModal,
  isRegistered = true,
  completionStatus
}) => {
  const entity = getStoreEntityLabel(storeType);
  const menuItems = [
    {
      id: "profile" as const,
      label: "Profile & Identity",
      icon: Store,
      onClick: () => onNavigate("profile"),
      isComplete: completionStatus?.profile,
      isRequired: true
    },
    {
      id: "payments" as const,
      label: "Payment Methods",
      icon: QrCode,
      onClick: () => onNavigate("payments"),
      isComplete: completionStatus?.payments,
      isRequired: true
    },
    {
      id: "location" as const,
      label: "Address & GPS Location",
      icon: MapPin,
      onClick: () => onNavigate("location"),
      isComplete: completionStatus?.location,
      isRequired: true
    },
    {
      id: "schedule" as const,
      label: "Operating Hours",
      icon: Clock,
      onClick: () => onNavigate("schedule"),
      isComplete: completionStatus?.schedule,
      isRequired: true
    },
    {
      id: "shipping" as const,
      label: `${entity} Shipping`,
      icon: Truck,
      onClick: onOpenShippingModal,
      isComplete: false,
      isRequired: false
    },
    {
      id: "pos" as const,
      label: "POS & Cashier Settings",
      icon: Calculator,
      onClick: () => onNavigate("pos"),
      isComplete: false,
      isRequired: false
    }
  ];

  return (
    <div
      style={{
        background: theme.surface,
        border: `1px solid ${theme.border}`,
        borderRadius: 20,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column"
      }}
    >
      {menuItems.map((item, idx) => {
        const Icon = item.icon;
        const isLast = idx === menuItems.length - 1;

        return (
          <div
            key={item.id}
            onClick={item.onClick}
            style={{
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer",
              transition: "background 0.15s ease",
              borderBottom: isLast ? "none" : `1px solid ${theme.border}`
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = theme.surface2;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ color: theme.ink, display: "flex", alignItems: "center" }}>
                <Icon size={22} />
              </div>
              <div style={{ fontSize: 16, fontWeight: 600, color: theme.ink }}>
                {item.label}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {!isRegistered && item.isRequired && (
                item.isComplete ? (
                  <span
                    title="Complete"
                    style={{ display: "inline-flex", alignItems: "center", color: "#10B981" }}
                  >
                    <CheckCircle2 size={17} />
                  </span>
                ) : (
                  <span
                    title="Required"
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: "#EF4444",
                      lineHeight: 1
                    }}
                  >
                    *
                  </span>
                )
              )}
              {!isRegistered && !item.isRequired && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: theme.inkSoft,
                    background: theme.surface2,
                    padding: "2px 8px",
                    borderRadius: 12
                  }}
                >
                  Optional
                </span>
              )}
              <ChevronRight size={18} color={theme.inkSoft} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

