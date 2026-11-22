import React, { useState } from "react";
import { Store, MapPin, Clock, QrCode, Truck, Calculator, ChevronRight, CheckCircle2, LayoutGrid } from "lucide-react";
import type { ThemeType } from "../../../../../theme";
import { type StoreType, getStoreEntityLabel } from "../../../types";

export type HubNavigationMode = "hub" | "profile" | "location" | "schedule" | "payments" | "shipping" | "pos";

export interface HubNavigationMenuProps {
  theme: ThemeType;
  storeType?: StoreType;
  onNavigate: (mode: HubNavigationMode) => void;
  onOpenShippingModal: () => void;
  activeMode?: HubNavigationMode;
  isDesktopSplit?: boolean;
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
  activeMode,
  isDesktopSplit = false,
  isRegistered = true,
  completionStatus
}) => {
  const [hoveredId, setHoveredId] = useState<HubNavigationMode | null>(null);
  const entity = getStoreEntityLabel(storeType);

  const settingsItems: Array<{
    id: HubNavigationMode;
    label: string;
    icon: typeof Store;
    onClick: () => void;
    isComplete: boolean | undefined;
    isRequired: boolean;
  }> = [
    {
      id: "profile",
      label: "Profile & Identity",
      icon: Store,
      onClick: () => onNavigate("profile"),
      isComplete: completionStatus?.profile,
      isRequired: true
    },
    {
      id: "payments",
      label: "Payment Methods",
      icon: QrCode,
      onClick: () => onNavigate("payments"),
      isComplete: completionStatus?.payments,
      isRequired: true
    },
    {
      id: "location",
      label: "Address & GPS Location",
      icon: MapPin,
      onClick: () => onNavigate("location"),
      isComplete: completionStatus?.location,
      isRequired: true
    },
    {
      id: "schedule",
      label: "Operating Hours",
      icon: Clock,
      onClick: () => onNavigate("schedule"),
      isComplete: completionStatus?.schedule,
      isRequired: true
    },
    {
      id: "shipping",
      label: `${entity} Shipping`,
      icon: Truck,
      onClick: isDesktopSplit ? () => onNavigate("shipping") : onOpenShippingModal,
      isComplete: false,
      isRequired: false
    },
    {
      id: "pos",
      label: "POS & Cashier Settings",
      icon: Calculator,
      onClick: () => onNavigate("pos"),
      isComplete: false,
      isRequired: false
    }
  ];

  const menuItems = isDesktopSplit
    ? [
        {
          id: "hub" as const,
          label: `${entity} Overview`,
          icon: LayoutGrid,
          onClick: () => onNavigate("hub"),
          isComplete: undefined,
          isRequired: false
        },
        ...settingsItems
      ]
    : settingsItems;

  if (isDesktopSplit) {
    return (
      <div
        style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: 18,
          padding: 12,
          display: "flex",
          flexDirection: "column",
          gap: 4
        }}
      >
        <div
          style={{
            padding: "4px 10px 10px",
            fontSize: 13,
            fontWeight: 700,
            color: theme.inkSoft
          }}
        >
          {entity} Settings
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeMode === item.id;
          const isHovered = hoveredId === item.id;
          const activeBg = theme.isDark ? theme.surface2 : theme.bg;

          return (
            <button
              key={item.id}
              type="button"
              onClick={item.onClick}
              aria-current={isActive ? "page" : undefined}
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId((prev) => (prev === item.id ? null : prev))}
              style={{
                width: "100%",
                textAlign: "left",
                background: isActive ? activeBg : isHovered ? theme.surface2 : "transparent",
                border: `1px solid ${isActive ? theme.border : "transparent"}`,
                borderRadius: 10,
                padding: "10px 12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
                cursor: "pointer",
                transition: "background 0.15s ease, color 0.15s ease, border-color 0.15s ease"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                <div
                  style={{
                    color: isActive || isHovered ? theme.ink : theme.inkSoft,
                    display: "flex",
                    alignItems: "center",
                    flexShrink: 0,
                    transition: "color 0.15s ease"
                  }}
                >
                  <Icon size={17} />
                </div>
                <div
                  style={{
                    fontSize: 13.5,
                    fontWeight: isActive ? 600 : 500,
                    color: isActive || isHovered ? theme.ink : theme.inkSoft,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    transition: "color 0.15s ease"
                  }}
                >
                  {item.label}
                </div>
              </div>

              {!isRegistered && item.isRequired && (
                item.isComplete ? (
                  <span
                    title="Complete"
                    style={{ display: "inline-flex", alignItems: "center", color: "#10B981", flexShrink: 0 }}
                  >
                    <CheckCircle2 size={16} />
                  </span>
                ) : (
                  <span
                    title="Required"
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: "#EF4444",
                      lineHeight: 1,
                      flexShrink: 0
                    }}
                  >
                    *
                  </span>
                )
              )}
            </button>
          );
        })}
      </div>
    );
  }

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
        const isHovered = hoveredId === item.id;

        return (
          <button
            key={item.id}
            type="button"
            onClick={item.onClick}
            onMouseEnter={() => setHoveredId(item.id)}
            onMouseLeave={() => setHoveredId((prev) => (prev === item.id ? null : prev))}
            style={{
              width: "100%",
              textAlign: "left",
              background: isHovered ? theme.surface2 : "transparent",
              border: "none",
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
              cursor: "pointer",
              transition: "background 0.15s ease",
              borderBottom: isLast ? "none" : `1px solid ${theme.border}`
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
              <div style={{ color: theme.ink, display: "flex", alignItems: "center", flexShrink: 0 }}>
                <Icon size={22} />
              </div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: theme.ink,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap"
                }}
              >
                {item.label}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
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
          </button>
        );
      })}
    </div>
  );
};
